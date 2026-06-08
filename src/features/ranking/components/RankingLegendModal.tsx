import { CircleHelp, X } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getCompetitiveRatingLegend } from "../../ratings/utils/rating-display.utils";

interface RankingLegendModalProps {
    open: boolean;
    onClose: () => void;
}

const bandStyles = [
    "border-slate-200 bg-slate-50 text-slate-700",
    "border-blue-200 bg-blue-50 text-blue-700",
    "border-cyan-200 bg-cyan-50 text-cyan-800",
    "border-amber-200 bg-amber-50 text-amber-800",
    "border-emerald-200 bg-emerald-50 text-emerald-800",
    "border-rose-200 bg-rose-50 text-rose-800",
];

const bandAccentStyles = [
    "bg-slate-400",
    "bg-blue-500",
    "bg-cyan-500",
    "bg-amber-500",
    "bg-emerald-500",
    "bg-rose-500",
];

export function RankingLegendModal({
    open,
    onClose,
}: RankingLegendModalProps) {
    const { t } = useTranslation();

    useEffect(() => {
        if (!open) {
            return;
        }

        const previousOverflow = document.body.style.overflow;
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", closeOnEscape);

        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener("keydown", closeOnEscape);
        };
    }, [onClose, open]);

    if (!open) {
        return null;
    }

    const legend = getCompetitiveRatingLegend();

    return (
        <div className="fixed inset-0 z-[2500] flex items-start justify-center px-3 pb-3 pt-[calc(5rem+var(--safe-area-top)+0.75rem)] sm:px-5 sm:pb-5 md:items-center md:p-6">
            <button
                type="button"
                aria-label={t("ranking.closeRatingLegend")}
                className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px]"
                onClick={onClose}
            />

            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="ranking-legend-title"
                className="relative z-10 flex h-full min-h-0 w-full max-w-5xl flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-2xl md:h-auto md:max-h-[calc(100dvh-3rem)] md:rounded-[2rem]"
            >
                <header className="relative shrink-0 border-b border-slate-200 bg-[linear-gradient(135deg,_#f8fbff_0%,_#eef4ff_55%,_#fff9d9_100%)] px-4 py-4 sm:px-6 sm:py-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-yellow-300 text-slate-950 shadow-sm sm:inline-flex">
                            <CircleHelp size={20} />
                        </div>

                        <div className="min-w-0 flex-1 pr-12 sm:pr-0">
                            <p className="text-[0.65rem] font-black uppercase tracking-[0.22em] text-blue-600 sm:text-xs">
                                {t("ranking.legendEyebrow")}
                            </p>
                            <h3
                                id="ranking-legend-title"
                                className="mt-1 text-xl font-black leading-tight text-slate-950 sm:text-3xl"
                            >
                                {t("ranking.legendTitle")}
                            </h3>
                            <p className="mt-1.5 max-w-3xl text-xs leading-5 text-slate-500 sm:mt-2 sm:text-sm sm:leading-6">
                                {t("ranking.legendBody")}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="absolute right-4 top-4 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900 sm:static"
                            aria-label={t("ranking.closeLegend")}
                        >
                            <X size={19} />
                        </button>
                    </div>
                </header>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-100 px-3 py-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch] sm:px-5 sm:py-5">
                    <div className="mb-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                        <div className="flex items-center justify-between gap-3 text-sm font-black text-slate-950">
                            <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-slate-950 px-2 text-white">
                                0
                            </span>
                            <span className="text-center text-xs uppercase tracking-[0.16em] text-slate-500 sm:text-sm">
                                {t("ranking.fullScale")}
                            </span>
                            <span className="flex h-8 min-w-8 items-center justify-center rounded-full bg-rose-500 px-2 text-white">
                                10
                            </span>
                        </div>
                        <div className="mt-2 h-1.5 rounded-full bg-[linear-gradient(90deg,_#94a3b8_0%,_#3b82f6_20%,_#06b6d4_40%,_#f59e0b_60%,_#10b981_80%,_#f43f5e_100%)]" />
                    </div>

                    <div className="grid gap-3 md:grid-cols-2">
                        {legend.map((item, index) => (
                            <article
                                key={item.range}
                                className="relative overflow-hidden rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
                            >
                                <div
                                    aria-hidden="true"
                                    className={`absolute inset-y-0 left-0 w-1.5 ${bandAccentStyles[index]}`}
                                />
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-lg font-black text-slate-950 sm:text-xl">
                                            {item.label}
                                        </p>
                                        <p className="mt-1.5 text-sm leading-5 text-slate-600 sm:leading-6">
                                            {item.description}
                                        </p>
                                    </div>

                                    <div
                                        className={`shrink-0 rounded-xl border px-2.5 py-2 text-center ${bandStyles[index]}`}
                                    >
                                        <span className="block whitespace-nowrap text-sm font-black tracking-tight sm:text-base">
                                            {item.range}
                                        </span>
                                        <span className="mt-0.5 block text-[0.6rem] font-black uppercase tracking-[0.18em] opacity-60">
                                            {t("ratingGuide.level")}
                                        </span>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
