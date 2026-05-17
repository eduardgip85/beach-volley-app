import { describe, expect, it } from "vitest";
import {
    calculateEloDelta,
    calculateExpectedScore,
    calculateTeamAverageRating,
} from "../../features/ratings/utils/elo.utils";

describe("elo.utils", () => {
    it("calculates expected score for evenly matched teams", () => {
        expect(calculateExpectedScore(5, 5)).toBe(0.5);
    });

    it("gives stronger teams a higher expected score", () => {
        expect(calculateExpectedScore(6, 5)).toBeGreaterThan(0.5);
        expect(calculateExpectedScore(5, 6)).toBeLessThan(0.5);
    });

    it("calculates a positive delta for winners", () => {
        expect(calculateEloDelta(5, 5, 1)).toBe(0.14);
    });

    it("calculates a negative delta for losers", () => {
        expect(calculateEloDelta(5, 5, 0)).toBe(-0.14);
    });

    it("adds a small straight-sets bonus for winners", () => {
        expect(calculateEloDelta(5, 5, 1, undefined, { wonInStraightSets: true })).toBe(
            0.16
        );
    });

    it("calculates the average team rating", () => {
        expect(
            calculateTeamAverageRating([
                { competitiveRating: 5 },
                { competitiveRating: 5.4 },
            ])
        ).toBe(5.2);
    });

    it("rejects empty teams when calculating average rating", () => {
        expect(() => calculateTeamAverageRating([])).toThrow(
            "A team needs at least one player to calculate average rating"
        );
    });
});
