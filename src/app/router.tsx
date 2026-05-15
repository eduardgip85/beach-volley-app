import { Suspense, lazy, type ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";

import { AuthLayout } from "../layouts/AuthLayout";
import { AppLayout } from "../layouts/AppLayout";

import { ProtectedRoute } from "../routes/ProtectedRoute";
import { AdminRoute } from "../routes/AdminRoute";

const LoginPage = lazy(() =>
  import("../features/auth/pages/LoginPage").then((module) => ({
    default: module.LoginPage,
  }))
);
const RegisterPage = lazy(() =>
  import("../features/auth/pages/RegisterPage").then((module) => ({
    default: module.RegisterPage,
  }))
);
const AuthCallbackPage = lazy(() =>
  import("../features/auth/pages/AuthCallbackPage").then((module) => ({
    default: module.AuthCallbackPage,
  }))
);
const HomePage = lazy(() =>
  import("../features/home/pages/HomePage").then((module) => ({
    default: module.HomePage,
  }))
);
const EventsPage = lazy(() =>
  import("../features/events/pages/EventsPage").then((module) => ({
    default: module.EventsPage,
  }))
);
const EventDetailPage = lazy(() =>
  import("../features/events/pages/EventDetailPage").then((module) => ({
    default: module.EventDetailPage,
  }))
);
const CreateEventPage = lazy(() =>
  import("../features/events/pages/CreateEventPage").then((module) => ({
    default: module.CreateEventPage,
  }))
);
const EditEventPage = lazy(() =>
  import("../features/events/pages/EditEventPage").then((module) => ({
    default: module.EditEventPage,
  }))
);
const MapPage = lazy(() =>
  import("../features/map/pages/MapPage").then((module) => ({
    default: module.MapPage,
  }))
);
const CalendarPage = lazy(() =>
  import("../features/calendar/pages/CalendarPage").then((module) => ({
    default: module.CalendarPage,
  }))
);
const StatsPage = lazy(() =>
  import("../features/stats/pages/StatsPage").then((module) => ({
    default: module.StatsPage,
  }))
);
const ProfilePage = lazy(() =>
  import("../features/profile/pages/ProfilePage").then((module) => ({
    default: module.ProfilePage,
  }))
);
const FriendsPage = lazy(() =>
  import("../features/friends/pages/FriendsPage").then((module) => ({
    default: module.FriendsPage,
  }))
);
const PublicProfilePage = lazy(() =>
  import("../features/players/pages/PublicProfilePage").then((module) => ({
    default: module.PublicProfilePage,
  }))
);
const AdminUsersPage = lazy(() =>
  import("../features/admin/pages/AdminUsersPage").then((module) => ({
    default: module.AdminUsersPage,
  }))
);
const AdminEventsPage = lazy(() =>
  import("../features/admin/pages/AdminEventsPage").then((module) => ({
    default: module.AdminEventsPage,
  }))
);

function withSuspense(page: ReactNode) {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-10 text-sm text-slate-500">Loading page...</div>
      }
    >
      {page}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: withSuspense(<LoginPage />),
      },
      {
        path: "/register",
        element: withSuspense(<RegisterPage />),
      },
      {
        path: "/auth/callback",
        element: withSuspense(<AuthCallbackPage />),
      },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: withSuspense(<HomePage />),
      },
      {
        path: "/events",
        element: withSuspense(<EventsPage />),
      },
      {
        path: "/events/:eventId",
        element: withSuspense(<EventDetailPage />),
      },
      {
        path: "/map",
        element: withSuspense(<MapPage />),
      },
      {
        path: "/calendar",
        element: withSuspense(<CalendarPage />),
      },
      {
        path: "/players/:userId",
        element: withSuspense(<PublicProfilePage />),
      },

      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/events/create",
            element: withSuspense(<CreateEventPage />),
          },
          {
            path: "/events/:eventId/edit",
            element: withSuspense(<EditEventPage />),
          },
          {
            path: "/profile",
            element: withSuspense(<ProfilePage />),
          },
          {
            path: "/friends",
            element: withSuspense(<FriendsPage />),
          },
        ],
      },

      {
        element: <AdminRoute />,
        children: [
          {
            path: "/stats",
            element: withSuspense(<StatsPage />),
          },
          {
            path: "/admin/users",
            element: withSuspense(<AdminUsersPage />),
          },
          {
            path: "/admin/events",
            element: withSuspense(<AdminEventsPage />),
          },
        ],
      },
    ],
  },
]);
