import { useEffect, useMemo, useState } from "react";
import { getMyEventJoinRequests } from "../services/eventJoinRequests.service";
import type { EventJoinRequest } from "../types/eventJoinRequest.types";

export function useMyEventJoinRequests(userId?: string) {
    const [requests, setRequests] = useState<EventJoinRequest[]>([]);
    const [loading, setLoading] = useState(Boolean(userId));
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadRequests() {
            if (!userId) {
                setRequests([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const data = await getMyEventJoinRequests(userId);
                setRequests(data);
            } catch (err) {
                console.error(err);
                setError("Could not load your private event requests");
            } finally {
                setLoading(false);
            }
        }

        loadRequests();
    }, [userId]);

    const activeRequests = useMemo(
        () =>
            requests.filter(
                (request) =>
                    request.status === "pending" &&
                    request.event.status === "active" &&
                    new Date(request.event.startDate) >= new Date()
            ),
        [requests]
    );

    return {
        requests,
        activeRequests,
        loading,
        error,
    };
}
