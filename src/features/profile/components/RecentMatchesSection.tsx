import { useTranslation } from "react-i18next";
import { ProfileMatchHistoryCards } from "./ProfileMatchHistoryCards";
import type { ProfileRecentMatch } from "../types/profileStats.types";

interface RecentMatchesSectionProps {
    matches: ProfileRecentMatch[];
    loading?: boolean;
}

export function RecentMatchesSection({
    matches,
    loading = false,
}: RecentMatchesSectionProps) {
    const { t } = useTranslation();

    return (
        <section className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-6 md:p-8">
            <div className="mb-5">
                <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
                    {t("profile.lastFiveMatches")}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                    {t("profile.lastFiveMatchesBody")}
                </p>
            </div>

            {loading ? (
                <p className="rounded-3xl bg-slate-50 p-6 text-sm text-slate-500">
                    {t("profile.loadingRecentMatches")}
                </p>
            ) : matches.length === 0 ? (
                <div className="rounded-3xl bg-slate-50 p-6 text-center">
                    <p className="font-bold text-slate-900">
                        {t("profile.noRecentMatches")}
                    </p>
                    <p className="mt-2 text-sm text-slate-500">
                        {t("profile.noRecentMatchesBody")}
                    </p>
                </div>
            ) : (
                <ProfileMatchHistoryCards matches={matches} />
            )}
        </section>
    );
}
