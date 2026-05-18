export interface GeocodingResult {
    displayName: string;
    latitude: number;
    longitude: number;
}

function buildShortLocationName(data: any): string | null {
    const address = data?.address;

    if (!address || typeof address !== "object") {
        return null;
    }

    return (
        address.city ??
        address.town ??
        address.village ??
        address.municipality ??
        address.suburb ??
        address.city_district ??
        address.county ??
        address.state ??
        null
    );
}

async function readGeocodingResponse(
    url: string,
    errorMessage: string
): Promise<any> {
    const response = await fetch(url, {
        headers: {
            Accept: "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(errorMessage);
    }

    return response.json();
}

export async function searchLocation(query: string): Promise<GeocodingResult | null> {
    const params = new URLSearchParams({
        q: query,
        format: "json",
        limit: "1",
        addressdetails: "1",
    });

    const data = await readGeocodingResponse(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        "Could not search location"
    );

    if (!data || data.length === 0) {
        return null;
    }

    return {
        displayName: buildShortLocationName(data[0]) ?? data[0].display_name,
        latitude: Number(data[0].lat),
        longitude: Number(data[0].lon),
    };
}

export async function reverseGeocodeLocation(
    latitude: number,
    longitude: number
): Promise<GeocodingResult | null> {
    const params = new URLSearchParams({
        format: "json",
        lat: latitude.toString(),
        lon: longitude.toString(),
        zoom: "18",
        addressdetails: "1",
    });

    const data = await readGeocodingResponse(
        `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
        "Could not read location from map"
    );

    if (!data?.display_name) {
        return null;
    }

    return {
        displayName: buildShortLocationName(data) ?? data.display_name,
        latitude: Number(data.lat ?? latitude),
        longitude: Number(data.lon ?? longitude),
    };
}
