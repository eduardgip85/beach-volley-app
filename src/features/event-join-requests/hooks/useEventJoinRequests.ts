import { useEffect, useMemo, useState } from "react";
import {
    acceptEventJoinRequest,
    getEventJoinRequests,
    getMyEventJoinRequestForEvent,
    rejectEventJoinRequest,
    requestToJoinPrivateEvent,
} from "../services/eventJoinRequests.service";
import type { EventJoinRequest } from "../types/eventJoinRequest.types";

interface UseEventJoinRequestsOptions {
    currentUserId?: string;
    canManageRequests?: boolean;
}

export function useEventJoinRequests(
    eventId?: string,
    options: UseEventJoinRequestsOptions = {}
) {
    const { currentUserId, canManageRequests = false } = options;

    const [requests, setRequests] = useState<EventJoinRequest[]>([]);
    const [myRequest, setMyRequest] = useState<EventJoinRequest | null>(null);
    const [loading, setLoading] = useState(Boolean(eventId));
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [error, setError] = useState("");

    async function refresh() {
        if (!eventId) {
            setRequests([]);
            setMyRequest(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const [requestsData, myRequestData] = await Promise.all([
                canManageRequests ? getEventJoinRequests(eventId) : Promise.resolve([]),
                currentUserId
                    ? getMyEventJoinRequestForEvent(eventId, currentUserId)
                    : Promise.resolve(null),
            ]);

            setRequests(requestsData as EventJoinRequest[]);
            setMyRequest(myRequestData as EventJoinRequest | null);
        } catch (err) {
            console.error(err);
            setError("Could not load private event requests");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        refresh();
    }, [eventId, currentUserId, canManageRequests]);

    const pendingRequests = useMemo(
        () => requests.filter((request) => request.status === "pending"),
        [requests]
    );

    async function runMutation(
        loadingId: string,
        action: () => Promise<unknown>
    ) {
        try {
            setActionLoadingId(loadingId);
            setError("");
            await action();
            await refresh();
        } catch (err) {
            console.error(err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Could not update private event request"
            );
        } finally {
            setActionLoadingId(null);
        }
    }

    return {
        state: {
            loading,
            error,
            actionLoadingId,
            requests,
            pendingRequests,
            myRequest,
        },
        actions: {
            refresh,
            requestAccess: () =>
                runMutation(`request:${eventId}`, () =>
                    requestToJoinPrivateEvent(eventId!)
                ),
            acceptRequest: (requestId: string) =>
                runMutation(`accept:${requestId}`, () =>
                    acceptEventJoinRequest(requestId)
                ),
            rejectRequest: (requestId: string) =>
                runMutation(`reject:${requestId}`, () =>
                    rejectEventJoinRequest(requestId)
                ),
        },
    };
}
