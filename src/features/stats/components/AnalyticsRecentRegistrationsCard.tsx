import { CheckCircle2, Clock3, MapPin, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AnalyticsPanel } from "./AnalyticsPanel";
import type { AnalyticsRecentRegistration } from "../types/stats.types";

interface AnalyticsRecentRegistrationsCardProps {
  title: string;
  description?: string;
  items: AnalyticsRecentRegistration[];
}

export function AnalyticsRecentRegistrationsCard({
  title,
  description,
  items,
}: AnalyticsRecentRegistrationsCardProps) {
  const { t, i18n } = useTranslation();

  return (
    <AnalyticsPanel title={title} description={description}>
      <div className="space-y-3">
        {items.length === 0 && (
          <div className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
            {t("adminStats.recentRegistrations.empty")}
          </div>
        )}

        {items.map((item) => {
          const location = [item.city, item.country].filter(Boolean).join(", ");
          const onboardingCompleted = Boolean(item.ratingPlacementCompletedAt);

          return (
            <article
              key={item.id}
              className="flex items-start gap-3 rounded-2xl bg-slate-50 px-3 py-3 sm:px-4"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white">
                {item.fullName.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-sm font-black text-slate-950 sm:text-base">
                    {item.fullName}
                  </p>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${
                      onboardingCompleted
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {onboardingCompleted ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <Clock3 size={12} />
                    )}
                    {onboardingCompleted
                      ? t("adminStats.recentRegistrations.onboardingDone")
                      : t("adminStats.recentRegistrations.onboardingPending")}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500 sm:text-sm">
                  <span className="inline-flex items-center gap-1.5">
                    <UserPlus size={14} />
                    {new Date(item.createdAt).toLocaleString(i18n.language, {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {location ? (
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={14} />
                      {location}
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="shrink-0 rounded-2xl bg-white px-3 py-2 text-right ring-1 ring-slate-200">
                <p className="text-base font-black text-slate-950">
                  {item.competitiveRating.toFixed(2)}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {t("adminStats.recentRegistrations.rating")}
                </p>
              </div>
            </article>
          );
        })}
      </div>
    </AnalyticsPanel>
  );
}
