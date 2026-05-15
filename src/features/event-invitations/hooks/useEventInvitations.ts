import { useEffect, useMemo, useState } from "react";
import { getFriends } from "../../friends/services/friends.service";
import type { FriendProfile } from "../../friends/types/friends.types";
import {
    acceptEventInvitation,
    cancelEventInvitation,
    declineEventInvitation,
    getEventInvitations,
    getMyEventInvitationForEvent,
    inviteFriendToEvent,
} from "../services/eventInvitations.service";
import type { EventInvitation } from "../types/eventInvitation.types";

interface UseEventInvitationsOptions {
    currentUserId?: string;
    canManageInvitations?: boolean;
}

export function useEventInvitations(
    eventId?: string,
    options: UseEventInvitationsOptions = {}
) {
    const { currentUserId, canManageInvitations = false } = options;

    const [eventInvitations, setEventInvitations] = useState<EventInvitation[]>([]);
    const [friends, setFriends] = useState<FriendProfile[]>([]);
    const [myEventInvitation, setMyEventInvitation] = useState<EventInvitation | null>(null);
    const [loading, setLoading] = useState(Boolean(eventId));
    const [error, setError] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    async function refresh() {
        if (!eventId) {
            setEventInvitations([]);
            setFriends([]);
            setMyEventInvitation(null);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const tasks: Promise<unknown>[] = [
                canManageInvitations ? getEventInvitations(eventId) : Promise.resolve([]),
            ];

            if (canManageInvitations && currentUserId) {
                tasks.push(getFriends(currentUserId));
            } else {
                tasks.push(Promise.resolve([]));
            }

            if (currentUserId) {
                tasks.push(getMyEventInvitationForEvent(eventId, currentUserId));
            } else {
                tasks.push(Promise.resolve(null));
            }

            const [eventInvitationsData, friendsData, myInvitationsData] =
                await Promise.all(tasks);

            setEventInvitations(eventInvitationsData as EventInvitation[]);
            setFriends(friendsData as FriendProfile[]);
            setMyEventInvitation(myInvitationsData as EventInvitation | null);
        } catch (err) {
            console.error(err);
            setError("Could not load event invitations");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        refresh();
    }, [eventId, currentUserId, canManageInvitations]);

    const invitationByFriendId = useMemo(() => {
        const map = new Map<string, EventInvitation>();

        for (const invitation of eventInvitations) {
            map.set(invitation.inviteeId, invitation);
        }

        return map;
    }, [eventInvitations]);

    const invitableFriends = useMemo(
        () =>
            friends.filter((friend) => {
                const invitation = invitationByFriendId.get(friend.id);

                return !invitation || invitation.status === "declined" || invitation.status === "cancelled";
            }),
        [friends, invitationByFriendId]
    );

    const pendingInvitationForCurrentUser = useMemo(
        () => (myEventInvitation?.status === "pending" ? myEventInvitation : null),
        [myEventInvitation]
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
                    : "Could not update event invitation"
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
            eventInvitations,
            invitableFriends,
            pendingInvitationForCurrentUser,
        },
        actions: {
            refresh,
            inviteFriend: (friendId: string) =>
                runMutation(`invite:${friendId}`, () =>
                    inviteFriendToEvent(eventId!, friendId)
                ),
            acceptInvitation: (invitationId: string) =>
                runMutation(`accept:${invitationId}`, () =>
                    acceptEventInvitation(invitationId)
                ),
            declineInvitation: (invitationId: string) =>
                runMutation(`decline:${invitationId}`, () =>
                    declineEventInvitation(invitationId)
                ),
            cancelInvitation: (invitationId: string) =>
                runMutation(`cancel:${invitationId}`, () =>
                    cancelEventInvitation(invitationId)
                ),
        },
        helpers: {
            getInvitationForFriend: (friendId: string) =>
                invitationByFriendId.get(friendId) ?? null,
        },
    };
}
