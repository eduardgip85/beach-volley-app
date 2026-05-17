import { describe, expect, it } from "vitest";
import {
    calculateWinningTeam,
    validateMatchSets,
} from "../../features/match-results/utils/matchResults.utils";

describe("matchResults.utils", () => {
    it("calculates the winning team from sets", () => {
        expect(
            calculateWinningTeam([
                { setNumber: 1, teamAScore: 21, teamBScore: 19 },
                { setNumber: 2, teamAScore: 18, teamBScore: 21 },
                { setNumber: 3, teamAScore: 15, teamBScore: 11 },
            ])
        ).toBe("team_a");
    });

    it("rejects a tied set score", () => {
        expect(() =>
            validateMatchSets([
                { setNumber: 1, teamAScore: 21, teamBScore: 21 },
            ])
        ).toThrow("A set cannot end in a tie");
    });

    it("rejects tied match results", () => {
        expect(() =>
            calculateWinningTeam([
                { setNumber: 1, teamAScore: 21, teamBScore: 19 },
                { setNumber: 2, teamAScore: 18, teamBScore: 21 },
            ])
        ).toThrow("Match results cannot end in a tie");
    });

    it("enforces competitive best of 3 rules", () => {
        expect(() =>
            validateMatchSets(
                [
                    { setNumber: 1, teamAScore: 21, teamBScore: 19 },
                    { setNumber: 2, teamAScore: 18, teamBScore: 21 },
                ],
                "competitive"
            )
        ).toThrow("Competitive matches need a third set to 15 when the first two are split");
    });

    it("accepts valid competitive best of 3 sets", () => {
        expect(
            calculateWinningTeam(
                [
                    { setNumber: 1, teamAScore: 21, teamBScore: 19 },
                    { setNumber: 2, teamAScore: 18, teamBScore: 21 },
                    { setNumber: 3, teamAScore: 15, teamBScore: 12 },
                ],
                "competitive"
            )
        ).toBe("team_a");
    });
});
