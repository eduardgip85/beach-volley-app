import { useEffect, useMemo, useState } from "react";
import { getMyEventInvitations } from "../services/eventInvitations.service";
import type { EventInvitation } from "../types/eventInvitation.types";

export function useMyEventInvitations(userId?: string) {
    const [invitations, setInvitations] = useState<EventInvitation[]>([]);
    const [loading, setLoading] = useState(Boolean(userId));
    const [error, setError] = useState("");

    useEffect(() => {
        async function loadInvitations() {
            if (!userId) {
                setInvitations([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError("");

                const data = await getMyEventInvitations(userId);
                setInvitations(data);
            } catch (err) {
                console.error(err);
                setError("Could not load private invitations");
            } finally {
                setLoading(false);
            }
        }

        loadInvitations();
    }, [userId]);

    const pendingInvitations = useMemo(
        () => invitations.filter((invitation) => invitation.status === "pending"),
        [invitations]
    );

    return {
        invitations,
        pendingInvitations,
        loading,
        error,
    };
}
