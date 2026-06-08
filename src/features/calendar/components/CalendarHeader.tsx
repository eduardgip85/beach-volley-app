import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CalendarHeaderProps {
    currentMonth: Date;
    onPreviousMonth: () => void;
    onNextMonth: () => void;
    onToday: () => void;
}

export function CalendarHeader({
    currentMonth,
    onPreviousMonth,
    onNextMonth,
    onToday,
}: CalendarHeaderProps) {
    const { t, i18n } = useTranslation();
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] bg-slate-950 px-4 py-4 text-white shadow-lg sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
                <span className="hidden h-11 w-11 items-center justify-center rounded-2xl bg-yellow-300 text-slate-950 sm:flex">
                    <CalendarDays size={21} />
                </span>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">
                        {t("calendar.eyebrow")}
                    </p>
                    <h1 className="min-w-0 text-xl font-black capitalize sm:text-2xl">
                        {currentMonth.toLocaleString(i18n.language, {
                            month: "long",
                            year: "numeric",
                        })}
                    </h1>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
                <button
                    type="button"
                    onClick={onToday}
                    className="rounded-xl bg-white/10 px-3 py-2.5 text-xs font-black uppercase tracking-[0.12em] transition hover:bg-white/15"
                >
                    {t("calendar.today")}
                </button>
                <div className="flex rounded-2xl bg-white/10 p-1">
                <button
                    type="button"
                    onClick={onPreviousMonth}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-white hover:bg-white/15 sm:h-10 sm:w-10"
                    aria-label={t("calendar.previousMonth")}
                >
                    <ChevronLeft size={20} />
                </button>

                <button
                    type="button"
                    onClick={onNextMonth}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-white hover:bg-white/15 sm:h-10 sm:w-10"
                    aria-label={t("calendar.nextMonth")}
                >
                    <ChevronRight size={20} />
                </button>
                </div>
            </div>
        </div>
    );
}
