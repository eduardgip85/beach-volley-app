interface StatCardProps {
    label: string;
    value: number;
}

export function StatCard({ label, value }: StatCardProps) {
    return (
        <div className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
        </div>
    );
}