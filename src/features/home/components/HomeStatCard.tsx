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
        <div className="flex items-center gap-5 rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                {icon}
            </div>

            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500">
                {label}
                </p>
                <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
            </div>
        </div>
    );
}