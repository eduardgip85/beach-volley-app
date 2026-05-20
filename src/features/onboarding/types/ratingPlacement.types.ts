export type RatingPlacementQuestionId =
    | "experience_duration"
    | "weekly_frequency"
    | "tournament_experience"
    | "ball_control"
    | "sideout_consistency"
    | "tactical_systems"
    | "defense_reading"
    | "local_level";

export type RatingPlacementAnswerValue =
    | "under_6_months"
    | "six_to_twelve_months"
    | "one_to_three_years"
    | "three_to_six_years"
    | "six_plus_years"
    | "occasional"
    | "once_per_week"
    | "twice_per_week"
    | "three_to_four_per_week"
    | "five_plus_per_week"
    | "none"
    | "friendly_ladders"
    | "local_open"
    | "regular_local_tournaments"
    | "regional_or_national"
    | "beginner"
    | "basic"
    | "stable"
    | "advanced"
    | "high_level"
    | "learning"
    | "reliable_casual"
    | "competitive_ready"
    | "advanced_competitive"
    | "heard_terms"
    | "understands_sideout_transition"
    | "understands_block_defense_calls"
    | "reads_systems_confidently"
    | "rarely"
    | "sometimes"
    | "often"
    | "usually"
    | "starter"
    | "lower_intermediate"
    | "intermediate"
    | "advanced_local"
    | "top_local";

export type RatingPlacementAnswers = Partial<
    Record<RatingPlacementQuestionId, RatingPlacementAnswerValue>
>;

export interface RatingPlacementOption {
    value: RatingPlacementAnswerValue;
    labelKey: string;
    score: number;
}

export interface RatingPlacementQuestion {
    id: RatingPlacementQuestionId;
    titleKey: string;
    descriptionKey: string;
    options: RatingPlacementOption[];
}

export interface RatingPlacementStep {
    id: string;
    eyebrowKey: string;
    titleKey: string;
    bodyKey: string;
    questionIds: RatingPlacementQuestionId[];
}

export interface RatingPlacementResult {
    score: number;
    estimatedRating: number;
    provisionalMatchesRemaining: number;
}
