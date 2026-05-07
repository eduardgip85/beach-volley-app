import { beforeEach, describe, expect, it, vi } from "vitest";
import { verifyEquipmentImage } from "../../features/profile/services/equipment.service";

const mocks = vi.hoisted(() => ({
    invoke: vi.fn(),
}));

vi.mock("../../config/supabase", () => ({
    supabase: {
        functions: {
        invoke: mocks.invoke,
        },
    },
}));

describe("equipment.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should verify an equipment image and return the AI result", async () => {
        const file = new File(["fake image content"], "ball.png", {
        type: "image/png",
        });

        const aiResult = {
            target: "ball",
            detected: true,
            confidence: 0.92,
            reason: "A volleyball ball is visible.",
        };

        mocks.invoke.mockResolvedValue({
            data: aiResult,
            error: null,
        });

        const result = await verifyEquipmentImage(file, "ball");

        expect(result).toEqual(aiResult);

        expect(mocks.invoke).toHaveBeenCalledWith("verify-equipment", {
            body: {
                image: expect.stringContaining("data:image/png;base64,"),
                target: "ball",
            },
        });
    });

    it("should verify net equipment", async () => {
        const file = new File(["fake image content"], "net.jpg", {
            type: "image/jpeg",
        });

        const aiResult = {
            target: "net",
            detected: true,
            confidence: 0.88,
            reason: "A volleyball net is visible.",
        };

        mocks.invoke.mockResolvedValue({
            data: aiResult,
            error: null,
        });

        const result = await verifyEquipmentImage(file, "net");

        expect(result).toEqual(aiResult);

        expect(mocks.invoke).toHaveBeenCalledWith("verify-equipment", {
            body: {
                image: expect.stringContaining("data:image/jpeg;base64,"),
                target: "net",
            },
        });
    });

    it("should throw when file is not an image", async () => {
        const file = new File(["hello"], "document.txt", {
            type: "text/plain",
        });

        await expect(verifyEquipmentImage(file, "ball")).rejects.toThrow(
            "Only image files are allowed"
        );

        expect(mocks.invoke).not.toHaveBeenCalled();
    });

    it("should throw when Supabase function returns an error", async () => {
        const file = new File(["fake image content"], "ball.png", {
            type: "image/png",
        });

        mocks.invoke.mockResolvedValue({
            data: null,
            error: new Error("Function failed"),
        });

        await expect(verifyEquipmentImage(file, "ball")).rejects.toThrow(
            "Function failed"
        );
    });
});