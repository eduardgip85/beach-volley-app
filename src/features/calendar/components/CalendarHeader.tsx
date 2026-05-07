import { ChevronLeft, ChevronRight } from "lucide-react";

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
    return (
        <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-slate-950 md:text-3xl">
            {currentMonth.toLocaleString("en", {
            month: "long",
            year: "numeric",
            })}
        </h1>

        <div className="flex rounded-2xl bg-blue-50 p-1">
            <button
            type="button"
            onClick={onPreviousMonth}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-white"
            >
            <ChevronLeft size={20} />
            </button>

            <button
            type="button"
            onClick={onNextMonth}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-white"
            >
            <ChevronRight size={20} />
            </button>
        </div>
        </div>
    );
}