import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    reverseGeocodeLocation,
    searchLocation,
} from "../../features/events/services/geocoding.service";

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
                address: {
                    city: "Barcelona",
                },
            },
            ]),
        })
        );

        const result = await searchLocation("Barceloneta");

        expect(result).toEqual({
        displayName: "Barcelona",
        latitude: 41.3784,
        longitude: 2.1925,
        });

        expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(
            "https://nominatim.openstreetmap.org/search?"
        ),
        expect.any(Object)
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

    it("should return a reverse geocoding result from map coordinates", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue({
                    display_name: "South Beach Court 3, Barcelona",
                    lat: "41.401",
                    lon: "2.201",
                    address: {
                        municipality: "Barcelona",
                    },
                }),
            })
        );

        const result = await reverseGeocodeLocation(41.401, 2.201);

        expect(result).toEqual({
            displayName: "Barcelona",
            latitude: 41.401,
            longitude: 2.201,
        });

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining(
                "https://nominatim.openstreetmap.org/reverse?"
            ),
            expect.any(Object)
        );
    });
});
