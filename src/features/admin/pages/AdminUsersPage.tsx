import { CalendarDays, Mail, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { getAllUsers } from "../services/adminUsers.service";

interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  role: "player" | "admin";
  created_at: string;
}

export function AdminUsersPage() {
  const { t, i18n } = useTranslation();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true);
        setError("");

        const data = await getAllUsers();
        setUsers(data);
      } catch (err) {
        console.error(err);
        setError(t("adminUsers.loadError"));
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, [t]);

  if (loading) return <p className="text-slate-500">{t("adminUsers.loading")}</p>;

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {t("adminUsers.title")}
          </h1>
          <p className="mt-2 text-slate-500">
            {t("adminUsers.body")}
          </p>
        </div>

        <Link
          to="/admin"
          className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-medium text-white"
        >
          {t("adminUsers.back")}
        </Link>
      </div>

      {error && (
        <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Mobile cards */}
      <div className="mt-6 space-y-4 md:hidden">
        {users.map((user) => (
          <article key={user.id} className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 font-black text-white">
                {user.full_name?.charAt(0).toUpperCase() || "U"}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold text-slate-900">
                      {user.full_name}
                    </h2>

                    <p className="mt-1 flex items-center gap-2 truncate text-sm text-slate-500">
                      <Mail size={15} />
                      {user.email}
                    </p>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold capitalize ${
                      user.role === "admin"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {user.role}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
                      <Shield size={14} />
                      {t("adminUsers.role")}
                    </p>
                    <p className="mt-1 text-sm font-bold capitalize text-slate-800">
                      {user.role}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="flex items-center gap-2 text-xs font-bold uppercase text-slate-400">
                      <CalendarDays size={14} />
                      {t("adminUsers.created")}
                    </p>
                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {new Date(user.created_at).toLocaleDateString(i18n.language)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Desktop table */}
      <div className="mt-6 hidden overflow-hidden rounded-3xl bg-white shadow-sm md:block">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-sm text-slate-500">
            <tr>
              <th className="p-4">{t("adminUsers.name")}</th>
              <th className="p-4">{t("adminUsers.email")}</th>
              <th className="p-4">{t("adminUsers.role")}</th>
              <th className="p-4">{t("adminUsers.created")}</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 font-black text-white">
                      {user.full_name?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <span className="font-semibold text-slate-900">
                      {user.full_name}
                    </span>
                  </div>
                </td>

                <td className="p-4 text-sm text-slate-500">{user.email}</td>

                <td className="p-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                      user.role === "admin"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>

                <td className="p-4 text-sm text-slate-500">
                  {new Date(user.created_at).toLocaleDateString(i18n.language)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="mt-6 rounded-3xl bg-white p-8 text-center shadow-sm">
          <User className="mx-auto text-blue-600" />
          <p className="mt-4 font-semibold text-slate-900">{t("adminUsers.noUsersTitle")}</p>
          <p className="mt-2 text-sm text-slate-500">
            {t("adminUsers.noUsersBody")}
          </p>
        </div>
      )}
    </section>
  );
}
