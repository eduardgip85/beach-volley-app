import { useTranslation } from "react-i18next";
import type { RankingScope } from "../types/ranking.types";

interface RankingTabsProps {
    activeScope: RankingScope;
    onScopeChange: (scope: RankingScope) => void;
    hasCountryScope: boolean;
    hasFriendsScope: boolean;
}

export function RankingTabs({
    activeScope,
    onScopeChange,
    hasCountryScope,
    hasFriendsScope,
}: RankingTabsProps) {
    const { t } = useTranslation();
    const scopes: Array<{
        scope: RankingScope;
        label: string;
    }> = [
        { scope: "global", label: t("ranking.tabs.global") },
        { scope: "country", label: t("ranking.tabs.country") },
        { scope: "friends", label: t("ranking.tabs.friends") },
    ];

    return (
        <div className="sticky top-20 z-20 rounded-[1.75rem] border border-slate-200 bg-white/95 p-2 shadow-sm backdrop-blur md:top-6">
            <div className="grid grid-cols-3 gap-2">
                {scopes.map(({ scope, label }) => {
                    const disabled =
                        (scope === "country" && !hasCountryScope) ||
                        (scope === "friends" && !hasFriendsScope);

                    return (
                        <button
                            key={scope}
                            type="button"
                            onClick={() => onScopeChange(scope)}
                            disabled={disabled}
                            className={[
                                "rounded-2xl px-3 py-3 text-sm font-bold transition",
                                activeScope === scope
                                    ? "bg-slate-900 text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                                disabled
                                    ? "cursor-not-allowed opacity-45 hover:bg-slate-100"
                                    : "",
                            ].join(" ")}
                        >
                            {label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
