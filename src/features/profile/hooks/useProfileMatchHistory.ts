import { useEffect, useState } from "react";
import { t } from "i18next";
import { getProfileMatchHistory } from "../services/profileMatchHistory.service";
import type { ProfileMatchHistoryModeFilter, ProfileRecentMatch } from "../types/profileStats.types";

interface UseProfileMatchHistoryOptions {
    modeFilter?: ProfileMatchHistoryModeFilter;
    limitCount?: number;
}

export function useProfileMatchHistory(
    userId?: string,
    {
        modeFilter = "all",
        limitCount,
    }: UseProfileMatchHistoryOptions = {}
) {
    const [matches, setMatches] = useState<ProfileRecentMatch[]>([]);
    const [loading, setLoading] = useState(Boolean(userId));
    const [error, setError] = useState("");

    useEffect(() => {
        let isCancelled = false;

        async function loadMatchHistory() {
            if (!userId) {
                setMatches([]);
                setLoading(false);
                setError("");
                return;
            }

            try {
                setLoading(true);
                setError("");

                const data = await getProfileMatchHistory(userId, modeFilter, limitCount);

                if (!isCancelled) {
                    setMatches(data);
                }
            } catch (loadError) {
                console.error(loadError);

                if (!isCancelled) {
                    setMatches([]);
                    setError(t("profile.matchHistoryLoadError"));
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        }

        loadMatchHistory();

        return () => {
            isCancelled = true;
        };
    }, [limitCount, modeFilter, userId]);

    return {
        matches,
        loading,
        error,
    };
}
