import {
  CalendarDays,
  Home,
  LayoutDashboard,
  LogIn,
  Map,
  Trophy,
  User,
} from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";

const isAuthenticated = false;
const isAdmin = false;

const publicNavItems = [
  { label: "Home", path: "/", icon: Home },
  { label: "Events", path: "/events", icon: Trophy },
  { label: "Map", path: "/map", icon: Map },
  { label: "Calendar", path: "/calendar", icon: CalendarDays },
];

const adminNavItems = [
  { label: "Stats", path: "/stats", icon: LayoutDashboard },
];

export function AppLayout() {
  const navItems = isAdmin
    ? [...publicNavItems, ...adminNavItems]
    : publicNavItems;

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 border-r bg-white p-6 md:block">
        <Link to="/" className="mb-8 block text-xl font-bold text-slate-900">
          Beach Volley
        </Link>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-600 hover:bg-slate-100"
                  }`
                }
              >
                <Icon size={18} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-10 border-b bg-white px-4 py-4 md:px-8">
          <div className="flex items-center justify-between">
            <Link to="/" className="font-semibold text-slate-900 md:hidden">
              Beach Volley
            </Link>

            <div className="hidden font-semibold text-slate-900 md:block">
              Beach Volley Dashboard
            </div>

            {isAuthenticated ? (
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm text-white"
              >
                <User size={16} />
                Profile
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm text-white"
              >
                <LogIn size={16} />
                Login
              </Link>
            )}
          </div>
        </header>

        <main className="p-4 md:p-8">
          <Outlet />
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-20 border-t bg-white px-2 py-2 md:hidden">
          <div className="grid grid-cols-4 gap-1">
            {publicNavItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex flex-col items-center rounded-xl px-2 py-2 text-xs ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`
                  }
                >
                  <Icon size={18} />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}