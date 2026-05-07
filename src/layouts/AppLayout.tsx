import {
  CalendarDays,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Map,
  Trophy,
  User,
  UserPlus,
} from "lucide-react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext";

const publicNavItems = [
    { label: "Home", path: "/", icon: Home },
    { label: "Events", path: "/events", icon: Trophy },
    { label: "Map", path: "/map", icon: Map },
    { label: "Calendar", path: "/calendar", icon: CalendarDays },
];

const privateNavItems = [{ label: "Profile", path: "/profile", icon: User }];

const adminNavItems = [
    { label: "Stats", path: "/stats", icon: LayoutDashboard },
    // { label: "Manage Users", path: "/admin/users", icon: User },
    // { label: "Manage Events", path: "/admin/events", icon: Trophy },
];

export function AppLayout() {

    const { isAuthenticated, isAdmin, profile, logout } = useAuth();

    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await logout();
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Logout error:", error);
        }
    }

    const navItems = [
        ...publicNavItems,
        ...(isAuthenticated ? privateNavItems : []),
        ...(isAdmin ? adminNavItems : []),
    ];

    return (
        <div className="min-h-screen bg-slate-200 md:flex">
        <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col border-r bg-white p-6 md:flex">
            <Link to="/" className="text-xl font-bold text-slate-900">
            Beach Volley
            </Link>

            {profile && (
            <div className="mb-4 rounded-2xl bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">
                {profile.fullName}
                </p>
                <p className="text-xs capitalize text-slate-500">{profile.role}</p>
            </div>
            )}

            <nav className="mt-5 flex-1 space-y-2">
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

            <div className="border-t pt-4">
            {isAuthenticated ? (
                <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 hover:bg-red-500 hover:text-white"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            ) : (
                <div className="space-y-2">
                <NavLink
                    to="/login"
                    className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                        isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`
                    }
                >
                    <LogIn size={18} />
                    Login
                </NavLink>

                <NavLink
                    to="/register"
                    className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                        isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`
                    }
                >
                    <UserPlus size={18} />
                    Register
                </NavLink>
                </div>
            )}
            </div>
        </aside>

        <main className="min-h-screen flex-1 pb-24 md:ml-64 md:pb-0">
            <div className="p-4 md:p-8">
            <Outlet />
            </div>
        </main>

        <nav className="fixed bottom-0 left-0 right-0 z-9999 border-t bg-white px-2 py-2 md:hidden">
            <div className="grid auto-cols-fr grid-flow-col gap-1 overflow-x-auto">
                {publicNavItems.map((item) => {
                const Icon = item.icon;

                return (
                    <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                        `flex items-center justify-center rounded-xl px-3 py-3 transition ${
                        isActive
                            ? "bg-blue-600 text-white"
                            : "text-slate-600 hover:bg-slate-100"
                        }`
                    }
                    aria-label={item.label}
                    >
                    <Icon size={24} />
                    </NavLink>
                );
                })}

                {!isAuthenticated && (
                <NavLink
                    to="/login"
                    className={({ isActive }) =>
                    `flex flex-col items-center justify-center rounded-xl px-3 py-2 text-xs font-bold transition ${
                        isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`
                    }
                >
                    <User size={22} />
                    Login
                </NavLink>
                )}

                {isAuthenticated && (
                <NavLink
                    to="/profile"
                    className={({ isActive }) =>
                    `flex items-center justify-center rounded-xl px-3 py-3 transition ${
                        isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`
                    }
                    aria-label="Profile"
                >
                    <User size={24} />
                </NavLink>
                )}

                {isAdmin && (
                <NavLink
                    to="/stats"
                    className={({ isActive }) =>
                    `flex items-center justify-center rounded-xl px-3 py-3 transition ${
                        isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`
                    }
                    aria-label="Stats"
                >
                    <LayoutDashboard size={24} />
                </NavLink>
                )}
            </div>
            </nav>
        </div>
    );
}