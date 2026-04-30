import { useEffect, useState } from "react";
import { getAllUsers } from "../services/adminUsers.service";
import { Link } from "react-router-dom";

export function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
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
        setError("Could not load users");
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);

  if (loading) return <p className="text-slate-500">Loading users...</p>;

  if (error)
    return (
      <div className="rounded-2xl bg-red-50 p-4 text-red-600">{error}</div>
    );

  return (
    <section>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">
          Users Management
        </h1>

        <Link
          to="/profile"
          className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-medium text-white mt-4 inline-block"
        >
          ← Back
        </Link>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-sm text-slate-500">
            <tr>
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Role</th>
              <th className="p-4">Created</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t">
                <td className="p-4 font-semibold">{user.full_name}</td>
                <td className="p-4 text-sm text-slate-500">
                  {user.email}
                </td>
                <td className="p-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      user.role === "admin"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="p-4 text-sm text-slate-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}