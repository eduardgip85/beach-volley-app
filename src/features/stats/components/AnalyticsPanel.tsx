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
    <section className="rounded-[1.5rem] bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:rounded-[1.75rem] sm:p-5 md:p-6">
      <div className="mb-4 sm:mb-5">
        <h2 className="text-base font-black text-slate-950 sm:text-lg">{title}</h2>
        {description && <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">{description}</p>}
      </div>

      {children}
    </section>
  );
}
