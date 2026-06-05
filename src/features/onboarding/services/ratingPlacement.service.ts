import { supabase } from "../../../config/supabase";
import type {
    AvailabilityStatus,
    PreferredCourtSide,
    PreferredHand,
    PreferredMatchMode,
    PreferredPlayDay,
} from "../../auth/types/auth.types";
import type { RatingPlacementAnswers } from "../types/ratingPlacement.types";
import {
    calculateRatingPlacementResult,
    PROVISIONAL_MATCHES_TOTAL,
} from "../utils/ratingPlacementSurvey";

interface BasicOnboardingInput {
    userId: string;
    country: string;
    city?: string | null;
    preferredMatchMode: NonNullable<PreferredMatchMode>;
    availabilityStatus?: AvailabilityStatus;
    preferredPlayDays?: PreferredPlayDay[];
    preferredHand?: PreferredHand;
    preferredCourtSide?: PreferredCourtSide;
    hasBall?: boolean;
    hasNet?: boolean;
}

interface CompleteRatingPlacementInput {
    userId: string;
    answers: RatingPlacementAnswers;
    country: string;
    city?: string | null;
    preferredMatchMode?: NonNullable<PreferredMatchMode>;
    availabilityStatus?: AvailabilityStatus;
    preferredPlayDays?: PreferredPlayDay[];
    preferredHand?: PreferredHand;
    preferredCourtSide?: PreferredCourtSide;
    hasBall?: boolean;
    hasNet?: boolean;
}

export async function completeRatingPlacement({
    userId,
    answers,
    country,
    city,
    preferredMatchMode,
    availabilityStatus,
    preferredPlayDays,
    preferredHand,
    preferredCourtSide,
    hasBall,
    hasNet,
}: CompleteRatingPlacementInput) {
    const result = calculateRatingPlacementResult(answers);
    const profilePayload = buildBasicOnboardingPayload({
        country,
        city,
        preferredMatchMode: preferredMatchMode ?? "competitive",
        availabilityStatus,
        preferredPlayDays,
        preferredHand,
        preferredCourtSide,
        hasBall,
        hasNet,
    });

    const { error } = await supabase
        .from("profiles")
        .update({
            ...profilePayload,
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

function buildBasicOnboardingPayload({
    country,
    city,
    preferredMatchMode,
    availabilityStatus,
    preferredPlayDays,
    preferredHand,
    preferredCourtSide,
    hasBall,
    hasNet,
}: Omit<BasicOnboardingInput, "userId">) {
    return {
        country,
        city: city?.trim() ? city.trim() : null,
        preferred_match_mode: preferredMatchMode,
        ...(availabilityStatus !== undefined
            ? { availability_status: availabilityStatus }
            : {}),
        ...(preferredPlayDays !== undefined
            ? { preferred_play_days: preferredPlayDays }
            : {}),
        ...(preferredHand !== undefined ? { preferred_hand: preferredHand } : {}),
        ...(preferredCourtSide !== undefined
            ? { preferred_court_side: preferredCourtSide }
            : {}),
        ...(hasBall !== undefined ? { has_ball: hasBall } : {}),
        ...(hasNet !== undefined ? { has_net: hasNet } : {}),
    };
}

export async function completeBasicOnboarding(input: BasicOnboardingInput) {
    const { userId, ...profileInput } = input;
    const { error } = await supabase
        .from("profiles")
        .update(buildBasicOnboardingPayload(profileInput))
        .eq("id", userId);

    if (error) {
        throw error;
    }
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
