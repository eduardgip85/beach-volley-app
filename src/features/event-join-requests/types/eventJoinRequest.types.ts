import type {
    EventMode,
    EventStatus,
    EventType,
    EventVisibility,
} from "../../events/types/event.types";

export type EventJoinRequestStatus =
    | "pending"
    | "accepted"
    | "rejected"
    | "cancelled";

export interface EventJoinRequestProfile {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
}

export interface EventJoinRequestEventSummary {
    id: string;
    title: string;
    type: EventType;
    mode: EventMode | null;
    visibility: EventVisibility;
    locationName: string;
    startDate: string;
    maxParticipants: number;
    status: EventStatus;
    createdBy: string;
}

export interface EventJoinRequest {
    id: string;
    eventId: string;
    requesterId: string;
    status: EventJoinRequestStatus;
    createdAt: string;
    updatedAt: string;
    event: EventJoinRequestEventSummary;
    requester: EventJoinRequestProfile;
}
