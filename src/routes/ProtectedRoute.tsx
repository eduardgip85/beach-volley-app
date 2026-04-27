import { Navigate, Outlet, useLocation } from "react-router-dom";

const isAuthenticated = false;

export function ProtectedRoute() {
  const location = useLocation();

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  return <Outlet />;
}