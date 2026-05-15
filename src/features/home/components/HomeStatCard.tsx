export function HomeStatCard({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
}) {
    return (
        <div className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-sm md:gap-5 md:p-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 md:h-14 md:w-14">
                {icon}
            </div>

            <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 md:text-xs md:tracking-widest">
                {label}
                </p>
                <p className="mt-1 text-xl font-black text-slate-950 md:text-2xl">{value}</p>
            </div>
        </div>
    );
}
