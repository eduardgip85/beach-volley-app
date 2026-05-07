import { Link } from "react-router-dom";

export function HomeShortCut({
    to,
    icon,
    title,
    description,
}: {
    to: string;
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <Link
        to={to}
        className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:bg-blue-100 hover:shadow-md"
        >
            <div className="text-blue-600">{icon}</div>

            <h2 className="mt-4 font-bold text-slate-900">{title}</h2>

            <p className="mt-2 text-sm text-slate-500">{description}</p>
        </Link>
    );
}