import { CircleHelp, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { getCompetitiveRatingDetailedLegend } from "../../ratings/utils/rating-display.utils";

interface RankingLegendModalProps {
    open: boolean;
    onClose: () => void;
}

const tierClasses: Record<string, string> = {
    Initiation: "bg-slate-100 text-slate-700",
    "Initiation / Intermediate": "bg-blue-100 text-blue-700",
    Intermediate: "bg-indigo-100 text-indigo-700",
    "Intermediate / High": "bg-violet-100 text-violet-700",
    "High / Advanced": "bg-cyan-100 text-cyan-700",
    Advanced: "bg-sky-100 text-sky-700",
    "Advanced / Elite": "bg-amber-100 text-amber-700",
    Elite: "bg-emerald-100 text-emerald-700",
    "Elite / Pro": "bg-lime-100 text-lime-700",
    Pro: "bg-rose-100 text-rose-700",
    "Pro / Elite": "bg-fuchsia-100 text-fuchsia-700",
};

export function RankingLegendModal({
    open,
    onClose,
}: RankingLegendModalProps) {
    const { t } = useTranslation();

    if (!open) {
        return null;
    }

    const legend = getCompetitiveRatingDetailedLegend();

    return (
        <div className="fixed inset-0 z-[70]">
            <button
                type="button"
                aria-label={t("ranking.closeRatingLegend")}
                className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px]"
                onClick={onClose}
            />

            <div className="absolute inset-x-0 bottom-0 top-6 mx-auto flex max-w-5xl px-3 sm:top-10 sm:px-6">
                <div className="flex w-full flex-col overflow-hidden rounded-t-[2rem] bg-white shadow-2xl sm:rounded-[2rem]">
                    <div className="border-b border-slate-200 bg-[linear-gradient(180deg,_#f8fbff_0%,_#eef4ff_100%)] px-4 py-4 sm:px-6 sm:py-5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-300 text-slate-950 shadow-sm">
                                    <CircleHelp size={22} />
                                </div>
                                <p className="mt-4 text-xs font-black uppercase tracking-[0.24em] text-blue-600">
                                    {t("ranking.legendEyebrow")}
                                </p>
                                <h3 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
                                    {t("ranking.legendTitle")}
                                </h3>
                                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                                    {t("ranking.legendBody")}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-50 hover:text-slate-900"
                                aria-label={t("ranking.closeLegend")}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto bg-slate-50 px-3 py-3 sm:px-5 sm:py-5">
                        <div className="space-y-3">
                            {legend.map((item) => (
                                <article
                                    key={item.rating}
                                    className="grid gap-3 rounded-[1.5rem] bg-white p-4 ring-1 ring-slate-200 sm:grid-cols-[88px_1fr_auto] sm:items-center"
                                >
                                    <div className="flex items-baseline gap-2 sm:block">
                                        <p className="text-3xl font-black tracking-tight text-slate-950 sm:text-[2.4rem]">
                                            {item.rating}
                                        </p>
                                        <span className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400 sm:mt-2 sm:block">
                                            Level
                                        </span>
                                    </div>

                                    <div className="min-w-0">
                                        <p className="text-lg font-black text-slate-950">
                                            {item.title}
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-slate-600">
                                            {item.description}
                                        </p>
                                    </div>

                                    <div className="sm:text-right">
                                        <span
                                            className={`inline-flex rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.18em] ${
                                                tierClasses[item.tier] ?? "bg-slate-100 text-slate-700"
                                            }`}
                                        >
                                            {item.tier}
                                        </span>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
