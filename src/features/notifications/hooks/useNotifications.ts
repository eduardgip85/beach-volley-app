import { useEffect, useState } from "react";
import { supabase } from "../../../config/supabase";
import {
    getNotificationPreferences,
    getNotifications,
    markAllNotificationsRead,
    markNotificationRead,
    NOTIFICATIONS_UPDATED_EVENT,
    saveNotificationPreferences,
} from "../services/notifications.service";
import type {
    AppNotification,
    NotificationPreferences,
} from "../types/notification.types";
import {
    notifyPushDeviceUpdated,
    registerForPushNotifications,
    unregisterFromPushNotifications,
} from "../services/pushDevices.service";

export function useNotifications(userId?: string) {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
    const [loading, setLoading] = useState(true);
    const [savingPreferences, setSavingPreferences] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!userId) return;
        const currentUserId = userId;
        let active = true;

        async function refresh() {
            try {
                const [items, nextPreferences] = await Promise.all([
                    getNotifications(currentUserId),
                    getNotificationPreferences(currentUserId),
                ]);
                if (!active) return;
                setNotifications(items);
                setPreferences(nextPreferences);
                setError("");
            } catch (loadError) {
                console.error(loadError);
                if (active) setError("load");
            } finally {
                if (active) setLoading(false);
            }
        }

        void refresh();
        window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, refresh);

        const channel = supabase
            .channel(`notifications-page:${currentUserId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "notifications",
                    filter: `recipient_id=eq.${currentUserId}`,
                },
                refresh
            )
            .subscribe();

        return () => {
            active = false;
            window.removeEventListener(NOTIFICATIONS_UPDATED_EVENT, refresh);
            void supabase.removeChannel(channel);
        };
    }, [userId]);

    async function markRead(notificationId: string) {
        setNotifications((items) =>
            items.map((item) =>
                item.id === notificationId
                    ? { ...item, readAt: item.readAt ?? new Date().toISOString() }
                    : item
            )
        );
        await markNotificationRead(notificationId);
    }

    async function markAllRead() {
        if (!userId) return;
        setNotifications((items) =>
            items.map((item) => ({
                ...item,
                readAt: item.readAt ?? new Date().toISOString(),
            }))
        );
        await markAllNotificationsRead(userId);
    }

    async function savePreferences(nextPreferences: NotificationPreferences) {
        if (!userId) return;
        setSavingPreferences(true);
        try {
            if (nextPreferences.pushEnabled) {
                const granted = await registerForPushNotifications();
                nextPreferences = { ...nextPreferences, pushEnabled: granted };
            } else {
                await unregisterFromPushNotifications();
            }
            await saveNotificationPreferences(userId, nextPreferences);
            setPreferences(nextPreferences);
            notifyPushDeviceUpdated();
            setError("");
        } catch (saveError) {
            console.error(saveError);
            setError("save");
        } finally {
            setSavingPreferences(false);
        }
    }

    return {
        notifications,
        preferences,
        loading,
        savingPreferences,
        error,
        actions: { markRead, markAllRead, savePreferences },
    };
}
