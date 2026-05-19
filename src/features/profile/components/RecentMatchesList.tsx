import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { ProfileRecentMatch } from "../types/profileStats.types";
import { ProfileMatchHistoryCards } from "./ProfileMatchHistoryCards";

interface RecentMatchesListProps {
    matches: ProfileRecentMatch[];
    loading?: boolean;
    title?: string;
    description?: string;
    emptyTitle?: string;
    emptyDescription?: string;
    headerAction?: ReactNode;
}

export function RecentMatchesList({
    matches,
    loading = false,
    title = "Last 5 matches",
    description = "Showing your latest validated match results.",
    emptyTitle = "No recent validated matches yet",
    emptyDescription = "Once a joined match has an accepted result, it will appear here.",
    headerAction,
}: RecentMatchesListProps) {
    const { t } = useTranslation();
    const resolvedTitle = title === "Last 5 matches" ? t("profile.lastFiveMatches") : title;
    const resolvedDescription =
        description === "Showing your latest validated match results."
            ? t("profile.lastFiveMatchesBody")
            : description;
    const resolvedEmptyTitle =
        emptyTitle === "No recent validated matches yet"
            ? t("profile.noRecentMatches")
            : emptyTitle;
    const resolvedEmptyDescription =
        emptyDescription ===
        "Once a joined match has an accepted result, it will appear here."
            ? t("profile.noRecentMatchesBody")
            : emptyDescription;

    return (
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{resolvedTitle}</h2>
                    <p className="mt-2 text-sm text-slate-500">
                        {resolvedDescription}
                    </p>
                </div>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase text-emerald-700">
                    {t("profile.validatedOnly")}
                </span>

                {headerAction}
            </div>

            {loading ? (
                <p className="mt-6 text-sm text-slate-500">{t("profile.loadingRecentMatches")}</p>
            ) : null}

            {!loading && matches.length === 0 ? (
                <div className="mt-6 rounded-3xl bg-slate-50 p-6 text-center">
                    <p className="font-bold text-slate-900">{resolvedEmptyTitle}</p>
                    <p className="mt-2 text-sm text-slate-500">
                        {resolvedEmptyDescription}
                    </p>
                </div>
            ) : null}

            {!loading && matches.length > 0 ? (
                <div className="mt-6">
                    <ProfileMatchHistoryCards matches={matches} />
                </div>
            ) : null}
        </div>
    );
}
