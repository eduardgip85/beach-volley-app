import type { ReactNode } from "react";

interface AnalyticsPanelProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function AnalyticsPanel({
  title,
  description,
  children,
}: AnalyticsPanelProps) {
  return (
    <section className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-100 md:p-6">
      <div className="mb-5">
        <h2 className="text-lg font-black text-slate-950">{title}</h2>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>

      {children}
    </section>
  );
}
