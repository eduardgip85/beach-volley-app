import { supabase } from "../../../config/supabase";
import type { MatchTeam } from "../../match-players/types/matchPlayer.types";
import {
    calculateEloDelta,
    calculateTeamAverageRating,
} from "../utils/elo.utils";

interface ApplyRatingForMatchResultResult {
    applied: boolean;
    reason: string;
}

interface MatchResultRow {
    id: string;
    event_id: string;
    winning_team: MatchTeam | null;
    validation_status: "pending" | "accepted" | "rejected" | "disputed" | "expired";
    rating_applied?: boolean | null;
}

interface EventRow {
    id: string;
    type: string;
    mode: string | null;
}

interface MatchPlayerRow {
    user_id: string;
    team: MatchTeam | null;
    status: "joined" | "confirmed" | "left" | "removed";
}

interface ProfileRatingRow {
    id: string;
    competitive_rating: number | null;
    rating_games_played: number | null;
}

async function getMatchResultRow(resultId: string): Promise<MatchResultRow> {
    const { data, error } = await supabase
        .from("match_results")
        .select("id, event_id, winning_team, validation_status, rating_applied")
        .eq("id", resultId)
        .single();

    if (error) throw error;

    return data;
}

async function getEventRow(eventId: string): Promise<EventRow> {
    const { data, error } = await supabase
        .from("events")
        .select("id, type, mode")
        .eq("id", eventId)
        .single();

    if (error) throw error;

    return data;
}

async function getMatchPlayers(eventId: string): Promise<MatchPlayerRow[]> {
    const { data, error } = await supabase
        .from("match_players")
        .select("user_id, team, status")
        .eq("event_id", eventId);

    if (error) throw error;

    return data;
}

async function getProfiles(userIds: string[]): Promise<ProfileRatingRow[]> {
    const { data, error } = await supabase
        .from("profiles")
        .select("id, competitive_rating, rating_games_played")
        .in("id", userIds);

    if (error) throw error;

    return data;
}

function getActiveRatingPlayers(players: MatchPlayerRow[]) {
    return players.filter(
        (player) => player.status === "joined" || player.status === "confirmed"
    );
}

export async function applyRatingForMatchResult(
    resultId: string
): Promise<ApplyRatingForMatchResultResult> {
    const result = await getMatchResultRow(resultId);

    if (result.validation_status !== "accepted") {
        return {
            applied: false,
            reason: "Only accepted match results can affect rating",
        };
    }

    if (result.rating_applied) {
        return {
            applied: false,
            reason: "Rating has already been applied for this match result",
        };
    }

    if (!result.winning_team) {
        throw new Error("Accepted match results need a winning team to apply rating");
    }

    const event = await getEventRow(result.event_id);

    if (event.type !== "match" || event.mode !== "competitive") {
        return {
            applied: false,
            reason: "Only accepted competitive matches can affect rating",
        };
    }

    const activePlayers = getActiveRatingPlayers(
        await getMatchPlayers(result.event_id)
    );
    const teamAPlayers = activePlayers.filter((player) => player.team === "team_a");
    const teamBPlayers = activePlayers.filter((player) => player.team === "team_b");

    if (teamAPlayers.length !== 2 || teamBPlayers.length !== 2) {
        throw new Error("Competitive rating requires two full teams of two players");
    }

    const allUserIds = activePlayers.map((player) => player.user_id);
    const profiles = await getProfiles(allUserIds);
    const profilesById = new Map(
        profiles.map((profile) => [
            profile.id,
            {
                id: profile.id,
                competitiveRating: profile.competitive_rating ?? 1000,
                ratingGamesPlayed: profile.rating_games_played ?? 0,
            },
        ])
    );

    const teamA = teamAPlayers.map((player) => {
        const profile = profilesById.get(player.user_id);

        if (!profile) {
            throw new Error("Missing player profile for rating calculation");
        }

        return profile;
    });

    const teamB = teamBPlayers.map((player) => {
        const profile = profilesById.get(player.user_id);

        if (!profile) {
            throw new Error("Missing player profile for rating calculation");
        }

        return profile;
    });

    const teamARating = calculateTeamAverageRating(teamA);
    const teamBRating = calculateTeamAverageRating(teamB);
    const winningTeam = result.winning_team;
    const losingTeam = winningTeam === "team_a" ? "team_b" : "team_a";
    const winnerDelta =
        winningTeam === "team_a"
            ? calculateEloDelta(teamARating, teamBRating, 1, 32)
            : calculateEloDelta(teamBRating, teamARating, 1, 32);
    const loserDelta =
        losingTeam === "team_a"
            ? calculateEloDelta(teamARating, teamBRating, 0, 32)
            : calculateEloDelta(teamBRating, teamARating, 0, 32);

    const winners = winningTeam === "team_a" ? teamA : teamB;
    const losers = losingTeam === "team_a" ? teamA : teamB;

    for (const player of winners) {
        const { error } = await supabase
            .from("profiles")
            .update({
                competitive_rating: Math.max(0, player.competitiveRating + winnerDelta),
                rating_games_played: player.ratingGamesPlayed + 1,
            })
            .eq("id", player.id);

        if (error) throw error;
    }

    for (const player of losers) {
        const { error } = await supabase
            .from("profiles")
            .update({
                competitive_rating: Math.max(0, player.competitiveRating + loserDelta),
                rating_games_played: player.ratingGamesPlayed + 1,
            })
            .eq("id", player.id);

        if (error) throw error;
    }

    const { error: resultUpdateError } = await supabase
        .from("match_results")
        .update({
            rating_applied: true,
            rating_applied_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        })
        .eq("id", resultId);

    if (resultUpdateError) throw resultUpdateError;

    return {
        applied: true,
        reason: "Competitive Elo rating applied successfully",
    };
}

export const applyCompetitiveMatchRating = applyRatingForMatchResult;
