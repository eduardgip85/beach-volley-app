import {
  CalendarDays,
  Home,
  LayoutDashboard,
  LogIn,
  LogOut,
  Map,
  Menu,
  Trophy,
  User,
  Users,
  UserPlus,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext";

interface NavItem {
  label: string;
  path: string;
  icon: typeof Home;
  end?: boolean;
}

const publicNavItems: NavItem[] = [
  { label: "Home", path: "/", icon: Home, end: true },
  { label: "Events", path: "/events", icon: Trophy },
  { label: "Map", path: "/map", icon: Map },
  { label: "Calendar", path: "/calendar", icon: CalendarDays },
];

const authenticatedNavItems: NavItem[] = [
  { label: "Friends", path: "/friends", icon: Users },
  { label: "Profile", path: "/profile", icon: User },
];

const adminNavItems: NavItem[] = [
  { label: "Stats", path: "/stats", icon: LayoutDashboard },
];

function getDesktopNavClasses(isActive: boolean) {
  return [
    "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200",
    isActive
      ? "bg-white text-slate-950 shadow-sm ring-1 ring-white/70"
      : "text-slate-300 hover:bg-white/10 hover:text-white",
  ].join(" ");
}

function getMobileNavClasses(isActive: boolean) {
  return [
    "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200",
    isActive
      ? "bg-white text-slate-950 shadow-sm ring-1 ring-white/70"
      : "text-slate-300 hover:bg-white/10 hover:text-white",
  ].join(" ");
}

export function AppLayout() {
  const { isAuthenticated, isAdmin, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  async function handleLogout() {
    try {
      await logout();
      setIsMobileMenuOpen(false);
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const desktopNavItems = [
    ...publicNavItems,
    ...(isAuthenticated ? authenticatedNavItems : []),
    ...(isAdmin ? adminNavItems : []),
  ];

  const mobileNavItems = [
    ...publicNavItems,
    ...(isAuthenticated ? authenticatedNavItems : []),
    ...(isAdmin ? adminNavItems : []),
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-100 md:flex">
      <header className="fixed inset-x-0 top-0 z-[2100] overflow-hidden border-b border-white/10 bg-slate-950 md:hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.3),_transparent_35%),linear-gradient(180deg,_rgba(15,23,42,1)_0%,_rgba(2,6,23,1)_100%)]" />
        <div className="relative flex items-center justify-between px-3 py-3">
          <Link to="/" className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-blue-300">
              Beach Volley App
            </p>
            <h1 className="truncate text-base font-black text-white">
              Play. Meet. Repeat.
            </h1>
          </Link>

          {!isMobileMenuOpen ? (
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={false}
              className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/15"
            >
              <Menu size={22} />
            </button>
          ) : (
            <div className="h-11 w-11" aria-hidden="true" />
          )}
        </div>
      </header>

      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 overflow-hidden bg-slate-950 md:flex md:flex-col">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.3),_transparent_35%),linear-gradient(180deg,_rgba(15,23,42,1)_0%,_rgba(2,6,23,1)_100%)]" />

        <div className="relative flex h-full flex-col p-6">
          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
            <Link to="/" className="block">
              <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-300">
                Beach Volley App
              </p>
              <h1 className="mt-3 text-2xl font-black text-white">
                Play. Meet. Repeat.
              </h1>
              <p className="mt-2 text-sm text-slate-300">
                Discover matches, open play sessions, and your next court.
              </p>
            </Link>
          </div>

          <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/5 p-4 backdrop-blur">
            {profile ? (
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white shadow-lg shadow-blue-950/40">
                  {profile.fullName.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">
                    {profile.fullName}
                  </p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-widest text-slate-400">
                    {profile.role}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold text-white">Welcome to the app</p>
                <p className="mt-1 text-sm text-slate-300">
                  Log in to manage your profile and create events.
                </p>
              </div>
            )}
          </div>

          <nav className="mt-6 flex-1 space-y-2">
            {desktopNavItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) => getDesktopNavClasses(isActive)}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 transition group-hover:bg-white/15">
                    <Icon size={18} />
                  </span>
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-3 backdrop-blur">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-red-500 hover:text-white"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                  <LogOut size={18} />
                </span>
                Logout
              </button>
            ) : (
              <div className="space-y-2">
                <NavLink
                  to="/login"
                  className={({ isActive }) => getDesktopNavClasses(isActive)}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                    <LogIn size={18} />
                  </span>
                  <span>Login</span>
                </NavLink>

                <NavLink
                  to="/register"
                  className={({ isActive }) => getDesktopNavClasses(isActive)}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                    <UserPlus size={18} />
                  </span>
                  <span>Register</span>
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-[2050] bg-slate-950/45 backdrop-blur-[2px] md:hidden"
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-[2200] w-[min(20rem,84vw)] overflow-hidden bg-slate-950 shadow-2xl transition-transform duration-300 md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.3),_transparent_35%),linear-gradient(180deg,_rgba(15,23,42,1)_0%,_rgba(2,6,23,1)_100%)]" />
        <div className="flex h-full flex-col">
          <div className="relative border-b border-white/10 px-4 py-4">
            <div className="mb-4 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-blue-300">
                  Beach Volley App
                </p>
                <h2 className="truncate text-lg font-black text-white">
                  Play. Meet. Repeat.
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-white transition hover:bg-white/15"
              >
                <X size={18} />
              </button>
            </div>

            {profile ? (
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white">
                  {profile.fullName.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white">
                    {profile.fullName}
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    {profile.role}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm font-bold text-white">Welcome</p>
                <p className="mt-1 text-sm text-slate-300">
                  Log in to manage your profile and create events.
                </p>
              </div>
            )}
          </div>

          <nav className="relative flex-1 space-y-2 overflow-y-auto px-4 py-5">
            {mobileNavItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  className={({ isActive }) => getMobileNavClasses(isActive)}
                  aria-label={item.label}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="relative border-t border-white/10 px-4 py-4">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-2xl bg-red-500/15 px-4 py-3 text-sm font-semibold text-red-100 transition hover:bg-red-500/25"
              >
                <LogOut size={18} />
                Logout
              </button>
            ) : (
              <div className="space-y-2">
                <NavLink
                  to="/login"
                  className={({ isActive }) => getMobileNavClasses(isActive)}
                >
                  <LogIn size={18} />
                  <span>Login</span>
                </NavLink>

                <NavLink
                  to="/register"
                  className={({ isActive }) => getMobileNavClasses(isActive)}
                >
                  <UserPlus size={18} />
                  <span>Register</span>
                </NavLink>
              </div>
            )}
          </div>
        </div>
      </aside>

      <main className="min-h-screen flex-1 md:ml-72">
        <div className="px-3 pb-5 pt-20 sm:px-4 md:px-8 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
