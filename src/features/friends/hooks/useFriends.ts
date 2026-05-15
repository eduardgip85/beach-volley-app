import { useEffect, useMemo, useState } from "react";
import {
    acceptFriendRequest,
    cancelFriendRequest,
    getFriendRequests,
    getFriendsFromRequests,
    rejectFriendRequest,
    searchUsers,
    sendFriendRequest,
} from "../services/friends.service";
import type { FriendProfile, FriendRequest } from "../types/friends.types";

export function useFriends(userId?: string) {
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [friends, setFriends] = useState<FriendProfile[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<FriendProfile[]>([]);
    const [loading, setLoading] = useState(Boolean(userId));
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState("");
    const [searchError, setSearchError] = useState("");
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

    async function refreshData() {
        if (!userId) {
            setFriendRequests([]);
            setFriends([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError("");

            const requestsData = await getFriendRequests(userId);
            const friendsData = getFriendsFromRequests(requestsData, userId);

            setFriendRequests(requestsData);
            setFriends(friendsData);
        } catch (err) {
            console.error(err);
            setError("Could not load your friends");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        refreshData();
    }, [userId]);

    const incomingRequests = useMemo(
        () =>
            friendRequests.filter(
                (request) =>
                    request.status === "pending" && request.receiverId === userId
            ),
        [friendRequests, userId]
    );

    const outgoingRequests = useMemo(
        () =>
            friendRequests.filter(
                (request) =>
                    request.status === "pending" && request.requesterId === userId
            ),
        [friendRequests, userId]
    );

    const relationshipByUserId = useMemo(() => {
        const relationships = new Map<string, "friend" | "incoming_pending" | "outgoing_pending">();

        for (const friend of friends) {
            relationships.set(friend.id, "friend");
        }

        for (const request of incomingRequests) {
            relationships.set(request.requesterId, "incoming_pending");
        }

        for (const request of outgoingRequests) {
            relationships.set(request.receiverId, "outgoing_pending");
        }

        return relationships;
    }, [friends, incomingRequests, outgoingRequests]);

    async function runSearch() {
        const normalizedQuery = searchQuery.trim();

        if (!normalizedQuery) {
            setSearchResults([]);
            setSearchError("");
            return;
        }

        try {
            setSearchLoading(true);
            setSearchError("");

            const results = await searchUsers(normalizedQuery);
            setSearchResults(results);
        } catch (err) {
            console.error(err);
            setSearchError("Could not search users");
        } finally {
            setSearchLoading(false);
        }
    }

    async function handleMutation(
        loadingId: string,
        action: () => Promise<unknown>
    ) {
        try {
            setActionLoadingId(loadingId);
            setError("");
            await action();
            await refreshData();

            if (searchQuery.trim()) {
                await runSearch();
            }
        } catch (err) {
            console.error(err);
            setError(
                err instanceof Error ? err.message : "Could not update friend request"
            );
        } finally {
            setActionLoadingId(null);
        }
    }

    return {
        state: {
            loading,
            searchLoading,
            error,
            searchError,
            actionLoadingId,
            searchQuery,
            searchResults,
            friendRequests,
            incomingRequests,
            outgoingRequests,
            friends,
        },
        actions: {
            setSearchQuery,
            search: runSearch,
            refresh: refreshData,
            sendRequest: (receiverId: string) =>
                handleMutation(`send:${receiverId}`, () =>
                    sendFriendRequest(receiverId)
                ),
            acceptRequest: (requestId: string) =>
                handleMutation(`accept:${requestId}`, () =>
                    acceptFriendRequest(requestId)
                ),
            rejectRequest: (requestId: string) =>
                handleMutation(`reject:${requestId}`, () =>
                    rejectFriendRequest(requestId)
                ),
            cancelRequest: (requestId: string) =>
                handleMutation(`cancel:${requestId}`, () =>
                    cancelFriendRequest(requestId)
                ),
        },
        helpers: {
            getRelationshipStatus: (profileId: string) =>
                relationshipByUserId.get(profileId) ?? "none",
        },
    };
}
