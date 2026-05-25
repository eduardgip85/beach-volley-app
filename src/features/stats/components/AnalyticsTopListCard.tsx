import { MapPin, Trophy, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AnalyticsPanel } from "./AnalyticsPanel";
import type {
  AnalyticsTopLocation,
  AnalyticsTopRatedPlayer,
  AnalyticsTopUser,
} from "../types/stats.types";

type TopListItem =
  | AnalyticsTopUser
  | AnalyticsTopLocation
  | AnalyticsTopRatedPlayer;

interface AnalyticsTopListCardProps {
  title: string;
  description?: string;
  items: TopListItem[];
}

function isTopUser(item: TopListItem): item is AnalyticsTopUser {
  return "activityCount" in item;
}

function isTopLocation(item: TopListItem): item is AnalyticsTopLocation {
  return "locationName" in item;
}

function isTopRatedPlayer(item: TopListItem): item is AnalyticsTopRatedPlayer {
  return "competitiveRating" in item;
}

export function AnalyticsTopListCard({
  title,
  description,
  items,
}: AnalyticsTopListCardProps) {
  const { t } = useTranslation();

  return (
    <AnalyticsPanel title={title} description={description}>
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
            {t("adminStats.topList.noData")}
          </div>
        )}

        {items.map((item, index) => (
          <div
            key={isTopLocation(item) ? item.locationName : item.id}
            className="flex items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3 sm:px-4"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-xs font-black text-white sm:h-10 sm:w-10 sm:text-sm">
              #{index + 1}
            </div>

            {isTopUser(item) && (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white sm:h-11 sm:w-11">
                  {item.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-950 sm:text-base">
                    {item.fullName}
                  </p>
                  <p className="text-xs text-slate-500 sm:text-sm">
                    {t("adminStats.topList.eventActions", {
                      count: item.activityCount,
                    })}
                  </p>
                </div>
                <User className="shrink-0 text-slate-400" size={18} />
              </>
            )}

            {isTopLocation(item) && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-950 sm:text-base">
                    {item.locationName}
                  </p>
                  <p className="text-xs text-slate-500 sm:text-sm">
                    {t("adminStats.topList.scheduledEvents", {
                      count: item.eventsCount,
                    })}
                  </p>
                </div>
                <MapPin className="shrink-0 text-slate-400" size={18} />
              </>
            )}

            {isTopRatedPlayer(item) && (
              <>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500 text-sm font-black text-slate-950 sm:h-11 sm:w-11">
                  {item.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-950 sm:text-base">
                    {item.fullName}
                  </p>
                  <p className="text-xs text-slate-500 sm:text-sm">
                    {t("adminStats.topList.winLoss", {
                      wins: item.wins,
                      losses: item.losses,
                    })}
                    {item.country ? ` - ${item.country}` : ""}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-black text-slate-950 sm:text-base">
                    {item.competitiveRating}
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
                    {t("adminStats.topList.rating")}
                  </p>
                </div>
                <Trophy className="shrink-0 text-amber-500" size={18} />
              </>
            )}
          </div>
        ))}
      </div>
    </AnalyticsPanel>
  );
}
