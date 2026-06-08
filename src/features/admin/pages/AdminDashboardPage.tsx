import {
  BarChart3,
  CalendarDays,
  ChevronRight,
  Lightbulb,
  ShieldCheck,
  UserPlus,
  UserX,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useOutletContext } from "react-router-dom";
import type { AdminNotificationsState } from "../hooks/useAdminNotifications";

interface AdminShortcut {
  title: string;
  description: string;
  cta: string;
  path: string;
  icon: typeof BarChart3;
  accent: "blue" | "emerald" | "amber" | "rose";
  showNotification?: boolean;
  notificationLabel?: string;
}

const accentClasses: Record<AdminShortcut["accent"], string> = {
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
};

export function AdminDashboardPage() {
  const { t } = useTranslation();
  const {
    showAdminUsersNotification,
    showAdminIdeasNotification,
  } = useOutletContext<AdminNotificationsState>();

  const shortcuts: AdminShortcut[] = [
    {
      title: t("adminHub.shortcuts.statsTitle"),
      description: t("adminHub.shortcuts.statsDescription"),
      cta: t("adminHub.open"),
      path: "/admin/stats",
      icon: BarChart3,
      accent: "blue",
    },
    {
      title: t("adminHub.shortcuts.usersTitle"),
      description: t("adminHub.shortcuts.usersDescription"),
      cta: t("adminHub.open"),
      path: "/admin/users",
      icon: UserPlus,
      accent: "emerald",
      showNotification: showAdminUsersNotification,
      notificationLabel: t("adminHub.notifications.newUsers"),
    },
    {
      title: t("adminHub.shortcuts.eventsTitle"),
      description: t("adminHub.shortcuts.eventsDescription"),
      cta: t("adminHub.open"),
      path: "/admin/events",
      icon: CalendarDays,
      accent: "amber",
    },
    {
      title: t("adminHub.shortcuts.ideasTitle"),
      description: t("adminHub.shortcuts.ideasDescription"),
      cta: t("adminHub.open"),
      path: "/admin/ideas",
      icon: Lightbulb,
      accent: "rose",
      showNotification: showAdminIdeasNotification,
      notificationLabel: t("adminHub.notifications.pendingIdeas"),
    },
    {
      title: t("adminHub.shortcuts.deletionRequestsTitle"),
      description: t("adminHub.shortcuts.deletionRequestsDescription"),
      cta: t("adminHub.open"),
      path: "/admin/deletion-requests",
      icon: UserX,
      accent: "rose",
    },
  ];

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-sm md:p-8">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.25),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.18),_transparent_34%)]" />
        <div className="relative max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.2em] text-blue-100 ring-1 ring-white/10">
            <ShieldCheck size={14} />
            {t("adminHub.eyebrow")}
          </div>
          <h1 className="mt-4 text-3xl font-black sm:text-4xl">
            {t("adminHub.title")}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
            {t("adminHub.body")}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {shortcuts.map((shortcut) => (
          <AdminShortcutCard key={shortcut.path} shortcut={shortcut} />
        ))}
      </div>
    </section>
  );
}

function AdminShortcutCard({ shortcut }: { shortcut: AdminShortcut }) {
  const Icon = shortcut.icon;

  return (
    <Link
      to={shortcut.path}
      className="group relative overflow-hidden rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"
    >
      {shortcut.showNotification ? (
        <span className="absolute right-5 top-5 inline-flex items-center gap-2 rounded-full bg-rose-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-rose-700 ring-1 ring-rose-100">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          {shortcut.notificationLabel}
        </span>
      ) : null}

      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ${accentClasses[shortcut.accent]}`}
      >
        <Icon size={22} />
      </div>

      <h2 className="mt-5 pr-28 text-xl font-black text-slate-950">
        {shortcut.title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        {shortcut.description}
      </p>

      <div className="mt-5 inline-flex items-center gap-2 text-sm font-black text-slate-900">
        <span>{shortcut.cta}</span>
        <ChevronRight
          size={16}
          className="transition group-hover:translate-x-1"
        />
      </div>
    </Link>
  );
}
