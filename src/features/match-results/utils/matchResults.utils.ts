import type {
    CreateMatchSetPayload,
    MatchWinningTeam,
} from "../types/matchResult.types";
import type { EventMode } from "../../events/types/event.types";

function validateGenericSetShape(sets: CreateMatchSetPayload[]) {
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

function getCompetitiveTargetScore(setNumber: number) {
    return setNumber === 3 ? 15 : 21;
}

function validateCompetitiveSet(set: CreateMatchSetPayload) {
    const winningScore = Math.max(set.teamAScore, set.teamBScore);
    const losingScore = Math.min(set.teamAScore, set.teamBScore);
    const targetScore = getCompetitiveTargetScore(set.setNumber);

    if (winningScore < targetScore) {
        throw new Error(
            `Competitive set ${set.setNumber} must reach at least ${targetScore} points`
        );
    }

    if (winningScore - losingScore < 2) {
        throw new Error(
            `Competitive set ${set.setNumber} must be won by 2 points`
        );
    }
}

export function validateMatchSets(
    sets: CreateMatchSetPayload[],
    eventMode: EventMode | null = null
) {
    validateGenericSetShape(sets);

    if (eventMode !== "competitive") {
        return;
    }

    if (sets.length < 2 || sets.length > 3) {
        throw new Error("Competitive matches must be played as best of 3 sets");
    }

    const orderedSets = [...sets].sort((left, right) => left.setNumber - right.setNumber);

    if (orderedSets[0]?.setNumber !== 1 || orderedSets[1]?.setNumber !== 2) {
        throw new Error("Competitive matches require set 1 and set 2");
    }

    orderedSets.forEach(validateCompetitiveSet);

    const firstTwoWinners = orderedSets.slice(0, 2).map((set) =>
        set.teamAScore > set.teamBScore ? "team_a" : "team_b"
    );

    const requiresThirdSet = firstTwoWinners[0] !== firstTwoWinners[1];

    if (requiresThirdSet) {
        if (orderedSets.length !== 3 || orderedSets[2]?.setNumber !== 3) {
            throw new Error(
                "Competitive matches need a third set to 15 when the first two are split"
            );
        }
    } else if (orderedSets.length !== 2) {
        throw new Error(
            "Competitive matches should only include the deciding third set when needed"
        );
    }
}

export function calculateWinningTeam(
    sets: CreateMatchSetPayload[],
    eventMode: EventMode | null = null
): MatchWinningTeam {
    validateMatchSets(sets, eventMode);

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
