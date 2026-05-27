import { Suspense, lazy, type ComponentType, type ReactNode } from "react";
import { createBrowserRouter } from "react-router-dom";

import { AuthLayout } from "../layouts/AuthLayout";
import { AppLayout } from "../layouts/AppLayout";
import { AppLoadingScreen } from "../components/AppLoadingScreen";

import { ProtectedRoute } from "../routes/ProtectedRoute";
import { AdminRoute } from "../routes/AdminRoute";

const LAZY_RELOAD_GUARD_KEY = "sandset:lazy-import-reload";

function lazyWithReload<T extends ComponentType<any>>(
  importer: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      const module = await importer();

      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(LAZY_RELOAD_GUARD_KEY);
      }

      return module;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error ?? "");
      const isDynamicImportFetchFailure =
        /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed/i.test(
          message
        );

      if (typeof window !== "undefined" && isDynamicImportFetchFailure) {
        const currentUrl = window.location.href;
        const previousAttempt = window.sessionStorage.getItem(
          LAZY_RELOAD_GUARD_KEY
        );

        if (previousAttempt !== currentUrl) {
          window.sessionStorage.setItem(LAZY_RELOAD_GUARD_KEY, currentUrl);
          window.location.reload();

          return new Promise<never>(() => {});
        }

        window.sessionStorage.removeItem(LAZY_RELOAD_GUARD_KEY);
      }

      throw error;
    }
  });
}

const LoginPage = lazyWithReload(() =>
  import("../features/auth/pages/LoginPage").then((module) => ({
    default: module.LoginPage,
  }))
);
const RegisterPage = lazyWithReload(() =>
  import("../features/auth/pages/RegisterPage").then((module) => ({
    default: module.RegisterPage,
  }))
);
const ForgotPasswordPage = lazyWithReload(() =>
  import("../features/auth/pages/ForgotPasswordPage").then((module) => ({
    default: module.ForgotPasswordPage,
  }))
);
const ResetPasswordPage = lazyWithReload(() =>
  import("../features/auth/pages/ResetPasswordPage").then((module) => ({
    default: module.ResetPasswordPage,
  }))
);
const AuthCallbackPage = lazyWithReload(() =>
  import("../features/auth/pages/AuthCallbackPage").then((module) => ({
    default: module.AuthCallbackPage,
  }))
);
const HomePage = lazyWithReload(() =>
  import("../features/home/pages/HomePage").then((module) => ({
    default: module.HomePage,
  }))
);
const EventsPage = lazyWithReload(() =>
  import("../features/events/pages/EventsPage").then((module) => ({
    default: module.EventsPage,
  }))
);
const EventDetailPage = lazyWithReload(() =>
  import("../features/events/pages/EventDetailPage").then((module) => ({
    default: module.EventDetailPage,
  }))
);
const CreateEventPage = lazyWithReload(() =>
  import("../features/events/pages/CreateEventPage").then((module) => ({
    default: module.CreateEventPage,
  }))
);
const EditEventPage = lazyWithReload(() =>
  import("../features/events/pages/EditEventPage").then((module) => ({
    default: module.EditEventPage,
  }))
);
const MapPage = lazyWithReload(() =>
  import("../features/map/pages/MapPage").then((module) => ({
    default: module.MapPage,
  }))
);
const CalendarPage = lazyWithReload(() =>
  import("../features/calendar/pages/CalendarPage").then((module) => ({
    default: module.CalendarPage,
  }))
);
const StatsPage = lazyWithReload(() =>
  import("../features/stats/pages/StatsPage").then((module) => ({
    default: module.StatsPage,
  }))
);
const ProfilePage = lazyWithReload(() =>
  import("../features/profile/pages/ProfilePage").then((module) => ({
    default: module.ProfilePage,
  }))
);
const ProfileHistoryPage = lazyWithReload(() =>
  import("../features/profile/pages/ProfileHistoryPage").then((module) => ({
    default: module.ProfileHistoryPage,
  }))
);
const CompetitiveRatingOnboardingPage = lazyWithReload(() =>
  import("../features/onboarding/pages/CompetitiveRatingOnboardingPage").then(
    (module) => ({
      default: module.CompetitiveRatingOnboardingPage,
    })
  )
);
const FriendsPage = lazyWithReload(() =>
  import("../features/friends/pages/FriendsPage").then((module) => ({
    default: module.FriendsPage,
  }))
);
const RankingPage = lazyWithReload(() =>
  import("../features/ranking/pages/RankingPage").then((module) => ({
    default: module.RankingPage,
  }))
);
const SettingsPage = lazyWithReload(() =>
  import("../features/settings/pages/SettingsPage").then((module) => ({
    default: module.SettingsPage,
  }))
);
const PublicProfilePage = lazyWithReload(() =>
  import("../features/players/pages/PublicProfilePage").then((module) => ({
    default: module.PublicProfilePage,
  }))
);
const PrivacyPage = lazyWithReload(() =>
  import("../features/legal/pages/PrivacyPage").then((module) => ({
    default: module.PrivacyPage,
  }))
);
const CookiesPage = lazyWithReload(() =>
  import("../features/legal/pages/CookiesPage").then((module) => ({
    default: module.CookiesPage,
  }))
);
const TermsPage = lazyWithReload(() =>
  import("../features/legal/pages/TermsPage").then((module) => ({
    default: module.TermsPage,
  }))
);
const AdminUsersPage = lazyWithReload(() =>
  import("../features/admin/pages/AdminUsersPage").then((module) => ({
    default: module.AdminUsersPage,
  }))
);
const AdminEventsPage = lazyWithReload(() =>
  import("../features/admin/pages/AdminEventsPage").then((module) => ({
    default: module.AdminEventsPage,
  }))
);

function withSuspense(page: ReactNode) {
  return (
    <Suspense
      fallback={<AppLoadingScreen compact />}
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
