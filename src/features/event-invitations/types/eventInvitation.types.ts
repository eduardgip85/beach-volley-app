import type { EventMode, EventStatus, EventType, EventVisibility } from "../../events/types/event.types";
import type { FriendProfile } from "../../friends/types/friends.types";

export type EventInvitationStatus =
    | "pending"
    | "accepted"
    | "declined"
    | "cancelled";

export interface InvitationEventSummary {
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

export interface EventInvitation {
    id: string;
    eventId: string;
    inviterId: string;
    inviteeId: string;
    status: EventInvitationStatus;
    createdAt: string;
    updatedAt: string;
    event: InvitationEventSummary;
    inviter: FriendProfile;
    invitee: FriendProfile;
}
