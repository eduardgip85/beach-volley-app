import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";

interface SettingsSectionProps {
    icon: ReactNode;
    title: string;
    description: string;
    children: ReactNode;
    defaultOpen?: boolean;
}

export function SettingsSection({
    icon,
    title,
    description,
    children,
    defaultOpen = false,
}: SettingsSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <section className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-6 md:p-8">
            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className="flex w-full items-start justify-between gap-4 text-left"
            >
                <div className="flex items-start gap-4">
                    <div className="rounded-2xl bg-blue-50 p-3 text-blue-600">
                        {icon}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
                        <p className="mt-2 text-sm leading-6 text-slate-500">
                            {description}
                        </p>
                    </div>
                </div>

                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                    <ChevronDown
                        className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                </span>
            </button>

            {isOpen ? <div className="mt-6">{children}</div> : null}
        </section>
    );
}
