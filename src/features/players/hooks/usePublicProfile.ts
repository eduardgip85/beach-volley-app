import { useEffect, useState } from "react";
import { useAuth } from "../../auth/context/AuthContext";
import {
    getFriendRelationship,
    removeFriend,
    sendFriendRequest,
} from "../../friends/services/friends.service";
import { getPublicProfile } from "../services/playerProfile.service";
import type { PublicPlayerProfile } from "../types/publicProfile.types";

type PublicProfileRelationship =
    | "self"
    | "friend"
    | "incoming_pending"
    | "outgoing_pending"
    | "none";

function getRelationshipStatus(
    viewerId: string,
    targetUserId: string,
    relationship: Awaited<ReturnType<typeof getFriendRelationship>>
): PublicProfileRelationship {
    if (viewerId === targetUserId) {
        return "self";
    }

    if (!relationship) {
        return "none";
    }

    if (relationship.status === "accepted") {
        return "friend";
    }

    if (relationship.status === "pending") {
        if (relationship.requesterId === viewerId) {
            return "outgoing_pending";
        }

        if (relationship.receiverId === viewerId) {
            return "incoming_pending";
        }
    }

    return "none";
}

export function usePublicProfile(userId?: string) {
    const { profile } = useAuth();
    const [publicProfile, setPublicProfile] = useState<PublicPlayerProfile | null>(
        null
    );
    const [loading, setLoading] = useState(Boolean(userId));
    const [error, setError] = useState("");
    const [friendActionLoading, setFriendActionLoading] = useState(false);
    const [relationshipStatus, setRelationshipStatus] =
        useState<PublicProfileRelationship>("none");

    useEffect(() => {
        let isCancelled = false;

        async function loadProfile() {
            if (!userId) {
                setPublicProfile(null);
                setLoading(false);
                setError("");
                setRelationshipStatus("none");
                return;
            }

            try {
                setLoading(true);
                setError("");

                const [loadedProfile, relationship] = await Promise.all([
                    getPublicProfile(userId),
                    profile?.id
                        ? getFriendRelationship(profile.id, userId)
                        : Promise.resolve(null),
                ]);

                if (isCancelled) {
                    return;
                }

                if (
                    loadedProfile.profileVisibility === "private" &&
                    profile?.id !== userId
                ) {
                    setPublicProfile(null);
                    setError("This player profile is private");
                    setRelationshipStatus("none");
                    return;
                }

                setPublicProfile(loadedProfile);
                setRelationshipStatus(
                    profile?.id
                        ? getRelationshipStatus(profile.id, userId, relationship)
                        : "none"
                );
            } catch (err) {
                console.error(err);

                if (!isCancelled) {
                    setPublicProfile(null);
                    setError("Could not load this player profile");
                }
            } finally {
                if (!isCancelled) {
                    setLoading(false);
                }
            }
        }

        loadProfile();

        return () => {
            isCancelled = true;
        };
    }, [userId, profile?.id]);

    async function handleSendFriendRequest() {
        if (!userId || !profile?.id || relationshipStatus !== "none") {
            return;
        }

        try {
            setFriendActionLoading(true);
            setError("");
            await sendFriendRequest(userId);
            setRelationshipStatus("outgoing_pending");
        } catch (err) {
            console.error(err);
            setError(
                err instanceof Error
                    ? err.message
                    : "Could not send friend request"
            );
        } finally {
            setFriendActionLoading(false);
        }
    }

    async function handleRemoveFriend() {
        if (!userId || !profile?.id || relationshipStatus !== "friend") {
            return;
        }

        try {
            setFriendActionLoading(true);
            setError("");
            await removeFriend(userId);
            setRelationshipStatus("none");
        } catch (err) {
            console.error(err);
            setError(
                err instanceof Error ? err.message : "Could not remove friend"
            );
        } finally {
            setFriendActionLoading(false);
        }
    }

    return {
        publicProfile,
        loading,
        error,
        friendActionLoading,
        relationshipStatus,
        canSendFriendRequest:
            Boolean(profile?.id) && relationshipStatus === "none",
        actions: {
            sendFriendRequest: handleSendFriendRequest,
            removeFriend: handleRemoveFriend,
        },
    };
}
