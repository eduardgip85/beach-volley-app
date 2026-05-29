import { Volleyball } from "lucide-react";
import { useTranslation } from "react-i18next";

type AppLoadingScreenProps = {
  compact?: boolean;
};

export function AppLoadingScreen({
  compact = false,
}: AppLoadingScreenProps) {
  const { t } = useTranslation();

  return (
    <section
      className={`relative overflow-hidden ${
        compact ? "px-4 py-8" : "px-4 py-10 sm:px-6 sm:py-14"
      }`}
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(191,219,254,0.4),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(167,243,208,0.28),_transparent_32%)]" />

      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-[linear-gradient(135deg,_rgba(255,255,255,0.96)_0%,_rgba(239,246,255,0.92)_55%,_rgba(236,253,245,0.88)_100%)] p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/60 backdrop-blur-md sm:p-7 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-blue-700">
                <img
                  src="/logo.png"
                  alt={t("app.name")}
                  className="h-5 w-5 rounded-full object-cover"
                />
                {t("app.name")}
              </div>

              <div className="mt-5 space-y-3">
                <div className="h-5 w-32 animate-pulse rounded-full bg-blue-100" />
                <div className="h-12 w-full max-w-[34rem] animate-pulse rounded-[1.25rem] bg-slate-200/90" />
                <div className="h-12 w-full max-w-[28rem] animate-pulse rounded-[1.25rem] bg-slate-200/75" />
                <div className="h-4 w-full max-w-[36rem] animate-pulse rounded-full bg-slate-200/80" />
                <div className="h-4 w-full max-w-[26rem] animate-pulse rounded-full bg-slate-200/70" />
              </div>

              <div className="mt-6 flex items-center gap-3 text-sm font-semibold text-slate-600">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-700">
                  <Volleyball size={18} className="animate-spin" />
                </span>
                <div>
                  <p className="font-black text-slate-900">{t("common.loadingPage")}</p>
                  <p className="text-slate-500">{t("home.loadingEvents")}</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-[linear-gradient(160deg,_#0f172a_0%,_#1d4ed8_58%,_#0f766e_100%)] p-5 text-white shadow-[0_20px_50px_rgba(29,78,216,0.22)]">
              <div className="flex items-center justify-between gap-3">
                <div className="h-4 w-24 animate-pulse rounded-full bg-white/20" />
                <div className="h-7 w-7 animate-pulse rounded-full bg-white/20" />
              </div>

              <div className="mt-5 space-y-3">
                <div className="h-7 w-40 animate-pulse rounded-xl bg-white/20" />
                <div className="h-4 w-full max-w-[15rem] animate-pulse rounded-full bg-white/15" />
                <div className="h-4 w-full max-w-[12rem] animate-pulse rounded-full bg-white/15" />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="rounded-2xl bg-white/10 px-4 py-3 backdrop-blur-sm"
                  >
                    <div className="h-3 w-20 animate-pulse rounded-full bg-white/15" />
                    <div className="mt-3 h-4 w-24 animate-pulse rounded-full bg-white/20" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
