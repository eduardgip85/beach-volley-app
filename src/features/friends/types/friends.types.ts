export type FriendRequestStatus =
    | "pending"
    | "accepted"
    | "rejected"
    | "cancelled"
    | "removed";

export interface FriendProfile {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    role: "player" | "admin";
    competitiveRating: number;
}

export interface FriendRequest {
    id: string;
    requesterId: string;
    receiverId: string;
    status: FriendRequestStatus;
    createdAt: string;
    updatedAt: string;
    requester: FriendProfile;
    receiver: FriendProfile;
}
