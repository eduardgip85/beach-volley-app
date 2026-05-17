import { MapPin, Trophy, User } from "lucide-react";
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
  return (
    <AnalyticsPanel title={title} description={description}>
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
            No data available for this range yet.
          </div>
        )}

        {items.map((item, index) => (
          <div
            key={isTopLocation(item) ? item.locationName : item.id}
            className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black text-white">
              #{index + 1}
            </div>

            {isTopUser(item) && (
              <>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white">
                  {item.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-slate-950">{item.fullName}</p>
                  <p className="text-sm text-slate-500">{item.activityCount} event actions</p>
                </div>
                <User className="shrink-0 text-slate-400" size={18} />
              </>
            )}

            {isTopLocation(item) && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-slate-950">{item.locationName}</p>
                  <p className="text-sm text-slate-500">{item.eventsCount} scheduled events</p>
                </div>
                <MapPin className="shrink-0 text-slate-400" size={18} />
              </>
            )}

            {isTopRatedPlayer(item) && (
              <>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-sm font-black text-slate-950">
                  {item.fullName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-slate-950">{item.fullName}</p>
                  <p className="text-sm text-slate-500">
                    {item.wins}/{item.losses} W/L
                    {item.country ? ` · ${item.country}` : ""}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-black text-slate-950">{item.competitiveRating}</p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Rating
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
