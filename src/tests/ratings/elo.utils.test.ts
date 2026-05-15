import { describe, expect, it } from "vitest";
import {
    calculateEloDelta,
    calculateExpectedScore,
    calculateTeamAverageRating,
} from "../../features/ratings/utils/elo.utils";

describe("elo.utils", () => {
    it("calculates expected score for evenly matched teams", () => {
        expect(calculateExpectedScore(1000, 1000)).toBe(0.5);
    });

    it("gives stronger teams a higher expected score", () => {
        expect(calculateExpectedScore(1200, 1000)).toBeGreaterThan(0.5);
        expect(calculateExpectedScore(1000, 1200)).toBeLessThan(0.5);
    });

    it("calculates a positive delta for winners", () => {
        expect(calculateEloDelta(1000, 1000, 1, 32)).toBe(16);
    });

    it("calculates a negative delta for losers", () => {
        expect(calculateEloDelta(1000, 1000, 0, 32)).toBe(-16);
    });

    it("calculates the average team rating", () => {
        expect(
            calculateTeamAverageRating([
                { competitiveRating: 1000 },
                { competitiveRating: 1040 },
            ])
        ).toBe(1020);
    });

    it("rejects empty teams when calculating average rating", () => {
        expect(() => calculateTeamAverageRating([])).toThrow(
            "A team needs at least one player to calculate average rating"
        );
    });
});
