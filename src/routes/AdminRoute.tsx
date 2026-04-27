import { Navigate, Outlet } from "react-router-dom";

const isAuthenticated = false;
const isAdmin = false;

export function AdminRoute() {
  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/stats" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}