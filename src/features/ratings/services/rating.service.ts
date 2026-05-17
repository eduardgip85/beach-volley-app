import { supabase } from "../../../config/supabase";

interface ApplyRatingForMatchResultResult {
    applied: boolean;
    reason: string;
}

interface ApplyCompetitiveRatingRpcResult {
    applied?: boolean;
    reason?: string;
}

export async function applyRatingForMatchResult(
    resultId: string
): Promise<ApplyRatingForMatchResultResult> {
    const { data, error } = await supabase.rpc("apply_competitive_match_rating", {
        target_result_id: resultId,
    });

    if (error) throw error;

    const payload = (data ?? {}) as ApplyCompetitiveRatingRpcResult;

    return {
        applied: payload.applied ?? false,
        reason:
            payload.reason ??
            "Competitive rating could not be applied for this match result",
    };
}

export const applyCompetitiveMatchRating = applyRatingForMatchResult;
