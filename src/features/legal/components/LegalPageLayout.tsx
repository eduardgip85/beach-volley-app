import { useEffect, type ReactNode } from "react";
import { Link } from "react-router-dom";

interface LegalPageLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function LegalPageLayout({
  title,
  description,
  children,
}: LegalPageLayoutProps) {
  useEffect(() => {
    const previousTitle = document.title;
    const descriptionTag = document.querySelector('meta[name="description"]');
    const previousDescription = descriptionTag?.getAttribute("content") ?? null;

    document.title = title;

    if (descriptionTag) {
      descriptionTag.setAttribute("content", description);
    }

    return () => {
      document.title = previousTitle;

      if (descriptionTag && previousDescription) {
        descriptionTag.setAttribute("content", previousDescription);
      }
    };
  }, [description, title]);

  return (
    <section className="mx-auto w-full max-w-4xl px-3 py-3 sm:px-5 md:px-0">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:p-6 md:p-8">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6">
          <Link
            to="/"
            className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-slate-600 transition hover:bg-slate-100"
          >
            SandSet
          </Link>
          <div>
            <h1 className="text-3xl font-black text-slate-950 md:text-4xl">
              {title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-8 text-sm leading-7 text-slate-700">
          {children}
        </div>
      </div>
    </section>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-xl font-black text-slate-950">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

