import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Mail,
  Search,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { buildSeoTitle } from "../../../shared/seo/seo";
import { usePageSeo } from "../../../shared/seo/usePageSeo";
import {
  getAccountDeletionRequests,
  updateAccountDeletionRequest,
  type AccountDeletionRequest,
  type AccountDeletionRequestStatus,
} from "../services/adminDeletionRequests.service";

const PAGE_SIZE = 10;
const statuses: AccountDeletionRequestStatus[] = [
  "pending",
  "verified",
  "completed",
  "rejected",
];

export function AdminDeletionRequestsPage() {
  const { i18n } = useTranslation();
  const isSpanish =
    i18n.resolvedLanguage?.startsWith("es") || i18n.language.startsWith("es");
  const copy = getCopy(isSpanish);
  const [requests, setRequests] = useState<AccountDeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | AccountDeletionRequestStatus>(
    "pending"
  );
  const [page, setPage] = useState(1);

  usePageSeo({
    title: buildSeoTitle(copy.title),
    description: copy.body,
    canonicalPath: "/admin/deletion-requests",
    noindex: true,
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        setRequests(await getAccountDeletionRequests());
      } catch (loadError) {
        console.error(loadError);
        setError(copy.loadError);
      } finally {
        setLoading(false);
      }
    }

    void load();
  }, [copy.loadError]);

  const counts = useMemo(
    () =>
      Object.fromEntries(
        statuses.map((status) => [
          status,
          requests.filter((request) => request.status === status).length,
        ])
      ) as Record<AccountDeletionRequestStatus, number>,
    [requests]
  );

  const filteredRequests = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return requests.filter((request) => {
      const matchesStatus = statusFilter === "all" || request.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        `${request.email} ${request.details ?? ""} ${request.adminNote ?? ""}`
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesStatus && matchesQuery;
    });
  }, [query, requests, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visibleRequests = filteredRequests.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  async function saveRequest(
    request: AccountDeletionRequest,
    status: AccountDeletionRequestStatus,
    adminNote: string
  ) {
    try {
      setSavingId(request.id);
      setError("");
      await updateAccountDeletionRequest(request.id, status, adminNote);
      const processedAt = status === "pending" ? null : new Date().toISOString();
      setRequests((current) =>
        current.map((item) =>
          item.id === request.id
            ? { ...item, status, adminNote: adminNote.trim() || null, processedAt }
            : item
        )
      );
    } catch (saveError) {
      console.error(saveError);
      setError(copy.saveError);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="mx-auto max-w-7xl space-y-5">
      <div className="overflow-hidden rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl md:p-8">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-rose-200">
            <ShieldCheck size={14} />
            {copy.eyebrow}
          </div>
          <h1 className="mt-4 text-3xl font-black sm:text-4xl">{copy.title}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-300 md:text-base">{copy.body}</p>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {statuses.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`rounded-2xl p-3 text-left ring-1 transition ${
                statusFilter === status
                  ? "bg-white text-slate-950 ring-white"
                  : "bg-white/10 text-white ring-white/10 hover:bg-white/15"
              }`}
            >
              <span className="block text-2xl font-black">{counts[status]}</span>
              <span className="text-[10px] font-black uppercase tracking-[0.14em]">
                {copy.statuses[status]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold leading-6 text-amber-900">
        {copy.safetyNotice}
      </div>

      <div className="grid gap-3 rounded-[1.75rem] bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_220px]">
        <label className="relative block">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder={copy.search}
            className="w-full rounded-2xl border-0 bg-slate-100 py-3 pl-11 pr-4 text-sm outline-none ring-1 ring-slate-200 focus:ring-blue-500"
          />
        </label>
        <select
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as "all" | AccountDeletionRequestStatus);
            setPage(1);
          }}
          className="rounded-2xl border-0 bg-slate-100 px-4 py-3 text-sm font-bold outline-none ring-1 ring-slate-200 focus:ring-blue-500"
        >
          <option value="all">{copy.allStatuses}</option>
          {statuses.map((status) => (
            <option key={status} value={status}>
              {copy.statuses[status]}
            </option>
          ))}
        </select>
      </div>

      {error ? <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
      {loading ? <p className="rounded-2xl bg-white p-6 text-slate-500">{copy.loading}</p> : null}

      {!loading && visibleRequests.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center">
          <Trash2 className="mx-auto text-slate-300" size={34} />
          <p className="mt-3 font-black text-slate-950">{copy.empty}</p>
        </div>
      ) : null}

      <div className="space-y-3">
        {visibleRequests.map((request) => (
          <DeletionRequestCard
            key={request.id}
            request={request}
            copy={copy}
            locale={i18n.language}
            saving={savingId === request.id}
            onSave={saveRequest}
          />
        ))}
      </div>

      {!loading && filteredRequests.length > PAGE_SIZE ? (
        <div className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setPage((value) => value - 1)}
            className="rounded-xl p-2 text-slate-700 disabled:opacity-30"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-bold text-slate-500">
            {copy.page} {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setPage((value) => value + 1)}
            className="rounded-xl p-2 text-slate-700 disabled:opacity-30"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      ) : null}
    </section>
  );
}

function DeletionRequestCard({
  request,
  copy,
  locale,
  saving,
  onSave,
}: {
  request: AccountDeletionRequest;
  copy: ReturnType<typeof getCopy>;
  locale: string;
  saving: boolean;
  onSave: (
    request: AccountDeletionRequest,
    status: AccountDeletionRequestStatus,
    adminNote: string
  ) => Promise<void>;
}) {
  const [status, setStatus] = useState(request.status);
  const [note, setNote] = useState(request.adminNote ?? "");
  const Icon =
    request.status === "completed"
      ? CheckCircle2
      : request.status === "rejected"
        ? XCircle
        : Clock3;

  return (
    <article className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${statusClasses[request.status]}`}>
              <Icon size={13} />
              {copy.statuses[request.status]}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
              {new Date(request.requestedAt).toLocaleString(locale)}
            </span>
          </div>
          <p className="mt-4 flex items-center gap-2 break-all text-lg font-black text-slate-950">
            <Mail size={17} className="shrink-0 text-blue-600" />
            {request.email}
          </p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {request.details || copy.noDetails}
          </p>
        </div>

        <div className="grid shrink-0 gap-3 lg:w-[25rem]">
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as AccountDeletionRequestStatus)}
            className="rounded-2xl border-0 bg-slate-100 px-4 py-3 text-sm font-bold outline-none ring-1 ring-slate-200"
          >
            {statuses.map((option) => (
              <option key={option} value={option}>
                {copy.statuses[option]}
              </option>
            ))}
          </select>
          <textarea
            rows={2}
            maxLength={1000}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder={copy.note}
            className="resize-y rounded-2xl border-0 bg-slate-100 px-4 py-3 text-sm outline-none ring-1 ring-slate-200"
          />
          <button
            type="button"
            disabled={saving}
            onClick={() => void onSave(request, status, note)}
            className="rounded-2xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:opacity-50"
          >
            {saving ? copy.saving : copy.save}
          </button>
        </div>
      </div>
    </article>
  );
}

const statusClasses: Record<AccountDeletionRequestStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  verified: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
};

function getCopy(isSpanish: boolean) {
  return isSpanish
    ? {
        eyebrow: "Privacidad y cuentas",
        title: "Solicitudes de eliminacion",
        body: "Revisa, verifica y registra el resultado de las solicitudes recibidas desde la web publica.",
        search: "Buscar por email, detalle o nota...",
        allStatuses: "Todos los estados",
        statuses: { pending: "Pendiente", verified: "Verificada", completed: "Completada", rejected: "Rechazada" },
        loading: "Cargando solicitudes...",
        empty: "No hay solicitudes para este filtro.",
        loadError: "No se pudieron cargar las solicitudes.",
        saveError: "No se pudo actualizar la solicitud.",
        noDetails: "Sin informacion adicional.",
        note: "Nota interna de moderacion...",
        save: "Guardar revision",
        saving: "Guardando...",
        page: "Pagina",
        safetyNotice:
          "Cambiar el estado solo registra el seguimiento. Verifica primero la identidad y elimina la cuenta mediante el proceso seguro antes de marcarla como completada.",
      }
    : {
        eyebrow: "Privacy and accounts",
        title: "Deletion requests",
        body: "Review, verify and record the outcome of requests received from the public website.",
        search: "Search by email, details or note...",
        allStatuses: "All statuses",
        statuses: { pending: "Pending", verified: "Verified", completed: "Completed", rejected: "Rejected" },
        loading: "Loading requests...",
        empty: "No requests match this filter.",
        loadError: "Deletion requests could not be loaded.",
        saveError: "The request could not be updated.",
        noDetails: "No additional information.",
        note: "Internal moderation note...",
        save: "Save review",
        saving: "Saving...",
        page: "Page",
        safetyNotice:
          "Changing status only records progress. Verify identity and complete deletion through the secure process before marking a request as completed.",
      };
}
