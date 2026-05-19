import { beforeEach, describe, expect, it } from "vitest";
import { setAppLanguage } from "../../i18n";
import {
    calculateWinRate,
    getRankingEmptyStateMessage,
    getRankingScopeLabel,
} from "../../features/ranking/utils/ranking.utils";

describe("ranking.utils", () => {
    beforeEach(async () => {
        await setAppLanguage("en");
    });

    it("returns zero win rate when there are no matches", () => {
        expect(calculateWinRate(0, 0)).toBe(0);
    });

    it("calculates a rounded win rate percentage", () => {
        expect(calculateWinRate(7, 3)).toBe(70);
        expect(calculateWinRate(2, 1)).toBe(66.7);
    });

    it("returns readable labels for ranking scopes", () => {
        expect(getRankingScopeLabel("global")).toBe("Global");
        expect(getRankingScopeLabel("country")).toBe("Country");
        expect(getRankingScopeLabel("friends")).toBe("Friends");
    });

    it("returns an auth-specific empty state for friends ranking", () => {
        expect(
            getRankingEmptyStateMessage("friends", {
                hasCountry: true,
                isAuthenticated: false,
            })
        ).toBe("Log in to compare your rating with accepted friends.");
    });
});
