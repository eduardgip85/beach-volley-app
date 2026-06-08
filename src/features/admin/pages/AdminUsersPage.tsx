import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Mail,
  Search,
  Shield,
  User,
  UserCog,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { buildSeoTitle } from "../../../shared/seo/seo";
import { usePageSeo } from "../../../shared/seo/usePageSeo";
import { getAllUsers } from "../services/adminUsers.service";

interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: "player" | "admin";
  created_at: string;
}

type RoleFilter = "all" | AdminUser["role"];
type SortOption = "newest" | "oldest" | "name";

export function AdminUsersPage() {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [sort, setSort] = useState<SortOption>("newest");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  usePageSeo({
    title: buildSeoTitle(t("adminUsers.title")),
    description: t("adminUsers.body"),
    canonicalPath: "/admin/users",
    noindex: true,
  });

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        setError("");
        setUsers(await getAllUsers());
      } catch (loadError) {
        console.error(loadError);
        setError(t("adminUsers.loadError"));
      } finally {
        setLoading(false);
      }
    }

    void loadUsers();
  }, [t]);

  const adminCount = users.filter((user) => user.role === "admin").length;
  const playerCount = users.length - adminCount;

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return users
      .filter((user) => {
        const matchesQuery =
          normalizedQuery.length === 0 ||
          `${user.full_name} ${user.email}`.toLowerCase().includes(normalizedQuery);
        const matchesRole = roleFilter === "all" || user.role === roleFilter;

        return matchesQuery && matchesRole;
      })
      .sort((left, right) => {
        if (sort === "name") {
          return left.full_name.localeCompare(right.full_name, i18n.language);
        }

        return sort === "oldest"
          ? left.created_at.localeCompare(right.created_at)
          : right.created_at.localeCompare(left.created_at);
      });
  }, [i18n.language, query, roleFilter, sort, users]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const firstVisible = filteredUsers.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastVisible = Math.min(currentPage * pageSize, filteredUsers.length);
  const hasActiveFilters = query.trim().length > 0 || roleFilter !== "all";

  function resetFilters() {
    setQuery("");
    setRoleFilter("all");
    setSort("newest");
    setPage(1);
  }

  if (loading) {
    return (
      <div className="rounded-[2rem] bg-white p-8 text-sm text-slate-500 shadow-sm">
        {t("adminUsers.loading")}
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl space-y-5">
      <div className="rounded-[2rem] bg-slate-950 p-6 text-white shadow-xl md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-xs font-black uppercase tracking-[0.18em] text-blue-200">
              <UserCog size={14} />
              {t("adminUsers.eyebrow")}
            </div>
            <h1 className="mt-4 text-3xl font-black sm:text-4xl">
              {t("adminUsers.title")}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-300 md:text-base">
              {t("adminUsers.body")}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <SummaryCard label={t("adminUsers.totalUsers")} value={users.length} />
            <SummaryCard label={t("adminUsers.players")} value={playerCount} />
            <SummaryCard label={t("adminUsers.admins")} value={adminCount} />
          </div>
        </div>
      </div>

      <div className="rounded-[1.75rem] bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_120px]">
          <label className="relative block">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder={t("adminUsers.searchPlaceholder")}
              className="w-full rounded-2xl border-0 bg-slate-100 py-3 pl-11 pr-11 text-sm text-slate-950 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-blue-500"
            />
            {query ? (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setPage(1);
                }}
                aria-label={t("adminUsers.clearSearch")}
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 hover:bg-white hover:text-slate-800"
              >
                <X size={15} />
              </button>
            ) : null}
          </label>

          <select
            value={roleFilter}
            onChange={(event) => {
              setRoleFilter(event.target.value as RoleFilter);
              setPage(1);
            }}
            aria-label={t("adminUsers.filterRole")}
            className="rounded-2xl border-0 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-blue-500"
          >
            <option value="all">{t("adminUsers.allRoles")}</option>
            <option value="player">{t("roles.player")}</option>
            <option value="admin">{t("roles.admin")}</option>
          </select>

          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value as SortOption);
              setPage(1);
            }}
            aria-label={t("adminUsers.sortBy")}
            className="rounded-2xl border-0 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-blue-500"
          >
            <option value="newest">{t("adminUsers.sortNewest")}</option>
            <option value="oldest">{t("adminUsers.sortOldest")}</option>
            <option value="name">{t("adminUsers.sortName")}</option>
          </select>

          <select
            value={pageSize}
            onChange={(event) => {
              setPageSize(Number(event.target.value));
              setPage(1);
            }}
            aria-label={t("adminUsers.perPage")}
            className="rounded-2xl border-0 bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-blue-500"
          >
            {[10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size} / {t("adminUsers.page")}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-slate-500">
            {t("adminUsers.showing", {
              first: firstVisible,
              last: lastVisible,
              total: filteredUsers.length,
            })}
          </p>
          <div className="flex items-center gap-2">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-xl px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-blue-700 hover:bg-blue-50"
              >
                {t("adminUsers.clearFilters")}
              </button>
            ) : null}
            <Link
              to="/admin"
              className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white"
            >
              {t("adminUsers.back")}
            </Link>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600">{error}</div>
      ) : null}

      {pagedUsers.length > 0 ? (
        <>
          <div className="space-y-3 md:hidden">
            {pagedUsers.map((user) => (
              <UserCard key={user.id} user={user} locale={i18n.language} />
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-[1.75rem] bg-white shadow-sm md:block">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                <tr>
                  <th className="p-4">{t("adminUsers.name")}</th>
                  <th className="p-4">{t("adminUsers.email")}</th>
                  <th className="p-4">{t("adminUsers.role")}</th>
                  <th className="p-4">{t("adminUsers.created")}</th>
                  <th className="p-4 text-right">{t("adminUsers.actions")}</th>
                </tr>
              </thead>
              <tbody>
                {pagedUsers.map((user) => (
                  <tr key={user.id} className="border-t border-slate-100 transition hover:bg-slate-50/80">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Avatar user={user} />
                        <span className="font-bold text-slate-950">{user.full_name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-slate-500">{user.email}</td>
                    <td className="p-4"><RoleBadge role={user.role} /></td>
                    <td className="p-4 text-sm text-slate-500">
                      {new Date(user.created_at).toLocaleDateString(i18n.language)}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        to={`/players/${user.id}`}
                        className="inline-flex rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-950 hover:text-white"
                      >
                        {t("adminUsers.viewProfile")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      ) : (
        <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
          <User className="mx-auto text-blue-600" size={34} />
          <p className="mt-4 font-black text-slate-950">
            {hasActiveFilters ? t("adminUsers.noMatchesTitle") : t("adminUsers.noUsersTitle")}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {hasActiveFilters ? t("adminUsers.noMatchesBody") : t("adminUsers.noUsersBody")}
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              onClick={resetFilters}
              className="mt-5 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
            >
              {t("adminUsers.clearFilters")}
            </button>
          ) : null}
        </div>
      )}
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 rounded-2xl bg-white/10 px-3 py-3 text-center sm:min-w-28 sm:px-4">
      <p className="text-2xl font-black sm:text-3xl">{value}</p>
      <p className="mt-1 truncate text-[10px] font-black uppercase tracking-[0.12em] text-slate-300">
        {label}
      </p>
    </div>
  );
}

function Avatar({ user }: { user: AdminUser }) {
  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 font-black text-white">
      {user.full_name?.charAt(0).toUpperCase() || "U"}
    </div>
  );
}

function RoleBadge({ role }: { role: AdminUser["role"] }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-black capitalize ${
        role === "admin" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
      }`}
    >
      {role}
    </span>
  );
}

function UserCard({ user, locale }: { user: AdminUser; locale: string }) {
  const { t } = useTranslation();

  return (
    <article className="rounded-[1.6rem] bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar user={user} />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h2 className="truncate text-lg font-black text-slate-950">{user.full_name}</h2>
              <p className="mt-1 flex items-center gap-2 truncate text-sm text-slate-500">
                <Mail size={14} />
                {user.email}
              </p>
            </div>
            <RoleBadge role={user.role} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                <Shield size={13} /> {t("adminUsers.role")}
              </p>
              <p className="mt-1 text-sm font-bold capitalize text-slate-800">{user.role}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                <CalendarDays size={13} /> {t("adminUsers.created")}
              </p>
              <p className="mt-1 text-sm font-bold text-slate-800">
                {new Date(user.created_at).toLocaleDateString(locale)}
              </p>
            </div>
          </div>
          <Link
            to={`/players/${user.id}`}
            className="mt-3 flex w-full items-center justify-center rounded-2xl bg-slate-950 px-4 py-3 text-sm font-bold text-white"
          >
            {t("adminUsers.viewProfile")}
          </Link>
        </div>
      </div>
    </article>
  );
}

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between gap-3 rounded-[1.5rem] bg-white p-3 shadow-sm">
      <button
        type="button"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-35"
      >
        <ChevronLeft size={17} />
        <span className="hidden sm:inline">{t("adminUsers.previous")}</span>
      </button>
      <p className="text-sm font-black text-slate-700">
        {t("adminUsers.pageOf", { page: currentPage, total: totalPages })}
      </p>
      <button
        type="button"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:opacity-35"
      >
        <span className="hidden sm:inline">{t("adminUsers.next")}</span>
        <ChevronRight size={17} />
      </button>
    </div>
  );
}
