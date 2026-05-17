import { beforeEach, describe, expect, it, vi } from "vitest";
import { applyRatingForMatchResult } from "../../features/ratings/services/rating.service";

const { mockRpc } = vi.hoisted(() => ({
    mockRpc: vi.fn(),
}));

vi.mock("../../config/supabase", () => ({
    supabase: {
        rpc: mockRpc,
    },
}));

describe("rating.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("returns the rpc payload when rating is not applicable", async () => {
        mockRpc.mockResolvedValue({
            data: {
                applied: false,
                reason: "Only accepted competitive matches can affect rating",
            },
            error: null,
        });

        const result = await applyRatingForMatchResult("result-1");

        expect(mockRpc).toHaveBeenCalledWith("apply_competitive_match_rating", {
            target_result_id: "result-1",
        });
        expect(result).toEqual({
            applied: false,
            reason: "Only accepted competitive matches can affect rating",
        });
    });

    it("returns a successful response when rating is applied", async () => {
        mockRpc.mockResolvedValue({
            data: {
                applied: true,
                reason: "Competitive Elo rating applied successfully",
            },
            error: null,
        });

        const result = await applyRatingForMatchResult("result-1");

        expect(result).toEqual({
            applied: true,
            reason: "Competitive Elo rating applied successfully",
        });
    });

    it("throws when the rpc fails", async () => {
        mockRpc.mockResolvedValue({
            data: null,
            error: new Error("RPC failed"),
        });

        await expect(applyRatingForMatchResult("result-1")).rejects.toThrow(
            "RPC failed"
        );
    });
});
