import { supabase } from "../../../config/supabase";
import { DEFAULT_COMPETITIVE_RATING } from "../../ratings/utils/rating-display.utils";
import type {
    FriendProfile,
    FriendRequest,
    FriendRequestStatus,
} from "../types/friends.types";

export const FRIEND_REQUESTS_UPDATED_EVENT = "friends:requests-updated";

interface FriendProfileRow {
    id: string;
    full_name: string;
    avatar_url: string | null;
    country: string | null;
    competitive_rating: number | null;
}

interface FriendRequestRow {
    id: string;
    requester_id: string;
    receiver_id: string;
    status: FriendRequestStatus;
    created_at: string;
    updated_at: string;
    requester: FriendProfileRow[] | FriendProfileRow;
    receiver: FriendProfileRow[] | FriendProfileRow;
}

const friendProfileSelect =
    "id, full_name, avatar_url, country, competitive_rating";

const friendRequestSelect = `
    id,
    requester_id,
    receiver_id,
    status,
    created_at,
    updated_at,
    requester:profiles!friend_requests_requester_id_fkey(${friendProfileSelect}),
    receiver:profiles!friend_requests_receiver_id_fkey(${friendProfileSelect})
`;

function mapFriendProfile(row: FriendProfileRow): FriendProfile {
    return {
        id: row.id,
        fullName: row.full_name,
        avatarUrl: row.avatar_url,
        country: row.country ?? null,
        competitiveRating: row.competitive_rating ?? DEFAULT_COMPETITIVE_RATING,
    };
}

function normalizeFriendProfileRelation(
    relation: FriendProfileRow[] | FriendProfileRow
) {
    return Array.isArray(relation) ? relation[0] : relation;
}

function mapFriendRequest(row: FriendRequestRow): FriendRequest {
    return {
        id: row.id,
        requesterId: row.requester_id,
        receiverId: row.receiver_id,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        requester: mapFriendProfile(normalizeFriendProfileRelation(row.requester)),
        receiver: mapFriendProfile(normalizeFriendProfileRelation(row.receiver)),
    };
}

function notifyFriendRequestsUpdated() {
    if (typeof window === "undefined") {
        return;
    }

    window.dispatchEvent(new Event(FRIEND_REQUESTS_UPDATED_EVENT));
}

async function getCurrentAuthenticatedUserId() {
    const {
        data: { session },
        error,
    } = await supabase.auth.getSession();

    if (error) throw error;

    const user = session?.user;

    if (!user) {
        throw new Error("You must be logged in to manage friends");
    }

    return user.id;
}

function handleFriendRequestWriteError(error: any): never {
    if (error?.code === "23505") {
        throw new Error("There is already an active friend request between these users");
    }

    if (error?.code === "23514") {
        throw new Error("You cannot send a friend request to yourself");
    }

    throw error;
}

async function mutateFriendRequest(
    requestId: string,
    status: FriendRequestStatus
): Promise<FriendRequest> {
    const { data, error } = await supabase
        .from("friend_requests")
        .update({
            status,
            updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)
        .select(friendRequestSelect)
        .single();

    if (error) throw error;

    return mapFriendRequest(data);
}

export async function searchUsers(query: string): Promise<FriendProfile[]> {
    const currentUserId = await getCurrentAuthenticatedUserId();
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
        return [];
    }

    const { data, error } = await supabase
        .from("profiles")
        .select(friendProfileSelect)
        .ilike("full_name", `%${normalizedQuery}%`)
        .neq("id", currentUserId)
        .order("full_name", { ascending: true })
        .limit(12);

    if (error) throw error;

    return data.map(mapFriendProfile);
}

export async function getFriendRequests(userId: string): Promise<FriendRequest[]> {
    const { data, error } = await supabase
        .from("friend_requests")
        .select(friendRequestSelect)
        .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
        .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map(mapFriendRequest);
}

export async function getIncomingPendingFriendRequestCount(
    userId: string
): Promise<number> {
    const { count, error } = await supabase
        .from("friend_requests")
        .select("id", { count: "exact", head: true })
        .eq("receiver_id", userId)
        .eq("status", "pending");

    if (error) throw error;

    return count ?? 0;
}

export function getFriendsFromRequests(
    requests: FriendRequest[],
    userId: string
): FriendProfile[] {
    return requests
        .filter((request) => request.status === "accepted")
        .map((request) =>
            request.requesterId === userId ? request.receiver : request.requester
        );
}

export async function getFriends(userId: string): Promise<FriendProfile[]> {
    const requests = await getFriendRequests(userId);

    return getFriendsFromRequests(requests, userId);
}

export async function getFriendRelationship(
    userId: string,
    otherUserId: string
): Promise<FriendRequest | null> {
    const { data, error } = await supabase
        .from("friend_requests")
        .select(friendRequestSelect)
        .or(
            `and(requester_id.eq.${userId},receiver_id.eq.${otherUserId}),and(requester_id.eq.${otherUserId},receiver_id.eq.${userId})`
        )
        .order("created_at", { ascending: false })
        .limit(1);

    if (error) throw error;

    const relationship = data[0];

    return relationship ? mapFriendRequest(relationship) : null;
}

export async function sendFriendRequest(receiverId: string): Promise<FriendRequest> {
    const requesterId = await getCurrentAuthenticatedUserId();

    const { data, error } = await supabase
        .from("friend_requests")
        .insert({
            requester_id: requesterId,
            receiver_id: receiverId,
        })
        .select(friendRequestSelect)
        .single();

    if (error) {
        handleFriendRequestWriteError(error);
    }

    const request = mapFriendRequest(data);
    notifyFriendRequestsUpdated();

    return request;
}

export async function acceptFriendRequest(requestId: string): Promise<FriendRequest> {
    const request = await mutateFriendRequest(requestId, "accepted");
    notifyFriendRequestsUpdated();

    return request;
}

export async function rejectFriendRequest(requestId: string): Promise<FriendRequest> {
    const request = await mutateFriendRequest(requestId, "rejected");
    notifyFriendRequestsUpdated();

    return request;
}

export async function cancelFriendRequest(requestId: string): Promise<FriendRequest> {
    const request = await mutateFriendRequest(requestId, "cancelled");
    notifyFriendRequestsUpdated();

    return request;
}

export async function removeFriend(friendUserId: string): Promise<FriendRequest> {
    const currentUserId = await getCurrentAuthenticatedUserId();
    const { data, error } = await supabase
        .from("friend_requests")
        .update({
            status: "removed",
            updated_at: new Date().toISOString(),
        })
        .eq("status", "accepted")
        .or(
            `and(requester_id.eq.${currentUserId},receiver_id.eq.${friendUserId}),and(requester_id.eq.${friendUserId},receiver_id.eq.${currentUserId})`
        )
        .select(friendRequestSelect)
        .single();

    if (error) throw error;
    const request = mapFriendRequest(data);
    notifyFriendRequestsUpdated();

    return request;
}
