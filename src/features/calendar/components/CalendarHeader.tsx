import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "react-i18next";

interface CalendarHeaderProps {
    currentMonth: Date;
    onPreviousMonth: () => void;
    onNextMonth: () => void;
}

export function CalendarHeader({
    currentMonth,
    onPreviousMonth,
    onNextMonth,
}: CalendarHeaderProps) {
    const { i18n } = useTranslation();
    return (
        <div className="flex items-center justify-between gap-3 rounded-3xl bg-white px-4 py-4 shadow-sm sm:px-5">
            <h1 className="min-w-0 text-xl font-black text-slate-950 sm:text-2xl md:text-3xl">
                {currentMonth.toLocaleString(i18n.language, {
                    month: "long",
                    year: "numeric",
                })}
            </h1>

            <div className="flex shrink-0 rounded-2xl bg-blue-300 p-1">
                <button
                    type="button"
                    onClick={onPreviousMonth}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 hover:bg-white sm:h-10 sm:w-10"
                >
                    <ChevronLeft size={20} />
                </button>

                <button
                    type="button"
                    onClick={onNextMonth}
                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-700 hover:bg-white sm:h-10 sm:w-10"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
