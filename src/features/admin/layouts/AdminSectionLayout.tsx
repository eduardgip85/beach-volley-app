import { Outlet } from "react-router-dom";
import { useAdminNotifications } from "../hooks/useAdminNotifications";

export function AdminSectionLayout() {
  const notifications = useAdminNotifications();

  return <Outlet context={notifications} />;
}
