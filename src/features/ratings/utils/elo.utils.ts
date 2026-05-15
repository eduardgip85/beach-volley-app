export function calculateExpectedScore(
    teamRating: number,
    opponentRating: number
) {
    return 1 / (1 + 10 ** ((opponentRating - teamRating) / 400));
}

export function calculateEloDelta(
    teamRating: number,
    opponentRating: number,
    actualScore: 0 | 1,
    kFactor = 32
) {
    const expectedScore = calculateExpectedScore(teamRating, opponentRating);

    return Math.round(kFactor * (actualScore - expectedScore));
}

export function calculateTeamAverageRating(
    players: Array<{ competitiveRating: number }>
) {
    if (players.length === 0) {
        throw new Error("A team needs at least one player to calculate average rating");
    }

    const totalRating = players.reduce(
        (sum, player) => sum + Math.max(0, player.competitiveRating),
        0
    );

    return totalRating / players.length;
}
