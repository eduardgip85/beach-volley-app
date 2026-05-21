import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  MapPin,
  Pencil,
  Search,
  Trash2,
  UserCircle2,
} from "lucide-react";
import { useDeferredValue, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { deleteEvent } from "../../events/services/events.service";
import { isUnlimitedEventCapacity } from "../../events/types/event.types";
import {
  getEventBadgeClasses,
  getEventDisplayStatus,
  getEventModeLabel,
  getEventTypeLabel,
  getEventVisibilityBadgeClasses,
  getEventVisibilityLabel,
} from "../../events/utils/event-display.utils";
import { useAdminEvents } from "../hooks/useAdminEvents";

const PAGE_SIZE = 12;

export function AdminEventsPage() {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [hideInactive, setHideInactive] = useState(false);
  const deferredSearch = useDeferredValue(searchInput.trim());
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const { items, totalCount, summary, loading, error: loadError, setItems } = useAdminEvents({
    page,
    pageSize: PAGE_SIZE,
    search: deferredSearch,
    onlyVisibleActive: hideInactive,
  });

  useEffect(() => {
    setPage(1);
  }, [deferredSearch, hideInactive]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const visibleFrom = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const visibleTo = Math.min(page * PAGE_SIZE, totalCount);

  async function handleDelete(eventId: string) {
    const confirmed = window.confirm(t("adminEvents.deleteConfirm"));

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(eventId);
      setError("");

      await deleteEvent(eventId);

      setItems((currentItems) =>
        currentItems.filter((item) => item.event.id !== eventId)
      );
    } catch (err) {
      console.error(err);
      setError(t("adminEvents.deleteError"));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-6 md:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-600">
              {t("adminEvents.eyebrow")}
            </p>
            <h1 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
              {t("adminEvents.title")}
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
              {t("adminEvents.body")}
            </p>
          </div>

          <Link
            to="/profile"
            className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-bold text-white"
        >
          {t("adminEvents.backToProfile")}
        </Link>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 xl:grid-cols-4">
          <SummaryCard label={t("adminEvents.totalResults")} value={totalCount} accent="blue" />
          <SummaryCard label={t("adminEvents.active")} value={summary.active} accent="emerald" />
          <SummaryCard label={t("adminEvents.finished")} value={summary.finished} accent="amber" />
          <SummaryCard label={t("adminEvents.cancelled")} value={summary.cancelled} accent="rose" />
        </div>

        <div className="mt-5 flex flex-col gap-3 rounded-[1.5rem] bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="relative block w-full sm:max-w-md">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={t("adminEvents.searchPlaceholder")}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </label>

          <div className="flex flex-col gap-3 sm:items-end">
            <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-600">
              <input
                type="checkbox"
                checked={hideInactive}
                onChange={(event) => setHideInactive(event.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              {t("adminEvents.hideInactive")}
            </label>

            <span className="text-sm text-slate-500">
              {t("adminEvents.showingRange", {
                from: visibleFrom,
                to: visibleTo,
                total: totalCount,
              })}
            </span>
          </div>
        </div>
      </div>

      {(error || loadError) && (
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600">
          {error || loadError}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-56 animate-pulse rounded-[1.75rem] bg-white shadow-sm"
            />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-[2rem] bg-white p-8 text-center shadow-sm">
          <p className="font-semibold text-slate-900">{t("adminEvents.noEventsTitle")}</p>
          <p className="mt-2 text-sm text-slate-500">
            {t("adminEvents.noEventsBody")}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 xl:hidden">
            {items.map((item) => (
              <MobileAdminEventCard
                key={item.event.id}
                item={item}
                deleting={deletingId === item.event.id}
                onDelete={handleDelete}
                locale={i18n.language}
              />
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-[2rem] bg-white shadow-sm xl:block">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-sm text-slate-500">
                <tr>
                  <th className="px-6 py-4">{t("adminEvents.tableEvent")}</th>
                  <th className="px-6 py-4">{t("adminEvents.tableCreator")}</th>
                  <th className="px-6 py-4">{t("adminEvents.tableLocation")}</th>
                  <th className="px-6 py-4">{t("adminEvents.tableSchedule")}</th>
                  <th className="px-6 py-4">{t("adminEvents.tableCapacity")}</th>
                  <th className="px-6 py-4 text-right">{t("adminEvents.tableActions")}</th>
                </tr>
              </thead>

              <tbody>
                {items.map((item) => (
                  <DesktopAdminEventRow
                    key={item.event.id}
                    item={item}
                    deleting={deletingId === item.event.id}
                    onDelete={handleDelete}
                    locale={i18n.language}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 rounded-[1.75rem] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <p className="text-sm text-slate-500">
              {t("adminEvents.pageOf", { page, total: totalPages })}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
                {t("adminEvents.previous")}
              </button>

              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page >= totalPages}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {t("adminEvents.next")}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function MobileAdminEventCard({
  item,
  deleting,
  onDelete,
  locale,
}: {
  item: ReturnType<typeof useAdminEvents>["items"][number];
  deleting: boolean;
  onDelete: (eventId: string) => void;
  locale: string;
}) {
  const { t } = useTranslation();
  const { event, creatorName, creatorAvatarUrl } = item;
  const modeLabel = event.type === "match" ? getEventModeLabel(event.mode) : null;

  return (
    <article className="rounded-[1.75rem] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getEventBadgeClasses(
                event
              )}`}
            >
              {getEventTypeLabel(event.type)}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getEventVisibilityBadgeClasses(
                event.visibility
              )}`}
            >
              {getEventVisibilityLabel(event.visibility)}
            </span>

            {modeLabel && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                {modeLabel}
              </span>
            )}
          </div>

          <h2 className="mt-3 truncate text-lg font-black text-slate-950">
            {event.title}
          </h2>

          <div className="mt-4 space-y-2 text-sm text-slate-500">
            <InfoRow
              icon={<UserCircle2 size={16} />}
              label={creatorName ?? t("adminEvents.unknownCreator")}
              avatarUrl={creatorAvatarUrl}
            />
            <InfoRow
              icon={<MapPin size={16} />}
              label={event.locationName || t("adminEvents.locationPending")}
            />
            <InfoRow
              icon={<CalendarDays size={16} />}
              label={new Date(event.startDate).toLocaleString(locale)}
            />
          </div>
        </div>

        <button
          onClick={() => onDelete(event.id)}
          disabled={deleting}
          className="rounded-2xl bg-red-50 p-3 text-red-600 disabled:opacity-50"
          aria-label={`${t("adminEvents.delete")} ${event.title}`}
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 rounded-[1.25rem] bg-slate-50 p-3">
        <MiniStat label={t("adminEvents.status")} value={getEventDisplayStatus(event)} />
        <MiniStat
          label={t("adminEvents.capacity")}
          value={
            isUnlimitedEventCapacity(event.maxParticipants)
              ? t("adminEvents.unlimited")
              : `${event.maxParticipants}`
          }
        />
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <ActionLink to={`/events/${event.id}`} label={t("adminEvents.view")} icon={<Eye size={16} />} />
        <ActionLink
          to={`/events/${event.id}/edit`}
          label={t("adminEvents.edit")}
          icon={<Pencil size={16} />}
          variant="secondary"
        />
        <button
          type="button"
          onClick={() => onDelete(event.id)}
          disabled={deleting}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 disabled:opacity-50"
        >
          <Trash2 size={16} />
          {deleting ? t("adminEvents.deleting") : t("adminEvents.delete")}
        </button>
      </div>
    </article>
  );
}

function DesktopAdminEventRow({
  item,
  deleting,
  onDelete,
  locale,
}: {
  item: ReturnType<typeof useAdminEvents>["items"][number];
  deleting: boolean;
  onDelete: (eventId: string) => void;
  locale: string;
}) {
  const { t } = useTranslation();
  const { event, creatorName, creatorAvatarUrl } = item;
  const modeLabel = event.type === "match" ? getEventModeLabel(event.mode) : null;

  return (
    <tr className="border-t border-slate-100 align-top">
      <td className="px-6 py-5">
        <div className="min-w-0">
          <div className="flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getEventBadgeClasses(
                event
              )}`}
            >
              {getEventTypeLabel(event.type)}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${getEventVisibilityBadgeClasses(
                event.visibility
              )}`}
            >
              {getEventVisibilityLabel(event.visibility)}
            </span>
            {modeLabel && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                {modeLabel}
              </span>
            )}
          </div>

          <p className="mt-3 font-black text-slate-950">{event.title}</p>
          {event.description && (
            <p className="mt-1 line-clamp-2 max-w-md text-sm text-slate-500">
              {event.description}
            </p>
          )}
        </div>
      </td>

      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <CreatorAvatar
            fullName={creatorName ?? "?"}
            avatarUrl={creatorAvatarUrl}
          />
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">
              {creatorName ?? t("adminEvents.unknownCreator")}
            </p>
            <p className="text-sm text-slate-500">{event.createdBy}</p>
          </div>
        </div>
      </td>

      <td className="px-6 py-5 text-sm text-slate-500">
        <div className="flex items-start gap-2">
          <MapPin size={16} className="mt-0.5 shrink-0 text-slate-400" />
          <span>{event.locationName || t("adminEvents.locationPending")}</span>
        </div>
      </td>

      <td className="px-6 py-5 text-sm text-slate-500">
        <div>{new Date(event.startDate).toLocaleString(locale)}</div>
        <div className="mt-1 font-semibold text-slate-700">
          {getEventDisplayStatus(event)}
        </div>
      </td>

      <td className="px-6 py-5 text-sm text-slate-500">
        {isUnlimitedEventCapacity(event.maxParticipants)
          ? t("adminEvents.unlimited")
          : event.maxParticipants}
      </td>

      <td className="px-6 py-5">
        <div className="flex items-center justify-end gap-2">
          <ActionLink
            to={`/events/${event.id}`}
            label={t("adminEvents.view")}
            icon={<Eye size={15} />}
            compact
          />
          <ActionLink
            to={`/events/${event.id}/edit`}
            label={t("adminEvents.edit")}
            icon={<Pencil size={15} />}
            variant="secondary"
            compact
          />
          <button
            onClick={() => onDelete(event.id)}
            disabled={deleting}
            className="inline-flex items-center gap-2 rounded-2xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600 disabled:opacity-50"
          >
            <Trash2 size={15} />
            {deleting ? t("adminEvents.deleting") : t("adminEvents.delete")}
          </button>
        </div>
      </td>
    </tr>
  );
}

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "blue" | "emerald" | "amber" | "rose";
}) {
  const accentClasses = {
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
  } as const;

  return (
    <div className="rounded-[1.25rem] border border-slate-100 bg-slate-50 p-4">
      <div
        className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${accentClasses[accent]}`}
      >
        {label}
      </div>
      <p className="mt-3 text-2xl font-black text-slate-950">{value}</p>
    </div>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-white px-3 py-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-black text-slate-950">{value}</p>
    </div>
  );
}

function ActionLink({
  to,
  label,
  icon,
  variant = "primary",
  compact = false,
}: {
  to: string;
  label: string;
  icon: React.ReactNode;
  variant?: "primary" | "secondary";
  compact?: boolean;
}) {
  const classes =
    variant === "primary"
      ? "bg-slate-900 text-white"
      : "bg-blue-50 text-blue-700";

  return (
    <Link
      to={to}
      className={`inline-flex items-center justify-center gap-2 rounded-2xl font-bold ${classes} ${
        compact ? "px-3 py-2 text-sm" : "px-4 py-3 text-sm"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function InfoRow({
  icon,
  label,
  avatarUrl,
}: {
  icon: React.ReactNode;
  label: string;
  avatarUrl?: string | null;
}) {
  return (
    <div className="flex items-center gap-2">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={label}
          className="h-5 w-5 rounded-full object-cover"
        />
      ) : (
        <span className="text-slate-400">{icon}</span>
      )}
      <span className="truncate">{label}</span>
    </div>
  );
}

function CreatorAvatar({
  fullName,
  avatarUrl,
}: {
  fullName: string;
  avatarUrl: string | null;
}) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={fullName}
        className="h-11 w-11 rounded-2xl object-cover"
      />
    );
  }

  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white">
      {fullName.charAt(0).toUpperCase()}
    </div>
  );
}
