import {
    DEFAULT_COMPETITIVE_RATING,
    normalizeCompetitiveRating,
} from "./rating-display.utils";

const INTERNAL_RATING_MULTIPLIER = 100;
const DEFAULT_K_FACTOR = 28;
const MAX_WIN_DELTA = 0.14;
const MAX_LOSS_DELTA = -0.16;
const STRAIGHT_SETS_BONUS = 0.02;

function toInternalRating(rating: number) {
    return normalizeCompetitiveRating(rating) * INTERNAL_RATING_MULTIPLIER;
}

export function calculateExpectedScore(
    playerRating: number,
    opponentRating: number
) {
    const playerInternal = toInternalRating(playerRating);
    const opponentInternal = toInternalRating(opponentRating);

    return 1 / (1 + 10 ** ((opponentInternal - playerInternal) / 400));
}

export function calculateEloDelta(
    playerRating: number,
    opponentRating: number,
    actualScore: 0 | 1,
    kFactor = DEFAULT_K_FACTOR,
    options?: {
        wonInStraightSets?: boolean;
    }
) {
    const expectedScore = calculateExpectedScore(playerRating, opponentRating);
    const internalDelta = kFactor * (actualScore - expectedScore);
    const normalizedDelta = Number((internalDelta / INTERNAL_RATING_MULTIPLIER).toFixed(2));

    if (actualScore === 1) {
        const baseWinDelta = Math.min(
            MAX_WIN_DELTA,
            Math.max(0, normalizedDelta)
        );
        const withSweepBonus =
            baseWinDelta +
            (options?.wonInStraightSets ? STRAIGHT_SETS_BONUS : 0);

        return Number(Math.min(0.16, withSweepBonus).toFixed(2));
    }

    return Number(Math.max(MAX_LOSS_DELTA, Math.min(0, normalizedDelta)).toFixed(2));
}

export function calculateTeamAverageRating(
    players: Array<{ competitiveRating: number }>
) {
    if (players.length === 0) {
        throw new Error("A team needs at least one player to calculate average rating");
    }

    const totalRating = players.reduce(
        (sum, player) =>
            sum + normalizeCompetitiveRating(player.competitiveRating ?? DEFAULT_COMPETITIVE_RATING),
        0
    );

    return Number((totalRating / players.length).toFixed(2));
}
