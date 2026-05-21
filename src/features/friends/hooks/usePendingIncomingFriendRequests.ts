import { useEffect, useState } from "react";
import { supabase } from "../../../config/supabase";
import {
    FRIEND_REQUESTS_UPDATED_EVENT,
    getIncomingPendingFriendRequestCount,
} from "../services/friends.service";

export function usePendingIncomingFriendRequests(userId?: string) {
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        if (!userId) {
            setPendingCount(0);
            return;
        }

        const currentUserId = userId;
        let isActive = true;

        async function refreshPendingCount() {
            try {
                const count = await getIncomingPendingFriendRequestCount(currentUserId);

                if (isActive) {
                    setPendingCount(count);
                }
            } catch (error) {
                console.error("Could not refresh pending friend requests", error);
            }
        }

        function handleRefresh() {
            void refreshPendingCount();
        }

        void refreshPendingCount();

        window.addEventListener(FRIEND_REQUESTS_UPDATED_EVENT, handleRefresh);
        window.addEventListener("focus", handleRefresh);

        const channel = supabase
            .channel(`friend-requests-nav:${currentUserId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "friend_requests",
                    filter: `receiver_id=eq.${currentUserId}`,
                },
                handleRefresh
            )
            .subscribe();

        return () => {
            isActive = false;
            window.removeEventListener(FRIEND_REQUESTS_UPDATED_EVENT, handleRefresh);
            window.removeEventListener("focus", handleRefresh);
            void supabase.removeChannel(channel);
        };
    }, [userId]);

    return pendingCount;
}
