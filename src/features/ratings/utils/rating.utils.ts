interface CalculateRatingChangeResult {
    delta: number;
    nextRating: number;
}

export function calculateRatingChange(
    currentRating: number,
    didWin: boolean
): CalculateRatingChangeResult {
    const safeCurrentRating = Math.max(0, Math.floor(currentRating));
    const delta = didWin ? 15 : -15;
    const nextRating = Math.max(0, safeCurrentRating + delta);

    return {
        delta: nextRating - safeCurrentRating,
        nextRating,
    };
}
