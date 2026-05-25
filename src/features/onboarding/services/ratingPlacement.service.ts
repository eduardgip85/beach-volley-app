import { supabase } from "../../../config/supabase";
import type { RatingPlacementAnswers } from "../types/ratingPlacement.types";
import {
    calculateRatingPlacementResult,
    PROVISIONAL_MATCHES_TOTAL,
} from "../utils/ratingPlacementSurvey";

interface CompleteRatingPlacementInput {
    userId: string;
    answers: RatingPlacementAnswers;
    country: string;
}

export async function completeRatingPlacement({
    userId,
    answers,
    country,
}: CompleteRatingPlacementInput) {
    const result = calculateRatingPlacementResult(answers);

    const { error } = await supabase
        .from("profiles")
        .update({
            country,
            competitive_rating: result.estimatedRating,
            rating_placement_completed_at: new Date().toISOString(),
            rating_placement_estimate: result.estimatedRating,
            rating_placement_score: result.score,
            rating_placement_answers: answers,
            provisional_rating_matches_remaining: PROVISIONAL_MATCHES_TOTAL,
        })
        .eq("id", userId);

    if (error) {
        throw error;
    }

    return result;
}

export async function saveOnboardingCountry(userId: string, country: string) {
    const { error } = await supabase
        .from("profiles")
        .update({
            country,
        })
        .eq("id", userId);

    if (error) {
        throw error;
    }
}
