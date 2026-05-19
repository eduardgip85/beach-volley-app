import { useTranslation } from "react-i18next";
import type { ProfileMatchHistoryModeFilter } from "../types/profileStats.types";

interface ProfileHistoryModeTabsProps {
    value: ProfileMatchHistoryModeFilter;
    onChange: (value: ProfileMatchHistoryModeFilter) => void;
    includeAll?: boolean;
}

export function ProfileHistoryModeTabs({
    value,
    onChange,
    includeAll = false,
}: ProfileHistoryModeTabsProps) {
    const { t } = useTranslation();
    const options: ProfileMatchHistoryModeFilter[] = includeAll
        ? ["all", "competitive", "casual"]
        : ["competitive", "casual"];

    return (
        <div className="overflow-x-auto pb-1">
            <div className="inline-flex min-w-full gap-2 rounded-full bg-slate-100 p-1 sm:min-w-0">
                {options.map((option) => {
                    const isSelected = option === value;

                    return (
                        <button
                            key={option}
                            type="button"
                            onClick={() => onChange(option)}
                            className={`rounded-full px-4 py-2 text-xs font-bold uppercase whitespace-nowrap transition ${
                                isSelected
                                    ? "bg-slate-900 text-white"
                                    : "text-slate-600 hover:bg-white"
                            }`}
                        >
                            {t(`profile.historyModes.${option}`)}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
