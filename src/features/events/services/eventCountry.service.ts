import type { Event } from "../types/event.types";
import { getCountryCode } from "../../settings/services/locationSuggestions.service";
import {
    reverseGeocodeLocation,
    searchCountryCenter,
} from "./geocoding.service";

const EVENT_COUNTRY_CACHE_PREFIX = "sandset:event-country:v2:";
const COUNTRY_CENTER_CACHE_PREFIX = "sandset:country-center:";

interface CachedCountryIdentity {
    name: string | null;
    code: string | null;
}

const eventCountryCache = new Map<string, CachedCountryIdentity | null>();
const eventCountryInflight = new Map<
    string,
    Promise<CachedCountryIdentity | null>
>();
const countryCenterCache = new Map<string, [number, number] | null>();
const countryCenterInflight = new Map<string, Promise<[number, number] | null>>();

function buildCoordinateCacheKey(latitude: number, longitude: number) {
    return `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
}

function normalizeCountryName(value: string | null | undefined) {
    return (
        value
            ?.trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLocaleLowerCase("en") ?? ""
    );
}

function normalizeCountryKey(
    countryName: string | null | undefined,
    countryCode?: string | null
) {
    const normalizedCode = countryCode?.trim().toUpperCase();

    if (normalizedCode) {
        return `code:${normalizedCode}`;
    }

    const inferredCode =
        typeof countryName === "string" ? getCountryCode(countryName) : null;

    if (inferredCode) {
        return `code:${inferredCode}`;
    }

    const normalizedName = normalizeCountryName(countryName);

    return normalizedName ? `name:${normalizedName}` : "";
}

function readStorageValue<T>(key: string): T | null {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        const rawValue = window.localStorage.getItem(key);

        if (!rawValue) {
            return null;
        }

        return JSON.parse(rawValue) as T;
    } catch {
        return null;
    }
}

function writeStorageValue(key: string, value: unknown) {
    if (typeof window === "undefined") {
        return;
    }

    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Ignore storage quota and privacy mode issues.
    }
}

export async function getCountryNameForCoordinates(
    latitude: number,
    longitude: number
) {
    const identity = await getCountryIdentityForCoordinates(latitude, longitude);

    return identity?.name ?? null;
}

async function getCountryIdentityForCoordinates(
    latitude: number,
    longitude: number
) {
    const cacheKey = buildCoordinateCacheKey(latitude, longitude);

    if (eventCountryCache.has(cacheKey)) {
        return eventCountryCache.get(cacheKey) ?? null;
    }

    const storedCountry = readStorageValue<CachedCountryIdentity | null>(
        `${EVENT_COUNTRY_CACHE_PREFIX}${cacheKey}`
    );

    if (storedCountry !== null) {
        eventCountryCache.set(cacheKey, storedCountry);
        return storedCountry;
    }

    const inflightRequest = eventCountryInflight.get(cacheKey);

    if (inflightRequest) {
        return inflightRequest;
    }

    const request = reverseGeocodeLocation(latitude, longitude)
        .then((result) => {
            if (!result) {
                return null;
            }

            return {
                name: result.countryName?.trim() ?? null,
                code: result.countryCode?.trim().toUpperCase() ?? null,
            } satisfies CachedCountryIdentity;
        })
        .then((identity) => {
            eventCountryCache.set(cacheKey, identity);
            writeStorageValue(
                `${EVENT_COUNTRY_CACHE_PREFIX}${cacheKey}`,
                identity
            );
            return identity;
        });

    eventCountryInflight.set(cacheKey, request);

    try {
        return await request;
    } finally {
        eventCountryInflight.delete(cacheKey);
    }
}

export async function getEventCountryName(event: Event) {
    return getCountryNameForCoordinates(event.latitude, event.longitude);
}

export async function filterEventsByCountry(events: Event[], country: string) {
    const trimmedCountry = country.trim();

    if (!trimmedCountry) {
        return events;
    }

    const targetCountry = normalizeCountryKey(trimmedCountry);
    const countryMatches = await Promise.all(
        events.map(async (event) => ({
            event,
            countryIdentity: await getCountryIdentityForCoordinates(
                event.latitude,
                event.longitude
            ),
        }))
    );

    return countryMatches
        .filter(
            ({ countryIdentity }) =>
                normalizeCountryKey(
                    countryIdentity?.name,
                    countryIdentity?.code
                ) === targetCountry
        )
        .map(({ event }) => event);
}

export async function getCountryCenter(country: string) {
    const trimmedCountry = country.trim();

    if (!trimmedCountry) {
        return null;
    }

    const normalizedCountry = normalizeCountryName(trimmedCountry);

    if (countryCenterCache.has(normalizedCountry)) {
        return countryCenterCache.get(normalizedCountry) ?? null;
    }

    const storedCenter = readStorageValue<[number, number] | null>(
        `${COUNTRY_CENTER_CACHE_PREFIX}${normalizedCountry}`
    );

    if (storedCenter !== null) {
        countryCenterCache.set(normalizedCountry, storedCenter);
        return storedCenter;
    }

    const inflightRequest = countryCenterInflight.get(normalizedCountry);

    if (inflightRequest) {
        return inflightRequest;
    }

    const request = searchCountryCenter(trimmedCountry)
        .then((result) =>
            result ? ([result.latitude, result.longitude] as [number, number]) : null
        )
        .then((center) => {
            countryCenterCache.set(normalizedCountry, center);
            writeStorageValue(
                `${COUNTRY_CENTER_CACHE_PREFIX}${normalizedCountry}`,
                center
            );
            return center;
        });

    countryCenterInflight.set(normalizedCountry, request);

    try {
        return await request;
    } finally {
        countryCenterInflight.delete(normalizedCountry);
    }
}
