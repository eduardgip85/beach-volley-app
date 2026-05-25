import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

export function AuthLayout() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [location.pathname, location.search]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Outlet />
    </main>
  );
}
