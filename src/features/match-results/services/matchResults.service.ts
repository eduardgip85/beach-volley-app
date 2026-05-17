import { supabase } from "../../../config/supabase";
import { getMatchPlayers } from "../../match-players/services/matchPlayers.service";
import type { UserRole } from "../../auth/types/auth.types";
import type { EventMode } from "../../events/types/event.types";
import type {
    CreateMatchSetPayload,
    MatchResult,
    MatchResultValidationStatus,
    MatchSet,
    MatchWinningTeam,
} from "../types/matchResult.types";
import { calculateWinningTeam, validateMatchSets } from "../utils/matchResults.utils";
import { getActiveMatchPlayers } from "../../match-players/utils/matchPlayers.utils";
import { canValidateResult } from "../utils/matchResultValidation.utils";
import { applyRatingForMatchResult } from "../../ratings/services/rating.service";

interface MatchResultRow {
    id: string;
    event_id: string;
    submitted_by: string;
    winning_team: MatchWinningTeam | null;
    validation_status: MatchResultValidationStatus;
    validated_by: string | null;
    created_at: string;
    updated_at: string;
}

interface MatchSetRow {
    id: string;
    result_id: string;
    set_number: number;
    team_a_score: number;
    team_b_score: number;
}

interface EventValidationRow {
    id: string;
    type: string;
    created_by: string;
    mode?: EventMode | null;
    start_date?: string;
}

interface MatchEventWindowRow {
    id: string;
    type: string;
    mode: EventMode | null;
    start_date: string;
}

function mapMatchSet(row: MatchSetRow): MatchSet {
    return {
        id: row.id,
        resultId: row.result_id,
        setNumber: Number(row.set_number),
        teamAScore: Number(row.team_a_score),
        teamBScore: Number(row.team_b_score),
    };
}

function mapMatchResult(row: MatchResultRow, sets: MatchSet[]): MatchResult {
    return {
        id: row.id,
        eventId: row.event_id,
        submittedBy: row.submitted_by,
        winningTeam: row.winning_team,
        validationStatus: row.validation_status,
        validatedBy: row.validated_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        sets,
    };
}

async function getMatchEventWindow(eventId: string): Promise<MatchEventWindowRow> {
    const { data, error } = await supabase
        .from("events")
        .select("id, type, mode, start_date")
        .eq("id", eventId)
        .single<MatchEventWindowRow>();

    if (error) throw error;

    if (data.type !== "match") {
        throw new Error("Only match events can have results");
    }

    return data;
}

async function ensureMatchEvent(eventId: string) {
    await getMatchEventWindow(eventId);
}

function isSameLocalCalendarDay(left: Date, right: Date) {
    return (
        left.getFullYear() === right.getFullYear() &&
        left.getMonth() === right.getMonth() &&
        left.getDate() === right.getDate()
    );
}

async function ensureResultSubmissionDay(eventId: string) {
    const data = await getMatchEventWindow(eventId);
    const eventDate = new Date(data.start_date);
    const now = new Date();

    if (!isSameLocalCalendarDay(eventDate, now)) {
        throw new Error("Match results can only be submitted on the same day as the match");
    }
}

async function getEventValidationRow(
    eventId: string
): Promise<EventValidationRow> {
    const { data, error } = await supabase
        .from("events")
        .select("id, type, created_by")
        .eq("id", eventId)
        .single();

    if (error) throw error;

    return data;
}

async function getUserRole(userId: string): Promise<UserRole> {
    const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .single();

    if (error) throw error;

    return data.role;
}

async function ensureEnoughPlayersForResult(eventId: string) {
    const players = await getMatchPlayers(eventId);

    if (getActiveMatchPlayers(players).length < 4) {
        throw new Error("A match needs 4 active players before submitting results");
    }
}

async function getMatchResultRowById(resultId: string): Promise<MatchResultRow> {
    const { data, error } = await supabase
        .from("match_results")
        .select("*")
        .eq("id", resultId)
        .single();

    if (error) throw error;

    return data;
}

async function getMatchSetsByResultId(resultId: string): Promise<MatchSet[]> {
    const { data, error } = await supabase
        .from("match_sets")
        .select("*")
        .eq("result_id", resultId)
        .order("set_number", { ascending: true });

    if (error) throw error;

    return data.map(mapMatchSet);
}

async function getMatchResultById(resultId: string): Promise<MatchResult> {
    const [resultRow, sets] = await Promise.all([
        getMatchResultRowById(resultId),
        getMatchSetsByResultId(resultId),
    ]);

    return mapMatchResult(resultRow, sets);
}

function buildMatchSetRows(resultId: string, sets: CreateMatchSetPayload[]) {
    return sets.map((set) => ({
        result_id: resultId,
        set_number: set.setNumber,
        team_a_score: set.teamAScore,
        team_b_score: set.teamBScore,
    }));
}

export async function getMatchResultByEventId(
    eventId: string
): Promise<MatchResult | null> {
    const { data, error } = await supabase
        .from("match_results")
        .select("*")
        .eq("event_id", eventId)
        .maybeSingle();

    if (error) throw error;

    if (!data) {
        return null;
    }

    const sets = await getMatchSetsByResultId(data.id);

    return mapMatchResult(data, sets);
}

export async function getMatchResultsByEventIds(
    eventIds: string[]
): Promise<MatchResult[]> {
    if (eventIds.length === 0) {
        return [];
    }

    const { data, error } = await supabase
        .from("match_results")
        .select("*")
        .in("event_id", eventIds)
        .order("updated_at", { ascending: false });

    if (error) throw error;

    if (data.length === 0) {
        return [];
    }

    const resultIds = data.map((result) => result.id);

    const { data: setsData, error: setsError } = await supabase
        .from("match_sets")
        .select("*")
        .in("result_id", resultIds)
        .order("set_number", { ascending: true });

    if (setsError) throw setsError;

    const setsByResultId = new Map<string, MatchSet[]>();

    for (const row of setsData) {
        const matchSet = mapMatchSet(row);
        const existingSets = setsByResultId.get(matchSet.resultId) ?? [];
        existingSets.push(matchSet);
        setsByResultId.set(matchSet.resultId, existingSets);
    }

    return data.map((result) =>
        mapMatchResult(result, setsByResultId.get(result.id) ?? [])
    );
}

export async function getResultValidationEligibility(
    eventId: string,
    userId: string
): Promise<boolean> {
    const [event, result, matchPlayers, userRole] = await Promise.all([
        getEventValidationRow(eventId),
        getMatchResultByEventId(eventId),
        getMatchPlayers(eventId),
        getUserRole(userId),
    ]);

    if (event.type !== "match") {
        return false;
    }

    return canValidateResult({
        user: {
            id: userId,
            role: userRole,
        },
        event: {
            createdBy: event.created_by,
        },
        matchPlayers,
        result,
    });
}

export async function createMatchResult(
    eventId: string,
    submittedBy: string,
    sets: CreateMatchSetPayload[]
): Promise<MatchResult> {
    const eventRow = await getMatchEventWindow(eventId);
    validateMatchSets(sets, eventRow.mode);
    await ensureResultSubmissionDay(eventId);
    await ensureEnoughPlayersForResult(eventId);
    const winningTeam = calculateWinningTeam(sets, eventRow.mode);

    const { data, error } = await supabase
        .from("match_results")
        .insert({
            event_id: eventId,
            submitted_by: submittedBy,
            winning_team: winningTeam,
        })
        .select()
        .single();

    if (error) throw error;

    try {
        const { error: setsError } = await supabase
            .from("match_sets")
            .insert(buildMatchSetRows(data.id, sets));

        if (setsError) throw setsError;
    } catch (error) {
        await supabase.from("match_results").delete().eq("id", data.id);
        throw error;
    }

    return getMatchResultById(data.id);
}

export async function updateMatchResult(
    resultId: string,
    sets: CreateMatchSetPayload[]
): Promise<MatchResult> {
    const result = await getMatchResultRowById(resultId);
    const eventRow = await getMatchEventWindow(result.event_id);
    validateMatchSets(sets, eventRow.mode);

    if (result.validation_status === "accepted") {
        throw new Error("This match result is already validated and can no longer be edited");
    }

    await ensureResultSubmissionDay(result.event_id);
    await ensureEnoughPlayersForResult(result.event_id);
    const winningTeam = calculateWinningTeam(sets, eventRow.mode);

    const { error: deleteError } = await supabase
        .from("match_sets")
        .delete()
        .eq("result_id", resultId);

    if (deleteError) throw deleteError;

    const { error: insertError } = await supabase
        .from("match_sets")
        .insert(buildMatchSetRows(resultId, sets));

    if (insertError) throw insertError;

    const { error: updateError } = await supabase
        .from("match_results")
        .update({
            winning_team: winningTeam,
            validation_status: "pending",
            validated_by: null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", resultId);

    if (updateError) throw updateError;

    return getMatchResultById(resultId);
}

export const updateMatchResultSets = updateMatchResult;

export async function acceptMatchResult(
    resultId: string,
    validatorId: string
): Promise<MatchResult> {
    const result = await getMatchResultRowById(resultId);

    await ensureMatchEvent(result.event_id);

    const canValidate = await getResultValidationEligibility(
        result.event_id,
        validatorId
    );

    if (!canValidate) {
        throw new Error("You are not allowed to validate this result");
    }

    const { error } = await supabase
        .from("match_results")
        .update({
            validation_status: "accepted",
            validated_by: validatorId,
            updated_at: new Date().toISOString(),
        })
        .eq("id", resultId);

    if (error) throw error;

    const { error: statsError } = await supabase.rpc(
        "apply_match_result_profile_stats",
        {
            target_result_id: resultId,
        }
    );

    if (statsError) {
        await supabase
            .from("match_results")
            .update({
                validation_status: "pending",
                validated_by: null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", resultId);

        throw statsError;
    }

    const { error: eventUpdateError } = await supabase
        .from("events")
        .update({
            status: "completed",
            updated_at: new Date().toISOString(),
        })
        .eq("id", result.event_id);

    if (eventUpdateError) {
        await supabase
            .from("match_results")
            .update({
                validation_status: "pending",
                validated_by: null,
                updated_at: new Date().toISOString(),
            })
            .eq("id", resultId);

        throw eventUpdateError;
    }

    try {
        await applyRatingForMatchResult(resultId);
    } catch (error) {
        console.error("Competitive rating could not be applied after result acceptance", error);
    }

    return getMatchResultById(resultId);
}

export async function rejectMatchResult(
    resultId: string,
    validatorId: string
): Promise<MatchResult> {
    const result = await getMatchResultRowById(resultId);

    await ensureMatchEvent(result.event_id);

    const canValidate = await getResultValidationEligibility(
        result.event_id,
        validatorId
    );

    if (!canValidate) {
        throw new Error("You are not allowed to validate this result");
    }

    const { error } = await supabase
        .from("match_results")
        .update({
            validation_status: "rejected",
            validated_by: validatorId,
            updated_at: new Date().toISOString(),
        })
        .eq("id", resultId);

    if (error) throw error;

    return getMatchResultById(resultId);
}

export const validateMatchResult = acceptMatchResult;
