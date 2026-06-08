import {
    Bell,
    CalendarDays,
    CheckCheck,
    ChevronRight,
    Lightbulb,
    Medal,
    Settings2,
    Trophy,
    Users,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { isNativePlatform } from "../../../shared/mobile/capacitor";
import { useNotifications } from "../hooks/useNotifications";
import type {
    NotificationCategory,
    NotificationPreferences,
} from "../types/notification.types";

const categoryIcons = {
    friends: Users,
    events: CalendarDays,
    results: Medal,
    tournaments: Trophy,
    product: Lightbulb,
};

const categoryClasses = {
    friends: "bg-blue-100 text-blue-700",
    events: "bg-cyan-100 text-cyan-700",
    results: "bg-amber-100 text-amber-800",
    tournaments: "bg-emerald-100 text-emerald-700",
    product: "bg-rose-100 text-rose-700",
};

export function NotificationsPage() {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { profile } = useAuth();
    const { notifications, preferences, loading, savingPreferences, error, actions } =
        useNotifications(profile?.id);
    const [filter, setFilter] = useState<"all" | "unread">("all");
    const [showPreferences, setShowPreferences] = useState(false);

    const visibleNotifications =
        filter === "unread"
            ? notifications.filter((notification) => !notification.readAt)
            : notifications;
    const unreadCount = notifications.filter((notification) => !notification.readAt).length;

    async function openNotification(notificationId: string, deepLink: string | null) {
        await actions.markRead(notificationId);
        if (deepLink) navigate(deepLink);
    }

    return (
        <section className="space-y-5">
            <div className="overflow-hidden rounded-[2rem] bg-slate-950 p-5 text-white shadow-xl sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-5">
                    <div className="flex items-start gap-4">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.4rem] bg-yellow-300 text-slate-950">
                            <Bell size={27} />
                        </span>
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.22em] text-blue-300">
                                {t("notifications.eyebrow")}
                            </p>
                            <h1 className="mt-2 text-2xl font-black sm:text-4xl">
                                {t("notifications.title")}
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                                {t("notifications.body")}
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setShowPreferences((current) => !current)}
                            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-white/10 px-4 text-sm font-bold transition hover:bg-white/15"
                        >
                            <Settings2 size={17} />
                            <span className="hidden sm:inline">{t("notifications.preferences")}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => void actions.markAllRead()}
                            disabled={unreadCount === 0}
                            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-white px-4 text-sm font-bold text-slate-950 transition disabled:opacity-40"
                        >
                            <CheckCheck size={17} />
                            <span className="hidden sm:inline">{t("notifications.markAllRead")}</span>
                        </button>
                    </div>
                </div>
            </div>

            {showPreferences && preferences ? (
                <NotificationPreferencesPanel
                    preferences={preferences}
                    saving={savingPreferences}
                    onSave={actions.savePreferences}
                />
            ) : null}

            <div className="flex items-center gap-2 overflow-x-auto rounded-2xl bg-white p-2 shadow-sm">
                {(["all", "unread"] as const).map((option) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => setFilter(option)}
                        className={`whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                            filter === option
                                ? "bg-slate-950 text-white"
                                : "text-slate-500 hover:bg-slate-100"
                        }`}
                    >
                        {t(`notifications.filters.${option}`)}
                        {option === "unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}
                    </button>
                ))}
            </div>

            {error ? (
                <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                    {t(error === "save" ? "notifications.saveError" : "notifications.loadError")}
                </p>
            ) : null}

            {loading ? (
                <p className="rounded-[1.75rem] bg-white p-6 text-sm text-slate-500 shadow-sm">
                    {t("notifications.loading")}
                </p>
            ) : visibleNotifications.length === 0 ? (
                <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
                    <Bell className="mx-auto text-slate-300" size={36} />
                    <h2 className="mt-4 text-lg font-black text-slate-950">
                        {t(filter === "unread" ? "notifications.emptyUnreadTitle" : "notifications.emptyTitle")}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        {t(filter === "unread" ? "notifications.emptyUnreadBody" : "notifications.emptyBody")}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {visibleNotifications.map((notification) => {
                        const Icon = categoryIcons[notification.category];
                        const translationData = notification.data.status
                            ? {
                                  ...notification.data,
                                  status: t(`notifications.statuses.${notification.data.status}`),
                              }
                            : notification.data;
                        return (
                            <button
                                key={notification.id}
                                type="button"
                                onClick={() =>
                                    void openNotification(notification.id, notification.deepLink)
                                }
                                className={`flex w-full items-start gap-3 rounded-[1.6rem] border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${
                                    notification.readAt
                                        ? "border-slate-200 bg-white"
                                        : "border-blue-200 bg-blue-50/70"
                                }`}
                            >
                                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${categoryClasses[notification.category]}`}>
                                    <Icon size={20} />
                                </span>
                                <span className="min-w-0 flex-1">
                                    <span className="flex items-center gap-2">
                                        <span className="font-black text-slate-950">
                                            {t(notification.titleKey, translationData)}
                                        </span>
                                        {!notification.readAt ? (
                                            <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
                                        ) : null}
                                    </span>
                                    <span className="mt-1 block text-sm leading-6 text-slate-600">
                                        {t(notification.bodyKey, translationData)}
                                    </span>
                                    <span className="mt-2 block text-xs font-bold uppercase tracking-[0.14em] text-slate-400">
                                        {new Intl.DateTimeFormat(i18n.language, {
                                            dateStyle: "medium",
                                            timeStyle: "short",
                                        }).format(new Date(notification.createdAt))}
                                    </span>
                                </span>
                                <ChevronRight className="mt-2 shrink-0 text-slate-400" size={18} />
                            </button>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

function NotificationPreferencesPanel({
    preferences,
    saving,
    onSave,
}: {
    preferences: NotificationPreferences;
    saving: boolean;
    onSave: (preferences: NotificationPreferences) => Promise<void>;
}) {
    const { t } = useTranslation();
    const nativePushAvailable = isNativePlatform();
    const [draft, setDraft] = useState(preferences);
    const categories: Array<{ key: NotificationCategory; field: keyof NotificationPreferences }> = [
        { key: "friends", field: "friendsEnabled" },
        { key: "events", field: "eventsEnabled" },
        { key: "results", field: "resultsEnabled" },
        { key: "tournaments", field: "tournamentsEnabled" },
        { key: "product", field: "productEnabled" },
    ];

    return (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h2 className="text-xl font-black text-slate-950">
                        {t("notifications.preferencesTitle")}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        {t("notifications.preferencesBody")}
                    </p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-amber-800">
                    {t("notifications.pushSoon")}
                </span>
            </div>

            {nativePushAvailable ? (
              <label className="mt-5 flex items-center justify-between gap-4 rounded-2xl bg-slate-950 px-4 py-4 text-white">
                <span>
                    <span className="block text-sm font-black">
                        {t("notifications.pushToggle")}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-300">
                        {t("notifications.pushToggleBody")}
                    </span>
                </span>
                <input
                    type="checkbox"
                    checked={draft.pushEnabled}
                    onChange={(event) =>
                        setDraft((current) => ({
                            ...current,
                            pushEnabled: event.target.checked,
                        }))
                    }
                    className="h-5 w-5 shrink-0 accent-yellow-300"
                />
              </label>
            ) : null}

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {categories.map(({ key, field }) => (
                    <label key={key} className="flex items-center justify-between gap-4 rounded-2xl bg-slate-100 px-4 py-3">
                        <span className="text-sm font-bold text-slate-800">
                            {t(`notifications.categories.${key}`)}
                        </span>
                        <input
                            type="checkbox"
                            checked={Boolean(draft[field])}
                            onChange={(event) =>
                                setDraft((current) => ({
                                    ...current,
                                    [field]: event.target.checked,
                                }))
                            }
                            className="h-5 w-5 accent-blue-600"
                        />
                    </label>
                ))}
            </div>

            <button
                type="button"
                disabled={saving}
                onClick={() => void onSave(draft)}
                className="mt-5 w-full rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white disabled:opacity-50 sm:w-auto"
            >
                {saving ? t("notifications.saving") : t("notifications.savePreferences")}
            </button>
        </div>
    );
}
