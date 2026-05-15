import { supabase } from "../../../config/supabase";
import {
    getEventRegisteredUserIds,
    isUserRegistered,
    registerToEvent,
    unregisterFromEvent,
} from "../../registrations/services/registrations.service";
import type {
    MatchPlayer,
    MatchPlayerProfile,
    MatchPlayerStatus,
    MatchTeam,
} from "../types/matchPlayer.types";
import {
    countTeamPlayers,
    getActiveMatchPlayers,
    getAutoAssignedTeam,
} from "../utils/matchPlayers.utils";

interface MatchPlayerProfileRow {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
}

interface MatchPlayerRow {
    id: string;
    event_id: string;
    user_id: string;
    team: MatchTeam | null;
    status: MatchPlayerStatus;
    joined_at: string;
    updated_at: string;
    profile: MatchPlayerProfileRow[] | MatchPlayerProfileRow;
}

interface MatchEventRow {
    id: string;
    type: string;
    max_participants: number;
}

interface MatchResultLockRow {
    validation_status: string;
}

const matchPlayerProfileSelect = "id, full_name, email, avatar_url";

const matchPlayerSelect = `
    id,
    event_id,
    user_id,
    team,
    status,
    joined_at,
    updated_at,
    profile:profiles!match_players_user_id_fkey(${matchPlayerProfileSelect})
`;

function normalizeRelation<T>(relation: T[] | T): T {
    return Array.isArray(relation) ? relation[0] : relation;
}

function mapProfile(row: MatchPlayerProfileRow): MatchPlayerProfile {
    return {
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        avatarUrl: row.avatar_url,
    };
}

function mapMatchPlayer(row: MatchPlayerRow): MatchPlayer {
    return {
        id: row.id,
        eventId: row.event_id,
        userId: row.user_id,
        team: row.team,
        status: row.status,
        joinedAt: row.joined_at,
        updatedAt: row.updated_at,
        profile: mapProfile(normalizeRelation(row.profile)),
    };
}

async function getEventRow(eventId: string): Promise<MatchEventRow> {
    const { data, error } = await supabase
        .from("events")
        .select("id, type, max_participants")
        .eq("id", eventId)
        .single();

    if (error) throw error;

    return data;
}

async function ensureMatchEvent(eventId: string) {
    const event = await getEventRow(eventId);

    if (event.type !== "match") {
        throw new Error("Only match events can use player assignments");
    }

    return event;
}

async function ensureMatchRosterIsOpen(eventId: string) {
    const { data, error } = await supabase
        .from("match_results")
        .select("validation_status")
        .eq("event_id", eventId)
        .eq("validation_status", "accepted")
        .maybeSingle<MatchResultLockRow>();

    if (error) throw error;

    if (data) {
        throw new Error("This match is locked because the result was already validated");
    }
}

async function getMatchPlayerRow(
    eventId: string,
    userId: string
): Promise<MatchPlayerRow | null> {
    const { data, error } = await supabase
        .from("match_players")
        .select(matchPlayerSelect)
        .eq("event_id", eventId)
        .eq("user_id", userId)
        .maybeSingle();

    if (error) throw error;

    return data;
}

async function getStoredMatchPlayers(eventId: string): Promise<MatchPlayer[]> {
    const { data, error } = await supabase
        .from("match_players")
        .select(matchPlayerSelect)
        .eq("event_id", eventId)
        .order("joined_at", { ascending: true });

    if (error) throw error;

    return data.map(mapMatchPlayer);
}

async function backfillMatchPlayersFromRegistrations(eventId: string) {
    const [registeredUserIds, existingPlayers] = await Promise.all([
        getEventRegisteredUserIds(eventId),
        getStoredMatchPlayers(eventId),
    ]);

    if (registeredUserIds.length === 0) {
        return existingPlayers;
    }

    const existingPlayersByUserId = new Map(
        existingPlayers.map((player) => [player.userId, player])
    );
    const activePlayers = [...getActiveMatchPlayers(existingPlayers)];

    for (const userId of registeredUserIds) {
        const existingPlayer = existingPlayersByUserId.get(userId);

        if (existingPlayer && (existingPlayer.status === "joined" || existingPlayer.status === "confirmed")) {
            continue;
        }

        if (activePlayers.length >= 4) {
            break;
        }

        const team = getAutoAssignedTeam(activePlayers);

        if (existingPlayer) {
            const { data, error } = await supabase
                .from("match_players")
                .update({
                    team,
                    status: "joined",
                    updated_at: new Date().toISOString(),
                })
                .eq("event_id", eventId)
                .eq("user_id", userId)
                .select(matchPlayerSelect)
                .single();

            if (error) throw error;

            const restoredPlayer = mapMatchPlayer(data);
            activePlayers.push(restoredPlayer);
            existingPlayersByUserId.set(userId, restoredPlayer);
            continue;
        }

        const { data, error } = await supabase
            .from("match_players")
            .insert({
                event_id: eventId,
                user_id: userId,
                team,
                status: "joined",
            })
            .select(matchPlayerSelect)
            .single();

        if (error) throw error;

        const insertedPlayer = mapMatchPlayer(data);
        activePlayers.push(insertedPlayer);
        existingPlayersByUserId.set(userId, insertedPlayer);
    }

    return getStoredMatchPlayers(eventId);
}

async function syncRegistrationState(
    eventId: string,
    userId: string,
    shouldBeRegistered: boolean
) {
    const isRegistered = await isUserRegistered(eventId, userId);

    if (shouldBeRegistered && !isRegistered) {
        await registerToEvent(eventId, userId);
    }

    if (!shouldBeRegistered && isRegistered) {
        await unregisterFromEvent(eventId, userId);
    }
}

export async function getMatchPlayers(eventId: string): Promise<MatchPlayer[]> {
    const event = await getEventRow(eventId);

    if (event.type !== "match") {
        return [];
    }

    const players = await getStoredMatchPlayers(eventId);

    if (players.length === 0) {
        return backfillMatchPlayersFromRegistrations(eventId);
    }

    return players;
}

export async function getMatchPlayersByEventIds(
    eventIds: string[]
): Promise<MatchPlayer[]> {
    if (eventIds.length === 0) {
        return [];
    }

    const { data, error } = await supabase
        .from("match_players")
        .select(matchPlayerSelect)
        .in("event_id", eventIds)
        .order("joined_at", { ascending: true });

    if (error) throw error;

    return data.map(mapMatchPlayer);
}

export async function joinMatch(
    eventId: string,
    userId: string
): Promise<MatchPlayer> {
    await ensureMatchEvent(eventId);
    await ensureMatchRosterIsOpen(eventId);

    const [players, existingRow] = await Promise.all([
        getMatchPlayers(eventId),
        getMatchPlayerRow(eventId, userId),
    ]);

    if (existingRow && (existingRow.status === "joined" || existingRow.status === "confirmed")) {
        await syncRegistrationState(eventId, userId, true);
        return mapMatchPlayer(existingRow);
    }

    const activePlayers = getActiveMatchPlayers(players);

    if (activePlayers.length >= 4) {
        throw new Error("This match is already full");
    }

    const team = getAutoAssignedTeam(activePlayers);

    if (countTeamPlayers(activePlayers, team) >= 2) {
        throw new Error("That team is already full");
    }

    let player: MatchPlayer;

    if (existingRow) {
        const { data, error } = await supabase
            .from("match_players")
            .update({
                team,
                status: "joined",
                updated_at: new Date().toISOString(),
            })
            .eq("event_id", eventId)
            .eq("user_id", userId)
            .select(matchPlayerSelect)
            .single();

        if (error) throw error;

        player = mapMatchPlayer(data);
    } else {
        const { data, error } = await supabase
            .from("match_players")
            .insert({
                event_id: eventId,
                user_id: userId,
                team,
                status: "joined",
            })
            .select(matchPlayerSelect)
            .single();

        if (error) throw error;

        player = mapMatchPlayer(data);
    }

    try {
        await syncRegistrationState(eventId, userId, true);
        return player;
    } catch (error) {
        await supabase
            .from("match_players")
            .update({
                status: existingRow?.status ?? "left",
                team: existingRow?.team ?? null,
                updated_at: new Date().toISOString(),
            })
            .eq("event_id", eventId)
            .eq("user_id", userId);
        throw error;
    }
}

export async function leaveMatch(
    eventId: string,
    userId: string
): Promise<void> {
    await ensureMatchEvent(eventId);
    await ensureMatchRosterIsOpen(eventId);

    const existingRow = await getMatchPlayerRow(eventId, userId);

    if (!existingRow || (existingRow.status !== "joined" && existingRow.status !== "confirmed")) {
        return;
    }

    const { error } = await supabase
        .from("match_players")
        .update({
            status: "left",
            team: null,
            updated_at: new Date().toISOString(),
        })
        .eq("event_id", eventId)
        .eq("user_id", userId);

    if (error) throw error;

    await syncRegistrationState(eventId, userId, false);
}

export async function assignPlayerToTeam(
    eventId: string,
    userId: string,
    team: MatchTeam
): Promise<MatchPlayer> {
    await ensureMatchEvent(eventId);
    await ensureMatchRosterIsOpen(eventId);

    const [existingRow, players] = await Promise.all([
        getMatchPlayerRow(eventId, userId),
        getMatchPlayers(eventId),
    ]);

    if (!existingRow || (existingRow.status !== "joined" && existingRow.status !== "confirmed")) {
        throw new Error("This user is not an active player in the match");
    }

    const otherPlayers = getActiveMatchPlayers(players).filter(
        (player) => player.userId !== userId
    );

    if (countTeamPlayers(otherPlayers, team) >= 2) {
        throw new Error("That team is already full");
    }

    const { data, error } = await supabase
        .from("match_players")
        .update({
            team,
            updated_at: new Date().toISOString(),
        })
        .eq("event_id", eventId)
        .eq("user_id", userId)
        .select(matchPlayerSelect)
        .single();

    if (error) throw error;

    return mapMatchPlayer(data);
}

export async function removePlayerFromMatch(
    eventId: string,
    userId: string
): Promise<void> {
    await ensureMatchEvent(eventId);
    await ensureMatchRosterIsOpen(eventId);

    const existingRow = await getMatchPlayerRow(eventId, userId);

    if (!existingRow) {
        return;
    }

    const { error } = await supabase
        .from("match_players")
        .update({
            status: "removed",
            team: null,
            updated_at: new Date().toISOString(),
        })
        .eq("event_id", eventId)
        .eq("user_id", userId);

    if (error) throw error;

    await syncRegistrationState(eventId, userId, false);
}
