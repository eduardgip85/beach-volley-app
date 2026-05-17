import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateProfileLocation } from "../../features/profile/services/profile.service";

const mockUpdate = vi.fn();
const mockEq = vi.fn();

vi.mock("../../config/supabase", () => ({
    supabase: {
        from: vi.fn(() => ({
            update: mockUpdate,
        })),
    },
}));

describe("profile.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockUpdate.mockReturnValue({
            eq: mockEq,
        });

        mockEq.mockResolvedValue({
            error: null,
        });
    });

    it("updates country and city for the current profile", async () => {
        await updateProfileLocation({
            userId: "user-1",
            country: "Spain",
            city: "Barcelona",
        });

        expect(mockUpdate).toHaveBeenCalledWith({
            country: "Spain",
            city: "Barcelona",
        });
        expect(mockEq).toHaveBeenCalledWith("id", "user-1");
    });

    it("stores null when location fields are blank", async () => {
        await updateProfileLocation({
            userId: "user-1",
            country: "   ",
            city: "",
        });

        expect(mockUpdate).toHaveBeenCalledWith({
            country: null,
            city: null,
        });
    });
});
