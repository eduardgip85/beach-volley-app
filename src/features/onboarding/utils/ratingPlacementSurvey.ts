import type {
    RatingPlacementAnswers,
    RatingPlacementQuestion,
    RatingPlacementQuestionId,
    RatingPlacementResult,
    RatingPlacementStep,
} from "../types/ratingPlacement.types";

export const PROVISIONAL_MATCHES_TOTAL = 10;

export const ratingPlacementQuestions: RatingPlacementQuestion[] = [
    {
        id: "experience_duration",
        titleKey: "onboardingRating.questions.experienceDuration.title",
        descriptionKey: "onboardingRating.questions.experienceDuration.description",
        options: [
            {
                value: "under_6_months",
                labelKey: "onboardingRating.options.experience.under_6_months",
                score: 0,
            },
            {
                value: "six_to_twelve_months",
                labelKey: "onboardingRating.options.experience.six_to_twelve_months",
                score: 4,
            },
            {
                value: "one_to_three_years",
                labelKey: "onboardingRating.options.experience.one_to_three_years",
                score: 8,
            },
            {
                value: "three_to_six_years",
                labelKey: "onboardingRating.options.experience.three_to_six_years",
                score: 12,
            },
            {
                value: "six_plus_years",
                labelKey: "onboardingRating.options.experience.six_plus_years",
                score: 16,
            },
        ],
    },
    {
        id: "weekly_frequency",
        titleKey: "onboardingRating.questions.weeklyFrequency.title",
        descriptionKey: "onboardingRating.questions.weeklyFrequency.description",
        options: [
            {
                value: "occasional",
                labelKey: "onboardingRating.options.frequency.occasional",
                score: 0,
            },
            {
                value: "once_per_week",
                labelKey: "onboardingRating.options.frequency.once_per_week",
                score: 4,
            },
            {
                value: "twice_per_week",
                labelKey: "onboardingRating.options.frequency.twice_per_week",
                score: 8,
            },
            {
                value: "three_to_four_per_week",
                labelKey: "onboardingRating.options.frequency.three_to_four_per_week",
                score: 10,
            },
            {
                value: "five_plus_per_week",
                labelKey: "onboardingRating.options.frequency.five_plus_per_week",
                score: 12,
            },
        ],
    },
    {
        id: "tournament_experience",
        titleKey: "onboardingRating.questions.tournamentExperience.title",
        descriptionKey: "onboardingRating.questions.tournamentExperience.description",
        options: [
            {
                value: "none",
                labelKey: "onboardingRating.options.tournaments.none",
                score: 0,
            },
            {
                value: "friendly_ladders",
                labelKey: "onboardingRating.options.tournaments.friendly_ladders",
                score: 4,
            },
            {
                value: "local_open",
                labelKey: "onboardingRating.options.tournaments.local_open",
                score: 8,
            },
            {
                value: "regular_local_tournaments",
                labelKey:
                    "onboardingRating.options.tournaments.regular_local_tournaments",
                score: 12,
            },
            {
                value: "regional_or_national",
                labelKey: "onboardingRating.options.tournaments.regional_or_national",
                score: 18,
            },
        ],
    },
    {
        id: "local_level",
        titleKey: "onboardingRating.questions.localLevel.title",
        descriptionKey: "onboardingRating.questions.localLevel.description",
        options: [
            {
                value: "starter",
                labelKey: "onboardingRating.options.localLevel.starter",
                score: 0,
            },
            {
                value: "lower_intermediate",
                labelKey: "onboardingRating.options.localLevel.lower_intermediate",
                score: 2,
            },
            {
                value: "intermediate",
                labelKey: "onboardingRating.options.localLevel.intermediate",
                score: 4,
            },
            {
                value: "advanced_local",
                labelKey: "onboardingRating.options.localLevel.advanced_local",
                score: 6,
            },
            {
                value: "top_local",
                labelKey: "onboardingRating.options.localLevel.top_local",
                score: 8,
            },
        ],
    },
    {
        id: "ball_control",
        titleKey: "onboardingRating.questions.ballControl.title",
        descriptionKey: "onboardingRating.questions.ballControl.description",
        options: [
            {
                value: "beginner",
                labelKey: "onboardingRating.options.ballControl.beginner",
                score: 0,
            },
            {
                value: "basic",
                labelKey: "onboardingRating.options.ballControl.basic",
                score: 4,
            },
            {
                value: "stable",
                labelKey: "onboardingRating.options.ballControl.stable",
                score: 8,
            },
            {
                value: "advanced",
                labelKey: "onboardingRating.options.ballControl.advanced",
                score: 11,
            },
            {
                value: "high_level",
                labelKey: "onboardingRating.options.ballControl.high_level",
                score: 14,
            },
        ],
    },
    {
        id: "sideout_consistency",
        titleKey: "onboardingRating.questions.sideoutConsistency.title",
        descriptionKey: "onboardingRating.questions.sideoutConsistency.description",
        options: [
            {
                value: "learning",
                labelKey: "onboardingRating.options.sideout.learning",
                score: 0,
            },
            {
                value: "occasional",
                labelKey: "onboardingRating.options.sideout.occasional",
                score: 4,
            },
            {
                value: "reliable_casual",
                labelKey: "onboardingRating.options.sideout.reliable_casual",
                score: 7,
            },
            {
                value: "competitive_ready",
                labelKey: "onboardingRating.options.sideout.competitive_ready",
                score: 10,
            },
            {
                value: "advanced_competitive",
                labelKey: "onboardingRating.options.sideout.advanced_competitive",
                score: 12,
            },
        ],
    },
    {
        id: "tactical_systems",
        titleKey: "onboardingRating.questions.tacticalSystems.title",
        descriptionKey: "onboardingRating.questions.tacticalSystems.description",
        options: [
            {
                value: "none",
                labelKey: "onboardingRating.options.tactics.none",
                score: 0,
            },
            {
                value: "heard_terms",
                labelKey: "onboardingRating.options.tactics.heard_terms",
                score: 3,
            },
            {
                value: "understands_sideout_transition",
                labelKey:
                    "onboardingRating.options.tactics.understands_sideout_transition",
                score: 6,
            },
            {
                value: "understands_block_defense_calls",
                labelKey:
                    "onboardingRating.options.tactics.understands_block_defense_calls",
                score: 8,
            },
            {
                value: "reads_systems_confidently",
                labelKey: "onboardingRating.options.tactics.reads_systems_confidently",
                score: 10,
            },
        ],
    },
    {
        id: "defense_reading",
        titleKey: "onboardingRating.questions.defenseReading.title",
        descriptionKey: "onboardingRating.questions.defenseReading.description",
        options: [
            {
                value: "rarely",
                labelKey: "onboardingRating.options.defense.rarely",
                score: 0,
            },
            {
                value: "sometimes",
                labelKey: "onboardingRating.options.defense.sometimes",
                score: 3,
            },
            {
                value: "often",
                labelKey: "onboardingRating.options.defense.often",
                score: 6,
            },
            {
                value: "usually",
                labelKey: "onboardingRating.options.defense.usually",
                score: 8,
            },
            {
                value: "advanced",
                labelKey: "onboardingRating.options.defense.advanced",
                score: 10,
            },
        ],
    },
];

export const ratingPlacementSteps: RatingPlacementStep[] = [
    {
        id: "foundation",
        eyebrowKey: "onboardingRating.steps.foundation.eyebrow",
        titleKey: "onboardingRating.steps.foundation.title",
        bodyKey: "onboardingRating.steps.foundation.body",
        questionIds: ["experience_duration", "weekly_frequency"],
    },
    {
        id: "context",
        eyebrowKey: "onboardingRating.steps.context.eyebrow",
        titleKey: "onboardingRating.steps.context.title",
        bodyKey: "onboardingRating.steps.context.body",
        questionIds: ["tournament_experience", "local_level"],
    },
    {
        id: "technique",
        eyebrowKey: "onboardingRating.steps.technique.eyebrow",
        titleKey: "onboardingRating.steps.technique.title",
        bodyKey: "onboardingRating.steps.technique.body",
        questionIds: ["ball_control", "sideout_consistency"],
    },
    {
        id: "advanced",
        eyebrowKey: "onboardingRating.steps.advanced.eyebrow",
        titleKey: "onboardingRating.steps.advanced.title",
        bodyKey: "onboardingRating.steps.advanced.body",
        questionIds: ["tactical_systems", "defense_reading"],
    },
];

export function getRatingPlacementQuestion(
    questionId: RatingPlacementQuestionId
) {
    return ratingPlacementQuestions.find((question) => question.id === questionId);
}

export function getAnswerScore(
    questionId: RatingPlacementQuestionId,
    answer: string | undefined
) {
    if (!answer) {
        return 0;
    }

    const question = getRatingPlacementQuestion(questionId);

    if (!question) {
        return 0;
    }

    const option = question.options.find((item) => item.value === answer);

    return option?.score ?? 0;
}

function mapScoreToEstimatedRating(score: number) {
    if (score >= 85) return 4.5;
    if (score >= 71) return 4.0;
    if (score >= 57) return 3.5;
    if (score >= 43) return 3.0;
    if (score >= 29) return 2.5;
    if (score >= 15) return 2.0;
    return 1.5;
}

function getRatingSafetyCap(answers: RatingPlacementAnswers) {
    const durationScore = getAnswerScore(
        "experience_duration",
        answers.experience_duration
    );
    const tournamentScore = getAnswerScore(
        "tournament_experience",
        answers.tournament_experience
    );

    if (durationScore <= 4 && tournamentScore <= 4) {
        return 3.0;
    }

    if (durationScore <= 8 && tournamentScore <= 8) {
        return 3.5;
    }

    if (durationScore <= 12 && tournamentScore <= 12) {
        return 4.0;
    }

    return 4.5;
}

export function calculateRatingPlacementResult(
    answers: RatingPlacementAnswers
): RatingPlacementResult {
    const score = ratingPlacementQuestions.reduce(
        (total, question) => total + getAnswerScore(question.id, answers[question.id]),
        0
    );
    const estimatedRating = Math.min(
        mapScoreToEstimatedRating(score),
        getRatingSafetyCap(answers)
    );

    return {
        score,
        estimatedRating: Number(estimatedRating.toFixed(2)),
        provisionalMatchesRemaining: PROVISIONAL_MATCHES_TOTAL,
    };
}

export function isStepComplete(
    stepQuestionIds: RatingPlacementQuestionId[],
    answers: RatingPlacementAnswers
) {
    return stepQuestionIds.every((questionId) => Boolean(answers[questionId]));
}
