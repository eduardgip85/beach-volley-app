import { useEffect, useMemo, useState } from "react";
import {
    getCountrySuggestions,
    searchCitySuggestions,
} from "../services/locationSuggestions.service";

export function useLocationSuggestions(country: string, city: string) {
    const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
    const [citySuggestionsLoading, setCitySuggestionsLoading] = useState(false);
    const [citySuggestionsError, setCitySuggestionsError] = useState("");

    const countrySuggestions = useMemo(
        () => getCountrySuggestions(country),
        [country]
    );

    useEffect(() => {
        const trimmedCountry = country.trim();
        const trimmedCity = city.trim();

        if (!trimmedCountry || !trimmedCity) {
            setCitySuggestions([]);
            setCitySuggestionsLoading(false);
            setCitySuggestionsError("");
            return;
        }

        const timeoutId = window.setTimeout(async () => {
            try {
                setCitySuggestionsLoading(true);
                setCitySuggestionsError("");
                const suggestions = await searchCitySuggestions(
                    trimmedCity,
                    trimmedCountry
                );
                setCitySuggestions(suggestions);
            } catch (error) {
                setCitySuggestions([]);
                setCitySuggestionsError(
                    error instanceof Error
                        ? error.message
                        : "Could not load city suggestions"
                );
            } finally {
                setCitySuggestionsLoading(false);
            }
        }, 250);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [city, country]);

    return {
        countrySuggestions,
        citySuggestions,
        citySuggestionsLoading,
        citySuggestionsError,
    };
}
