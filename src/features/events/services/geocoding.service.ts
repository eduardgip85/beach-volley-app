export interface GeocodingResult {
    displayName: string;
    latitude: number;
    longitude: number;
}

export async function searchLocation(
    query: string
): Promise<GeocodingResult | null> {
    const params = new URLSearchParams({
        q: query,
        format: "json",
        limit: "1",
    });

    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`
    );

    if (!response.ok) {
        throw new Error("Could not search location");
    }

    const data = await response.json();

    if (!data || data.length === 0) {
        return null;
    }

    return {
        displayName: data[0].display_name,
        latitude: Number(data[0].lat),
        longitude: Number(data[0].lon),
    };
}