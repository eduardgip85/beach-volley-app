import { Globe2, MapPin, Search } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useLocationSuggestions } from "../hooks/useLocationSuggestions";
import type { SettingsSectionStatus } from "../types/settings.types";

interface LocationSettingsFormProps {
    country: string;
    city: string;
    status: SettingsSectionStatus;
    onCountryChange: (value: string) => void;
    onCityChange: (value: string) => void;
    onSave: () => void;
}

export function LocationSettingsForm({
    country,
    city,
    status,
    onCountryChange,
    onCityChange,
    onSave,
}: LocationSettingsFormProps) {
    const { t } = useTranslation();
    const [countryFocused, setCountryFocused] = useState(false);
    const [cityFocused, setCityFocused] = useState(false);
    const {
        countrySuggestions,
        citySuggestions,
        citySuggestionsLoading,
        citySuggestionsError,
    } = useLocationSuggestions(country, city);

    const showCountrySuggestions =
        countryFocused && countrySuggestions.length > 0 && country.trim().length > 0;
    const showCitySuggestions =
        cityFocused &&
        city.trim().length > 0 &&
        (citySuggestions.length > 0 || citySuggestionsLoading || !!citySuggestionsError);

    return (
        <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="relative">
                    <label className="block">
                        <span className="text-sm font-semibold text-slate-700">
                            {t("settings.location.country")}
                        </span>
                        <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <Globe2 size={18} className="text-slate-400" />
                            <input
                                value={country}
                                onFocus={() => setCountryFocused(true)}
                                onBlur={() => {
                                    window.setTimeout(() => setCountryFocused(false), 120);
                                }}
                                onChange={(event) => {
                                    onCountryChange(event.target.value);
                                    onCityChange("");
                                }}
                                className="w-full bg-transparent text-sm text-slate-900 outline-none"
                                placeholder={t("settings.location.countryPlaceholder")}
                            />
                        </div>
                    </label>

                    {showCountrySuggestions ? (
                        <SuggestionList
                            icon={<Search size={14} className="text-slate-400" />}
                            items={countrySuggestions}
                            title={t("settings.location.suggestions")}
                            onSelect={(value) => {
                                onCountryChange(value);
                                onCityChange("");
                                setCountryFocused(false);
                            }}
                        />
                    ) : null}
                </div>

                <div className="relative">
                    <label className="block">
                        <span className="text-sm font-semibold text-slate-700">
                            {t("settings.location.city")}
                        </span>
                        <div className="mt-2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                            <MapPin size={18} className="text-slate-400" />
                            <input
                                value={city}
                                onFocus={() => setCityFocused(true)}
                                onBlur={() => {
                                    window.setTimeout(() => setCityFocused(false), 120);
                                }}
                                onChange={(event) => onCityChange(event.target.value)}
                                disabled={!country.trim()}
                                className="w-full bg-transparent text-sm text-slate-900 outline-none disabled:cursor-not-allowed disabled:text-slate-400"
                                placeholder={
                                    country.trim()
                                        ? t("settings.location.cityPlaceholder")
                                        : t("settings.location.cityDisabledPlaceholder")
                                }
                            />
                        </div>
                    </label>

                    {showCitySuggestions ? (
                        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
                            {citySuggestionsLoading ? (
                                <p className="px-4 py-3 text-sm text-slate-500">
                                    {t("settings.location.searchingCities")}
                                </p>
                            ) : null}

                            {!citySuggestionsLoading && citySuggestionsError ? (
                                <p className="px-4 py-3 text-sm text-red-600">
                                    {citySuggestionsError}
                                </p>
                            ) : null}

                            {!citySuggestionsLoading &&
                            !citySuggestionsError &&
                            citySuggestions.length === 0 ? (
                                <p className="px-4 py-3 text-sm text-slate-500">
                                    {t("settings.location.noCities")}
                                </p>
                            ) : null}

                            {!citySuggestionsLoading && !citySuggestionsError ? (
                                <SuggestionItems
                                    items={citySuggestions}
                                    onSelect={(value) => {
                                        onCityChange(value);
                                        setCityFocused(false);
                                    }}
                                />
                            ) : null}
                        </div>
                    ) : null}
                </div>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-500">
                <p>{t("settings.location.consistencyHint")}</p>
                <p className="mt-2 font-semibold text-slate-600">
                    {t("settings.location.publicCountryHint")}
                </p>
            </div>

            <SectionFeedback status={status} />

            <button
                type="button"
                onClick={onSave}
                disabled={status.loading}
                className="w-full rounded-2xl bg-slate-900 px-5 py-4 text-sm font-bold text-white disabled:opacity-60 sm:w-auto"
            >
                {status.loading
                    ? t("settings.location.saving")
                    : t("settings.location.save")}
            </button>
        </div>
    );
}

function SuggestionList({
    items,
    onSelect,
    icon,
    title,
}: {
    items: string[];
    onSelect: (value: string) => void;
    icon: ReactNode;
    title: string;
}) {
    return (
        <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
            <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                {icon}
                {title}
            </div>
            <SuggestionItems items={items} onSelect={onSelect} />
        </div>
    );
}

function SuggestionItems({
    items,
    onSelect,
}: {
    items: string[];
    onSelect: (value: string) => void;
}) {
    return (
        <div className="max-h-64 overflow-y-auto">
            {items.map((item) => (
                <button
                    key={item}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => onSelect(item)}
                    className="block w-full px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                >
                    {item}
                </button>
            ))}
        </div>
    );
}

function SectionFeedback({ status }: { status: SettingsSectionStatus }) {
    if (status.error) {
        return (
            <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                {status.error}
            </p>
        );
    }

    if (status.success) {
        return (
            <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {status.success}
            </p>
        );
    }

    return null;
}
