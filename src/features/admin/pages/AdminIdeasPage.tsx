import {
  CheckCircle2,
  Clock3,
  Lightbulb,
  Loader2,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { buildSeoTitle } from "../../../shared/seo/seo";
import { usePageSeo } from "../../../shared/seo/usePageSeo";
import {
  deleteFeatureRequest,
  getFeatureRequests,
  updateFeatureRequestModerationStatus,
  updateFeatureRequestStatus,
} from "../../feature-requests/services/featureRequests.service";
import type {
  FeatureRequest,
  FeatureRequestModerationStatus,
  FeatureRequestStatus,
} from "../../feature-requests/types/featureRequest.types";

interface AdminIdeasCopy {
  seoDescription: string;
  eyebrow: string;
  title: string;
  body: string;
  pendingCard: string;
  reviewedCard: string;
  searchPlaceholder: string;
  pendingTab: string;
  reviewedTab: string;
  votes: string;
  suggestedBy: string;
  status: string;
  moderation: string;
  pendingTitle: string;
  pendingBody: string;
  reviewedTitle: string;
  reviewedBody: string;
  pendingEmpty: string;
  reviewedEmpty: string;
  showing: string;
  of: string;
  ideas: string;
  previous: string;
  next: string;
  loadError: string;
  updateStatusError: string;
  updateModerationError: string;
  deleteConfirm: string;
  deleteError: string;
  deleteLabel: string;
  deletingLabel: string;
  statusInProgress: string;
  isSpanish: boolean;
  openLabel: string;
  plannedLabel: string;
  doneLabel: string;
  rejectedLabel: string;
  duplicateLabel: string;
  hiddenLabel: string;
  pendingLabel: string;
  approvedLabel: string;
  allReviewedStatusLabel: string;
}

function getStatusClasses(status: FeatureRequestStatus) {
  switch (status) {
    case "planned":
      return "bg-blue-100 text-blue-700";
    case "in_progress":
      return "bg-amber-100 text-amber-800";
    case "done":
      return "bg-emerald-100 text-emerald-700";
    case "rejected":
      return "bg-rose-100 text-rose-700";
    case "duplicate":
      return "bg-slate-200 text-slate-700";
    case "hidden":
      return "bg-slate-900 text-white";
    default:
      return "bg-violet-100 text-violet-700";
  }
}

function formatStatusLabel(status: FeatureRequestStatus, copy: AdminIdeasCopy) {
  switch (status) {
    case "open":
      return copy.openLabel;
    case "planned":
      return copy.plannedLabel;
    case "in_progress":
      return copy.statusInProgress;
    case "done":
      return copy.doneLabel;
    case "rejected":
      return copy.rejectedLabel;
    case "duplicate":
      return copy.duplicateLabel;
    case "hidden":
      return copy.hiddenLabel;
  }
}

function formatModerationLabel(
  status: FeatureRequestModerationStatus,
  copy: AdminIdeasCopy
) {
  switch (status) {
    case "pending":
      return copy.pendingLabel;
    case "approved":
      return copy.approvedLabel;
    case "hidden":
      return copy.hiddenLabel;
  }
}

function IdeaAdminCard({
  item,
  onStatusChange,
  onModerationChange,
  onDelete,
  deleting,
  copy,
}: {
  item: FeatureRequest;
  onStatusChange: (id: string, status: FeatureRequestStatus) => Promise<void>;
  onModerationChange: (
    id: string,
    moderationStatus: FeatureRequestModerationStatus
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  deleting: boolean;
  copy: AdminIdeasCopy;
}) {
  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${getStatusClasses(
            item.status
          )}`}
        >
          {formatStatusLabel(item.status, copy)}
        </span>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-600">
          {formatModerationLabel(item.moderationStatus, copy)}
        </span>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">
          {item.voteCount} {copy.votes}
        </span>
      </div>

      <h2 className="mt-4 text-xl font-black text-slate-950">{item.title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        {item.description}
      </p>
      <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
        {copy.suggestedBy} {item.creatorName}
      </p>

      <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          {copy.status}
          <select
            value={item.status}
            onChange={(event) =>
              void onStatusChange(
                item.id,
                event.target.value as FeatureRequestStatus
              )
            }
            className="mt-2 w-full rounded-2xl border-0 bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200"
          >
            <option value="open">{copy.openLabel}</option>
            <option value="planned">{copy.plannedLabel}</option>
            <option value="in_progress">{copy.statusInProgress}</option>
            <option value="done">{copy.doneLabel}</option>
            <option value="rejected">{copy.rejectedLabel}</option>
            <option value="duplicate">{copy.duplicateLabel}</option>
            <option value="hidden">{copy.hiddenLabel}</option>
          </select>
        </label>

        <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
          {copy.moderation}
          <select
            value={item.moderationStatus}
            onChange={(event) =>
              void onModerationChange(
                item.id,
                event.target.value as FeatureRequestModerationStatus
              )
            }
            className="mt-2 w-full rounded-2xl border-0 bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200"
          >
            <option value="pending">{copy.pendingLabel}</option>
            <option value="approved">{copy.approvedLabel}</option>
            <option value="hidden">{copy.hiddenLabel}</option>
          </select>
        </label>

        <button
          type="button"
          onClick={() => void onDelete(item.id)}
          disabled={deleting}
          className="inline-flex items-center justify-center gap-2 self-end rounded-2xl bg-red-50 px-4 py-3 text-sm font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {deleting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Trash2 size={16} />
          )}
          {deleting ? copy.deletingLabel : copy.deleteLabel}
        </button>
      </div>
    </article>
  );
}

export function AdminIdeasPage() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeSection, setActiveSection] = useState<"pending" | "reviewed">(
    "pending"
  );
  const [reviewedStatusFilter, setReviewedStatusFilter] = useState<
    "all" | FeatureRequestStatus
  >("all");
  const [page, setPage] = useState(1);

  const pageSize = 10;
  const isSpanish =
    i18n.resolvedLanguage?.startsWith("es") || i18n.language.startsWith("es");

  const copy = useMemo<AdminIdeasCopy>(
    () =>
      isSpanish
        ? {
            seoDescription: "Revisa y gestiona las ideas de producto de Sandset.",
            eyebrow: "Espacio admin",
            title: "Ideas admin",
            body:
              "Separa rapido las ideas pendientes de aprobacion de las que ya estan revisadas y gestionadas.",
            pendingCard: "Pendientes de aprobar",
            reviewedCard: "Ideas revisadas",
            searchPlaceholder: "Buscar ideas, descripciones o autor",
            pendingTab: "Pendientes",
            reviewedTab: "Revisadas",
            votes: "votos",
            suggestedBy: "Propuesta de",
            status: "Estado",
            moderation: "Moderacion",
            pendingTitle: "Pendientes de aprobar",
            pendingBody: "Ideas nuevas que todavia necesitan una primera revision.",
            reviewedTitle: "Ideas revisadas",
            reviewedBody:
              "Ideas aprobadas, planificadas, rechazadas o ya gestionadas.",
            pendingEmpty: "Ahora mismo no hay nada pendiente.",
            reviewedEmpty: "No hay ideas revisadas para este filtro.",
            showing: "Mostrando",
            of: "de",
            ideas: "ideas",
            previous: "Anterior",
            next: "Siguiente",
            loadError: "No se pudieron cargar las ideas.",
            updateStatusError: "No se pudo actualizar el estado de la idea.",
            updateModerationError:
              "No se pudo actualizar la moderacion de la idea.",
            deleteConfirm:
              "Seguro que quieres borrar esta idea? Tambien se borraran sus votos.",
            deleteError: "No se pudo borrar la idea.",
            deleteLabel: "Borrar",
            deletingLabel: "Borrando...",
            statusInProgress: "En curso",
            isSpanish: true,
            openLabel: "Abierta",
            plannedLabel: "Planificada",
            doneLabel: "Hecha",
            rejectedLabel: "Rechazada",
            duplicateLabel: "Duplicada",
            hiddenLabel: "Oculta",
            pendingLabel: "Pendiente",
            approvedLabel: "Aprobada",
            allReviewedStatusLabel: "Todos los estados revisados",
          }
        : {
            seoDescription: "Review and manage Sandset product ideas.",
            eyebrow: "Admin workspace",
            title: "Admin ideas",
            body:
              "Quickly separate ideas that still need approval from those already reviewed and managed.",
            pendingCard: "Pending approval",
            reviewedCard: "Reviewed ideas",
            searchPlaceholder: "Search ideas, descriptions or creators",
            pendingTab: "Pending",
            reviewedTab: "Reviewed",
            votes: "votes",
            suggestedBy: "Suggested by",
            status: "Status",
            moderation: "Moderation",
            pendingTitle: "Pending approval",
            pendingBody: "New ideas that still need a first review.",
            reviewedTitle: "Reviewed ideas",
            reviewedBody:
              "Approved, planned, rejected or otherwise already managed ideas.",
            pendingEmpty: "Nothing pending right now.",
            reviewedEmpty: "There are no reviewed ideas for this filter.",
            showing: "Showing",
            of: "of",
            ideas: "ideas",
            previous: "Previous",
            next: "Next",
            loadError: "Could not load feature ideas.",
            updateStatusError: "Could not update idea status.",
            updateModerationError: "Could not update idea moderation.",
            deleteConfirm:
              "Are you sure you want to delete this idea? Its votes will be deleted too.",
            deleteError: "Could not delete idea.",
            deleteLabel: "Delete",
            deletingLabel: "Deleting...",
            statusInProgress: "In progress",
            isSpanish: false,
            openLabel: "Open",
            plannedLabel: "Planned",
            doneLabel: "Done",
            rejectedLabel: "Rejected",
            duplicateLabel: "Duplicate",
            hiddenLabel: "Hidden",
            pendingLabel: "Pending",
            approvedLabel: "Approved",
            allReviewedStatusLabel: "All reviewed statuses",
          },
    [isSpanish]
  );

  usePageSeo({
    title: buildSeoTitle(copy.title),
    description: copy.seoDescription,
    canonicalPath: "/admin/ideas",
    noindex: true,
  });

  useEffect(() => {
    void loadItems();
  }, []);

  async function loadItems() {
    try {
      setLoading(true);
      setError("");
      setItems(await getFeatureRequests());
    } catch (loadError) {
      console.error(loadError);
      setError(copy.loadError);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(
    featureRequestId: string,
    status: FeatureRequestStatus
  ) {
    try {
      await updateFeatureRequestStatus(featureRequestId, status);
      await loadItems();
    } catch (updateError) {
      console.error(updateError);
      setError(copy.updateStatusError);
    }
  }

  async function handleModerationChange(
    featureRequestId: string,
    moderationStatus: FeatureRequestModerationStatus
  ) {
    try {
      await updateFeatureRequestModerationStatus(
        featureRequestId,
        moderationStatus
      );
      await loadItems();
    } catch (updateError) {
      console.error(updateError);
      setError(copy.updateModerationError);
    }
  }

  async function handleDelete(featureRequestId: string) {
    const confirmed = window.confirm(copy.deleteConfirm);

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(featureRequestId);
      setError("");
      await deleteFeatureRequest(featureRequestId);
      setItems((currentItems) =>
        currentItems.filter((item) => item.id !== featureRequestId)
      );
    } catch (deleteError) {
      console.error(deleteError);
      setError(copy.deleteError);
    } finally {
      setDeletingId(null);
    }
  }

  const pendingItems = useMemo(
    () =>
      items
        .filter((item) => item.moderationStatus === "pending")
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    [items]
  );

  const reviewedItems = useMemo(
    () =>
      items
        .filter((item) => item.moderationStatus !== "pending")
        .sort((left, right) => {
          if (right.voteCount !== left.voteCount) {
            return right.voteCount - left.voteCount;
          }

          return right.createdAt.localeCompare(left.createdAt);
        }),
    [items]
  );

  const searchedPendingItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery.length === 0) {
      return pendingItems;
    }

    return pendingItems.filter((item) =>
      `${item.title} ${item.description} ${item.creatorName}`
        .toLowerCase()
        .includes(normalizedQuery)
    );
  }, [pendingItems, query]);

  const searchedReviewedItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return reviewedItems.filter((item) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        `${item.title} ${item.description} ${item.creatorName}`
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesStatus =
        reviewedStatusFilter === "all" || item.status === reviewedStatusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [query, reviewedItems, reviewedStatusFilter]);

  const activeItems =
    activeSection === "pending" ? searchedPendingItems : searchedReviewedItems;
  const totalPages = Math.max(1, Math.ceil(activeItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedItems = activeItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <section className="mx-auto max-w-6xl">
      <div className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-amber-700">
              <Lightbulb size={14} />
              {copy.eyebrow}
            </div>
            <h1 className="mt-4 text-3xl font-black text-slate-950">
              {copy.title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 md:text-base">
              {copy.body}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-3xl border border-amber-100 bg-amber-50/80 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
                {copy.pendingCard}
              </p>
              <p className="mt-2 text-3xl font-black text-slate-950">
                {pendingItems.length}
              </p>
            </div>
            <div className="rounded-3xl border border-emerald-100 bg-emerald-50/80 px-5 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                {copy.reviewedCard}
              </p>
              <p className="mt-2 text-3xl font-black text-slate-950">
                {reviewedItems.length}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_220px]">
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder={copy.searchPlaceholder}
            className="w-full rounded-2xl border-0 bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-blue-500"
          />

          <div className="grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setActiveSection("pending");
                setPage(1);
              }}
              className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                activeSection === "pending"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-600"
              }`}
            >
              {copy.pendingTab}
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSection("reviewed");
                setPage(1);
              }}
              className={`rounded-xl px-4 py-3 text-sm font-bold transition ${
                activeSection === "reviewed"
                  ? "bg-white text-slate-950 shadow-sm"
                  : "text-slate-600"
              }`}
            >
              {copy.reviewedTab}
            </button>
          </div>

          <select
            value={reviewedStatusFilter}
            onChange={(event) => {
              setReviewedStatusFilter(
                event.target.value as "all" | FeatureRequestStatus
              );
              setPage(1);
            }}
            disabled={activeSection !== "reviewed"}
            className="w-full rounded-2xl border-0 bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 disabled:opacity-60"
          >
            <option value="all">{copy.allReviewedStatusLabel}</option>
            <option value="open">{copy.openLabel}</option>
            <option value="planned">{copy.plannedLabel}</option>
            <option value="in_progress">{copy.statusInProgress}</option>
            <option value="done">{copy.doneLabel}</option>
            <option value="rejected">{copy.rejectedLabel}</option>
            <option value="duplicate">{copy.duplicateLabel}</option>
            <option value="hidden">{copy.hiddenLabel}</option>
          </select>
        </div>
      </div>

      {error ? (
        <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {loading ? (
        <div className="mt-6 rounded-[2rem] bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2 size={18} className="animate-spin" />
            {t("common.loading")}
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <section>
            <div className="mb-4 flex items-center gap-3">
              <div
                className={`rounded-2xl p-3 ${
                  activeSection === "pending"
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {activeSection === "pending" ? (
                  <Clock3 size={18} />
                ) : (
                  <CheckCircle2 size={18} />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  {activeSection === "pending"
                    ? copy.pendingTitle
                    : copy.reviewedTitle}
                </h2>
                <p className="text-sm text-slate-600">
                  {activeSection === "pending"
                    ? copy.pendingBody
                    : copy.reviewedBody}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {pagedItems.length === 0 ? (
                <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-8 text-sm text-slate-600">
                  {activeSection === "pending"
                    ? copy.pendingEmpty
                    : copy.reviewedEmpty}
                </div>
              ) : (
                pagedItems.map((item) => (
                  <IdeaAdminCard
                    key={item.id}
                    item={item}
                    onStatusChange={handleStatusChange}
                    onModerationChange={handleModerationChange}
                    onDelete={handleDelete}
                    deleting={deletingId === item.id}
                    copy={copy}
                  />
                ))
              )}
            </div>
          </section>

          <div className="flex flex-col gap-3 rounded-[1.5rem] bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              {copy.showing}{" "}
              <span className="font-bold text-slate-900">{pagedItems.length}</span>{" "}
              {copy.of}{" "}
              <span className="font-bold text-slate-900">{activeItems.length}</span>{" "}
              {copy.ideas}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={currentPage === 1}
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
              >
                {copy.previous}
              </button>
              <span className="min-w-20 text-center text-sm font-bold text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={currentPage === totalPages}
                className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-200 disabled:opacity-50"
              >
                {copy.next}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
