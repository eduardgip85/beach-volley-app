import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchLocation } from "../../features/events/services/geocoding.service";

describe("geocoding.service", () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it("should return the first geocoding result", async () => {
        vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue([
            {
                display_name: "Barceloneta Beach, Barcelona",
                lat: "41.3784",
                lon: "2.1925",
            },
            ]),
        })
        );

        const result = await searchLocation("Barceloneta");

        expect(result).toEqual({
        displayName: "Barceloneta Beach, Barcelona",
        latitude: 41.3784,
        longitude: 2.1925,
        });

        expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(
            "https://nominatim.openstreetmap.org/search?"
        )
        );
    });

    it("should return null when there are no results", async () => {
        vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue([]),
        })
        );

        const result = await searchLocation("unknown-place");

        expect(result).toBeNull();
    });

    it("should throw when the request fails", async () => {
            vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: false,
            })
            );

            await expect(searchLocation("Barceloneta")).rejects.toThrow(
            "Could not search location"
            );
    });
});