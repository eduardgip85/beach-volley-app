import type {
    CreateMatchSetPayload,
    MatchWinningTeam,
} from "../types/matchResult.types";

export function validateMatchSets(sets: CreateMatchSetPayload[]) {
    if (sets.length === 0) {
        throw new Error("At least one set is required");
    }

    const seenSetNumbers = new Set<number>();

    for (const set of sets) {
        const isValidSetNumber =
            Number.isInteger(set.setNumber) && set.setNumber > 0;
        const hasValidTeamAScore =
            Number.isInteger(set.teamAScore) && set.teamAScore >= 0;
        const hasValidTeamBScore =
            Number.isInteger(set.teamBScore) && set.teamBScore >= 0;

        if (!isValidSetNumber || !hasValidTeamAScore || !hasValidTeamBScore) {
            throw new Error("Sets must include valid set numbers and scores");
        }

        if (seenSetNumbers.has(set.setNumber)) {
            throw new Error("Set numbers must be unique");
        }

        if (set.teamAScore === set.teamBScore) {
            throw new Error("A set cannot end in a tie");
        }

        seenSetNumbers.add(set.setNumber);
    }
}

export function calculateWinningTeam(
    sets: CreateMatchSetPayload[]
): MatchWinningTeam {
    validateMatchSets(sets);

    let teamAWins = 0;
    let teamBWins = 0;

    for (const set of sets) {
        if (set.teamAScore > set.teamBScore) {
            teamAWins += 1;
        } else {
            teamBWins += 1;
        }
    }

    if (teamAWins === teamBWins) {
        throw new Error("Match results cannot end in a tie");
    }

    return teamAWins > teamBWins ? "team_a" : "team_b";
}
