import { Lightbulb, Loader2, ThumbsUp } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { buildSeoTitle } from "../../../shared/seo/seo";
import { usePageSeo } from "../../../shared/seo/usePageSeo";
import { useAuth } from "../../auth/context/AuthContext";
import {
  addFeatureRequestVote,
  createFeatureRequest,
  getCurrentUserFeatureRequestVotes,
  getFeatureRequests,
  removeFeatureRequestVote,
  updateFeatureRequestModerationStatus,
  updateFeatureRequestStatus,
} from "../services/featureRequests.service";
import type {
  FeatureRequest,
  FeatureRequestModerationStatus,
  FeatureRequestStatus,
} from "../types/featureRequest.types";

type FeatureFilter =
  | "top"
  | "newest"
  | "open"
  | "planned"
  | "in_progress"
  | "done";

interface FeatureRequestsCopy {
  roadmapEyebrow: string;
  title: string;
  body: string;
  seoDescription: string;
  createTitle: string;
  createBody: string;
  createButton: string;
  closeModal: string;
  titleLabel: string;
  descriptionLabel: string;
  titlePlaceholder: string;
  descriptionPlaceholder: string;
  submit: string;
  submitting: string;
  searchPlaceholder: string;
  empty: string;
  vote: string;
  voted: string;
  refreshError: string;
  createSuccess: string;
  createError: string;
  voteError: string;
  adminStatus: string;
  adminModeration: string;
  createdBy: string;
  top: string;
  newest: string;
  open: string;
  planned: string;
  inProgress: string;
  done: string;
  rejected: string;
  duplicate: string;
  hidden: string;
  pending: string;
  approved: string;
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

function formatStatusLabel(
  status: FeatureRequestStatus,
  copy: FeatureRequestsCopy
) {
  switch (status) {
    case "open":
      return copy.open;
    case "planned":
      return copy.planned;
    case "in_progress":
      return copy.inProgress;
    case "done":
      return copy.done;
    case "rejected":
      return copy.rejected;
    case "duplicate":
      return copy.duplicate;
    case "hidden":
      return copy.hidden;
  }
}

function formatModerationLabel(
  status: FeatureRequestModerationStatus,
  copy: FeatureRequestsCopy
) {
  switch (status) {
    case "pending":
      return copy.pending;
    case "approved":
      return copy.approved;
    case "hidden":
      return copy.hidden;
  }
}

export function FeatureRequestsPage() {
  const { t, i18n } = useTranslation();
  const { isAdmin, profile } = useAuth();
  const isSpanish =
    i18n.resolvedLanguage?.startsWith("es") || i18n.language.startsWith("es");

  const [items, setItems] = useState<FeatureRequest[]>([]);
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState<FeatureFilter>("top");
  const [query, setQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const copy = useMemo<FeatureRequestsCopy>(
    () =>
      isSpanish
        ? {
            roadmapEyebrow: "Roadmap Sandset",
            title: "Ideas y mejoras",
            body:
              "Propone mejoras para Sandset y vota las ideas que mas sentido tengan para la comunidad.",
            seoDescription:
              "Propuestas y votaciones de nuevas funciones para Sandset.",
            createTitle: "Proponer una mejora",
            createBody:
              "Cuanto mas concreta sea la idea, mas facil sera valorarla y priorizarla.",
            createButton: "Nueva sugerencia",
            closeModal: "Cerrar",
            titleLabel: "Titulo",
            descriptionLabel: "Descripcion",
            titlePlaceholder: "Ej. Poder filtrar eventos por nivel",
            descriptionPlaceholder:
              "Explica el problema que tienes y como te ayudaria esta mejora.",
            submit: "Enviar propuesta",
            submitting: "Enviando...",
            searchPlaceholder: "Buscar ideas",
            empty: "Aun no hay propuestas para este filtro.",
            vote: "Votar",
            voted: "Votado",
            refreshError:
              "No se pudo cargar el tablero de ideas. Intentalo de nuevo.",
            createSuccess:
              "Tu propuesta se ha enviado y quedara visible cuando la revisemos.",
            createError:
              "No se pudo enviar la propuesta. Revisa el texto e intentalo otra vez.",
            voteError:
              "No se pudo registrar el voto. Prueba de nuevo en unos segundos.",
            adminStatus: "Estado",
            adminModeration: "Moderacion",
            createdBy: "Propuesta de",
            top: "Top",
            newest: "Nuevas",
            open: "Abiertas",
            planned: "Planificadas",
            inProgress: "En curso",
            done: "Hechas",
            rejected: "Rechazadas",
            duplicate: "Duplicadas",
            hidden: "Ocultas",
            pending: "Pendiente",
            approved: "Aprobada",
          }
        : {
            roadmapEyebrow: "Sandset roadmap",
            title: "Ideas and feature requests",
            body:
              "Suggest improvements for Sandset and vote on the ideas that would help the community the most.",
            seoDescription:
              "Community feature requests and voting board for Sandset.",
            createTitle: "Suggest an improvement",
            createBody:
              "The more concrete the idea is, the easier it is to review and prioritize.",
            createButton: "New suggestion",
            closeModal: "Close",
            titleLabel: "Title",
            descriptionLabel: "Description",
            titlePlaceholder: "Example: Filter events by skill level",
            descriptionPlaceholder:
              "Explain the problem you have and how this improvement would help.",
            submit: "Submit request",
            submitting: "Submitting...",
            searchPlaceholder: "Search ideas",
            empty: "There are no requests for this filter yet.",
            vote: "Vote",
            voted: "Voted",
            refreshError:
              "We could not load the feature board. Please try again.",
            createSuccess:
              "Your request has been submitted and will appear once reviewed.",
            createError:
              "We could not submit your request. Please review the text and try again.",
            voteError:
              "We could not register your vote. Please try again in a few seconds.",
            adminStatus: "Status",
            adminModeration: "Moderation",
            createdBy: "Suggested by",
            top: "Top",
            newest: "Newest",
            open: "Open",
            planned: "Planned",
            inProgress: "In progress",
            done: "Done",
            rejected: "Rejected",
            duplicate: "Duplicate",
            hidden: "Hidden",
            pending: "Pending",
            approved: "Approved",
          },
    [isSpanish]
  );

  usePageSeo({
    title: buildSeoTitle(copy.title),
    description: copy.seoDescription,
    canonicalPath: "/feature-requests",
  });

  useEffect(() => {
    void loadData();
  }, [profile?.id]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [requests, votes] = await Promise.all([
        getFeatureRequests(),
        profile?.id
          ? getCurrentUserFeatureRequestVotes(profile.id)
          : Promise.resolve(new Set<string>()),
      ]);

      setItems(requests);
      setUserVotes(votes);
    } catch (loadError) {
      console.error(loadError);
      setError(copy.refreshError);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!profile?.id) {
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await createFeatureRequest({ title, description }, profile.id);

      setTitle("");
      setDescription("");
      setIsCreateModalOpen(false);
      setSuccess(copy.createSuccess);
      await loadData();
    } catch (submitError) {
      console.error(submitError);
      setError(copy.createError);
    } finally {
      setSaving(false);
    }
  }

  async function handleVoteToggle(item: FeatureRequest) {
    if (!profile?.id) {
      return;
    }

    const hasVoted = userVotes.has(item.id);

    try {
      setError("");

      if (hasVoted) {
        await removeFeatureRequestVote(item.id, profile.id);
      } else {
        await addFeatureRequestVote(item.id, profile.id);
      }

      await loadData();
    } catch (voteError) {
      console.error(voteError);
      setError(copy.voteError);
    }
  }

  async function handleStatusChange(
    featureRequestId: string,
    status: FeatureRequestStatus
  ) {
    try {
      await updateFeatureRequestStatus(featureRequestId, status);
      await loadData();
    } catch (updateError) {
      console.error(updateError);
      setError(copy.refreshError);
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
      await loadData();
    } catch (updateError) {
      console.error(updateError);
      setError(copy.refreshError);
    }
  }

  const visibleItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const searchedItems =
      normalizedQuery.length === 0
        ? items
        : items.filter((item) =>
            `${item.title} ${item.description} ${item.creatorName}`
              .toLowerCase()
              .includes(normalizedQuery)
          );

    if (filter === "top") {
      return searchedItems;
    }

    if (filter === "newest") {
      return [...searchedItems].sort((left, right) =>
        right.createdAt.localeCompare(left.createdAt)
      );
    }

    return searchedItems.filter((item) => item.status === filter);
  }, [filter, items, query]);

  const filterOptions: Array<{ value: FeatureFilter; label: string }> = [
    { value: "top", label: copy.top },
    { value: "newest", label: copy.newest },
    { value: "open", label: copy.open },
    { value: "planned", label: copy.planned },
    { value: "in_progress", label: copy.inProgress },
    { value: "done", label: copy.done },
  ];

  return (
    <section className="mx-auto max-w-5xl">
      {isCreateModalOpen ? (
        <div className="fixed inset-0 z-[2200] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[2rem] bg-white p-6 shadow-[0_30px_80px_rgba(15,23,42,0.22)] md:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-950">
                  {copy.createTitle}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {copy.createBody}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="rounded-full px-3 py-2 text-sm font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                {copy.closeModal}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  {copy.titleLabel}
                </label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={copy.titlePlaceholder}
                  className="mt-2 w-full rounded-2xl border-0 bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-blue-500"
                  minLength={8}
                  maxLength={120}
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                  {copy.descriptionLabel}
                </label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={copy.descriptionPlaceholder}
                  className="mt-2 min-h-40 w-full rounded-2xl border-0 bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-blue-500"
                  minLength={20}
                  maxLength={2000}
                  required
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                >
                  {copy.closeModal}
                </button>
                <button
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {saving ? copy.submitting : copy.submit}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      <div className="rounded-[2rem] bg-white p-6 shadow-sm md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-amber-700">
              <Lightbulb size={14} />
              {copy.roadmapEyebrow}
            </div>
            <h1 className="mt-4 text-3xl font-black text-slate-950">
              {copy.title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 md:text-base">
              {copy.body}
            </p>
          </div>

          <div className="w-full max-w-sm">
            <div className="flex gap-3">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={copy.searchPlaceholder}
                className="min-w-0 flex-1 rounded-2xl border-0 bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                {copy.createButton}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                filter === option.value
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {error ? (
          <p className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {success ? (
          <p className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {success}
          </p>
        ) : null}
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <div className="rounded-[2rem] bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 text-slate-600">
              <Loader2 size={18} className="animate-spin" />
              {t("common.loading")}
            </div>
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="rounded-[2rem] bg-white p-8 shadow-sm">
            <p className="text-sm text-slate-600">{copy.empty}</p>
          </div>
        ) : (
          visibleItems.map((item) => {
            const hasVoted = userVotes.has(item.id);

            return (
              <article
                key={item.id}
                className="rounded-[2rem] bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] ${getStatusClasses(
                          item.status
                        )}`}
                      >
                        {formatStatusLabel(item.status, copy)}
                      </span>

                      {item.moderationStatus !== "approved" ? (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-slate-600">
                          {formatModerationLabel(item.moderationStatus, copy)}
                        </span>
                      ) : null}
                    </div>

                    <h2 className="mt-4 text-xl font-black text-slate-950">
                      {item.title}
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>
                    <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">
                      {copy.createdBy} {item.creatorName}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleVoteToggle(item)}
                    className={`inline-flex min-w-28 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                      hasVoted
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    <ThumbsUp size={16} />
                    {item.voteCount} {hasVoted ? copy.voted : copy.vote}
                  </button>
                </div>

                {isAdmin ? (
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      {copy.adminStatus}
                      <select
                        value={item.status}
                        onChange={(event) =>
                          void handleStatusChange(
                            item.id,
                            event.target.value as FeatureRequestStatus
                          )
                        }
                        className="mt-2 w-full rounded-2xl border-0 bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200"
                      >
                        <option value="open">{copy.open}</option>
                        <option value="planned">{copy.planned}</option>
                        <option value="in_progress">{copy.inProgress}</option>
                        <option value="done">{copy.done}</option>
                        <option value="rejected">{copy.rejected}</option>
                        <option value="duplicate">{copy.duplicate}</option>
                        <option value="hidden">{copy.hidden}</option>
                      </select>
                    </label>

                    <label className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      {copy.adminModeration}
                      <select
                        value={item.moderationStatus}
                        onChange={(event) =>
                          void handleModerationChange(
                            item.id,
                            event.target.value as FeatureRequestModerationStatus
                          )
                        }
                        className="mt-2 w-full rounded-2xl border-0 bg-slate-100 px-4 py-3 text-sm text-slate-900 outline-none ring-1 ring-slate-200"
                      >
                        <option value="pending">{copy.pending}</option>
                        <option value="approved">{copy.approved}</option>
                        <option value="hidden">{copy.hidden}</option>
                      </select>
                    </label>
                  </div>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
