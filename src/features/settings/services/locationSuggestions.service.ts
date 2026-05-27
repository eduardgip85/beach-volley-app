const COUNTRY_CODES = [
    "AD",
    "AE",
    "AF",
    "AG",
    "AI",
    "AL",
    "AM",
    "AO",
    "AR",
    "AT",
    "AU",
    "AZ",
    "BA",
    "BB",
    "BD",
    "BE",
    "BF",
    "BG",
    "BH",
    "BI",
    "BJ",
    "BN",
    "BO",
    "BR",
    "BS",
    "BT",
    "BW",
    "BY",
    "BZ",
    "CA",
    "CD",
    "CF",
    "CG",
    "CH",
    "CI",
    "CL",
    "CM",
    "CN",
    "CO",
    "CR",
    "CU",
    "CV",
    "CY",
    "CZ",
    "DE",
    "DJ",
    "DK",
    "DM",
    "DO",
    "DZ",
    "EC",
    "EE",
    "EG",
    "ER",
    "ES",
    "ET",
    "FI",
    "FJ",
    "FM",
    "FR",
    "GA",
    "GB",
    "GD",
    "GE",
    "GH",
    "GM",
    "GN",
    "GQ",
    "GR",
    "GT",
    "GW",
    "GY",
    "HN",
    "HR",
    "HT",
    "HU",
    "ID",
    "IE",
    "IL",
    "IN",
    "IQ",
    "IR",
    "IS",
    "IT",
    "JM",
    "JO",
    "JP",
    "KE",
    "KG",
    "KH",
    "KI",
    "KM",
    "KN",
    "KP",
    "KR",
    "KW",
    "KZ",
    "LA",
    "LB",
    "LC",
    "LI",
    "LK",
    "LR",
    "LS",
    "LT",
    "LU",
    "LV",
    "LY",
    "MA",
    "MC",
    "MD",
    "ME",
    "MG",
    "MH",
    "MK",
    "ML",
    "MM",
    "MN",
    "MR",
    "MT",
    "MU",
    "MV",
    "MW",
    "MX",
    "MY",
    "MZ",
    "NA",
    "NE",
    "NG",
    "NI",
    "NL",
    "NO",
    "NP",
    "NR",
    "NZ",
    "OM",
    "PA",
    "PE",
    "PG",
    "PH",
    "PK",
    "PL",
    "PT",
    "PW",
    "PY",
    "QA",
    "RO",
    "RS",
    "RU",
    "RW",
    "SA",
    "SB",
    "SC",
    "SD",
    "SE",
    "SG",
    "SI",
    "SK",
    "SL",
    "SM",
    "SN",
    "SO",
    "SR",
    "SS",
    "ST",
    "SV",
    "SY",
    "SZ",
    "TD",
    "TG",
    "TH",
    "TJ",
    "TL",
    "TM",
    "TN",
    "TO",
    "TR",
    "TT",
    "TV",
    "TW",
    "TZ",
    "UA",
    "UG",
    "US",
    "UY",
    "UZ",
    "VA",
    "VC",
    "VE",
    "VN",
    "VU",
    "WS",
    "YE",
    "ZA",
    "ZM",
    "ZW",
];

function buildCountryNames() {
    const displayNames = new Intl.DisplayNames(["en"], {
        type: "region",
    });

    return COUNTRY_CODES.map((code) => displayNames.of(code))
        .filter((countryName): countryName is string => Boolean(countryName))
        .sort((left, right) => left.localeCompare(right, "en"));
}

const COUNTRY_NAMES = buildCountryNames();
const COUNTRY_NAME_TO_CODE = new Map<string, string>(
    COUNTRY_CODES.map((code) => {
        const displayNames = new Intl.DisplayNames(["en"], {
            type: "region",
        });

        return [normalizeValue(displayNames.of(code) ?? code), code];
    })
);

interface NominatimCityRow {
    address?: {
        city?: string;
        town?: string;
        village?: string;
        municipality?: string;
        hamlet?: string;
    };
    display_name?: string;
    name?: string;
}

function normalizeValue(value: string) {
    return value.trim().toLocaleLowerCase("en");
}

function extractCityName(row: NominatimCityRow) {
    const fromAddress =
        row.address?.city ??
        row.address?.town ??
        row.address?.village ??
        row.address?.municipality ??
        row.address?.hamlet;

    return (fromAddress ?? row.name ?? row.display_name ?? "").trim();
}

export function getCountrySuggestions(query: string, limit = 8) {
    const normalizedQuery = normalizeValue(query);

    if (!normalizedQuery) {
        return COUNTRY_NAMES.slice(0, limit);
    }

    return COUNTRY_NAMES.filter((countryName) =>
        normalizeValue(countryName).startsWith(normalizedQuery)
    ).slice(0, limit);
}

export function isKnownCountry(value: string) {
    const normalizedValue = normalizeValue(value);

    return COUNTRY_NAMES.some(
        (countryName) => normalizeValue(countryName) === normalizedValue
    );
}

export function getCountryCode(value: string) {
    const normalizedValue = normalizeValue(value);

    if (!normalizedValue) {
        return null;
    }

    return COUNTRY_NAME_TO_CODE.get(normalizedValue) ?? null;
}

export async function searchCitySuggestions(
    query: string,
    country: string,
    limit = 8
) {
    const normalizedQuery = query.trim();
    const normalizedCountry = country.trim();

    if (!normalizedQuery || !normalizedCountry) {
        return [];
    }

    const params = new URLSearchParams({
        city: normalizedQuery,
        country: normalizedCountry,
        format: "jsonv2",
        addressdetails: "1",
        limit: String(limit),
    });

    const response = await fetch(
        `https://nominatim.openstreetmap.org/search?${params.toString()}`,
        {
            headers: {
                "Accept-Language": "en",
            },
        }
    );

    if (!response.ok) {
        throw new Error("Could not load city suggestions");
    }

    const data = (await response.json()) as NominatimCityRow[];
    const uniqueCities = new Set<string>();

    for (const row of data) {
        const cityName = extractCityName(row);

        if (cityName) {
            uniqueCities.add(cityName);
        }
    }

    return Array.from(uniqueCities).slice(0, limit);
}

export async function isKnownCity(value: string, country: string) {
    const normalizedValue = normalizeValue(value);

    if (!normalizedValue || !country.trim()) {
        return false;
    }

    const suggestions = await searchCitySuggestions(value, country, 8);

    return suggestions.some(
        (cityName) => normalizeValue(cityName) === normalizedValue
    );
}
