import { t } from "i18next";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext";

export function AdminRoute() {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading && !isAuthenticated) {
    return <p className="p-6 text-slate-500">{t("common.loading")}</p>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
