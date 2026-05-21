import { Suspense, lazy, type ReactNode } from "react";
import { t } from "i18next";
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
const ForgotPasswordPage = lazy(() =>
  import("../features/auth/pages/ForgotPasswordPage").then((module) => ({
    default: module.ForgotPasswordPage,
  }))
);
const ResetPasswordPage = lazy(() =>
  import("../features/auth/pages/ResetPasswordPage").then((module) => ({
    default: module.ResetPasswordPage,
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
const ProfileHistoryPage = lazy(() =>
  import("../features/profile/pages/ProfileHistoryPage").then((module) => ({
    default: module.ProfileHistoryPage,
  }))
);
const CompetitiveRatingOnboardingPage = lazy(() =>
  import("../features/onboarding/pages/CompetitiveRatingOnboardingPage").then(
    (module) => ({
      default: module.CompetitiveRatingOnboardingPage,
    })
  )
);
const FriendsPage = lazy(() =>
  import("../features/friends/pages/FriendsPage").then((module) => ({
    default: module.FriendsPage,
  }))
);
const RankingPage = lazy(() =>
  import("../features/ranking/pages/RankingPage").then((module) => ({
    default: module.RankingPage,
  }))
);
const SettingsPage = lazy(() =>
  import("../features/settings/pages/SettingsPage").then((module) => ({
    default: module.SettingsPage,
  }))
);
const PublicProfilePage = lazy(() =>
  import("../features/players/pages/PublicProfilePage").then((module) => ({
    default: module.PublicProfilePage,
  }))
);
const PrivacyPage = lazy(() =>
  import("../features/legal/pages/PrivacyPage").then((module) => ({
    default: module.PrivacyPage,
  }))
);
const CookiesPage = lazy(() =>
  import("../features/legal/pages/CookiesPage").then((module) => ({
    default: module.CookiesPage,
  }))
);
const TermsPage = lazy(() =>
  import("../features/legal/pages/TermsPage").then((module) => ({
    default: module.TermsPage,
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
        <div className="px-4 py-10 text-sm text-slate-500">{t("common.loadingPage")}</div>
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
        path: "/forgot-password",
        element: withSuspense(<ForgotPasswordPage />),
      },
      {
        path: "/reset-password",
        element: withSuspense(<ResetPasswordPage />),
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
        path: "/ranking",
        element: withSuspense(<RankingPage />),
      },
      {
        path: "/privacy",
        element: withSuspense(<PrivacyPage />),
      },
      {
        path: "/cookies",
        element: withSuspense(<CookiesPage />),
      },
      {
        path: "/terms",
        element: withSuspense(<TermsPage />),
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
            path: "/profile/history",
            element: withSuspense(<ProfileHistoryPage />),
          },
          {
            path: "/onboarding/competitive-rating",
            element: withSuspense(<CompetitiveRatingOnboardingPage />),
          },
          {
            path: "/friends",
            element: withSuspense(<FriendsPage />),
          },
          {
            path: "/settings",
            element: withSuspense(<SettingsPage />),
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
