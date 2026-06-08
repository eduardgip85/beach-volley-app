import { useEffect, useState } from "react";
import { supabase } from "../../../config/supabase";
import {
    getUnreadNotificationCount,
    NOTIFICATIONS_UPDATED_EVENT,
} from "../services/notifications.service";

export function useUnreadNotifications(userId?: string) {
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        if (!userId) {
            return;
        }

        const currentUserId = userId;
        let active = true;

        async function refresh() {
            try {
                const count = await getUnreadNotificationCount(currentUserId);
                if (active) setUnreadCount(count);
            } catch (error) {
                console.error("Could not load unread notifications", error);
            }
        }

        void refresh();
        window.addEventListener(NOTIFICATIONS_UPDATED_EVENT, refresh);
        window.addEventListener("focus", refresh);

        const channel = supabase
            .channel(`notifications-nav:${currentUserId}`)
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
            window.removeEventListener("focus", refresh);
            void supabase.removeChannel(channel);
        };
    }, [userId]);

    return userId ? unreadCount : 0;
}
