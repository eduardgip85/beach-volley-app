import { createBrowserRouter } from "react-router-dom";

import { AuthLayout } from "../layouts/AuthLayout";
import { AppLayout } from "../layouts/AppLayout";

import { ProtectedRoute } from "../routes/ProtectedRoute";
import { AdminRoute } from "../routes/AdminRoute";

import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { HomePage } from "../features/home/pages/HomePage";

import { EventsPage } from "../features/events/pages/EventsPage";
import { EventDetailPage } from "../features/events/pages/EventDetailPage";
import { CreateEventPage } from "../features/events/pages/CreateEventPage";
import { EditEventPage } from "../features/events/pages/EditEventPage";

import { MapPage } from "../features/map/pages/MapPage";
import { CalendarPage } from "../features/calendar/pages/CalendarPage";
import { StatsPage } from "../features/stats/pages/StatsPage";
import { ProfilePage } from "../features/profile/pages/ProfilePage";

import { AdminUsersPage } from "../features/admin/pages/AdminUsersPage";
import { AdminEventsPage } from "../features/admin/pages/AdminEventsPage";

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
    ],
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/events",
        element: <EventsPage />,
      },
      {
        path: "/events/:eventId",
        element: <EventDetailPage />,
      },
      {
        path: "/map",
        element: <MapPage />,
      },
      {
        path: "/calendar",
        element: <CalendarPage />,
      },

      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/events/create",
            element: <CreateEventPage />,
          },
          {
            path: "/events/:eventId/edit",
            element: <EditEventPage />,
          },
          {
            path: "/profile",
            element: <ProfilePage />,
          },
        ],
      },

      {
        element: <AdminRoute />,
        children: [
          {
            path: "/stats",
            element: <StatsPage />,
          },
          {
            path: "/admin/users",
            element: <AdminUsersPage />,
          },
          {
            path: "/admin/events",
            element: <AdminEventsPage />,
          },
        ],
      },
    ],
  },
]);