import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../../../config/supabase";

const adminUsersSeenStorageKey = "sandset:admin-users:last-seen-at";
const adminIdeasSeenStorageKey = "sandset:admin-ideas:last-seen-at";

export interface AdminNotificationsState {
  showAdminUsersNotification: boolean;
  showAdminIdeasNotification: boolean;
}

export function useAdminNotifications(): AdminNotificationsState {
  const location = useLocation();
  const [showAdminUsersNotification, setShowAdminUsersNotification] =
    useState(false);
  const [showAdminIdeasNotification, setShowAdminIdeasNotification] =
    useState(false);

  useEffect(() => {
    if (location.pathname.startsWith("/admin/users")) {
      window.localStorage.setItem(
        adminUsersSeenStorageKey,
        new Date().toISOString()
      );
    }

    if (location.pathname.startsWith("/admin/ideas")) {
      window.localStorage.setItem(
        adminIdeasSeenStorageKey,
        new Date().toISOString()
      );
    }
  }, [location.pathname]);

  useEffect(() => {
    async function loadAdminNotifications() {
      try {
        const [latestUserResult, latestIdeaResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("created_at")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
          supabase
            .from("feature_requests")
            .select("created_at")
            .eq("moderation_status", "pending")
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle(),
        ]);

        const lastSeenUsersAt =
          window.localStorage.getItem(adminUsersSeenStorageKey) ?? "";
        const lastSeenIdeasAt =
          window.localStorage.getItem(adminIdeasSeenStorageKey) ?? "";
        const latestUserCreatedAt = latestUserResult.data?.created_at ?? "";
        const latestIdeaCreatedAt = latestIdeaResult.data?.created_at ?? "";

        setShowAdminUsersNotification(
          Boolean(latestUserCreatedAt && latestUserCreatedAt > lastSeenUsersAt)
        );
        setShowAdminIdeasNotification(
          Boolean(latestIdeaCreatedAt && latestIdeaCreatedAt > lastSeenIdeasAt)
        );
      } catch (adminNotificationError) {
        console.error(
          "Could not load admin section notifications",
          adminNotificationError
        );
      }
    }

    void loadAdminNotifications();
  }, [location.key]);

  return {
    showAdminUsersNotification,
    showAdminIdeasNotification,
  };
}
