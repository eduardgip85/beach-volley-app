import { getCurrentProfile } from "../../auth/services/auth.service";
import { getFriends } from "../../friends/services/friends.service";
import type { FriendProfile } from "../../friends/types/friends.types";
import { joinMatch } from "../../match-players/services/matchPlayers.service";
import {
    getEventRegistrationsCount,
    isUserRegistered,
    registerToEvent,
} from "../../registrations/services/registrations.service";
import { supabase } from "../../../config/supabase";
import { DEFAULT_COMPETITIVE_RATING } from "../../ratings/utils/rating-display.utils";
import type { EventMode, EventStatus, EventType, EventVisibility } from "../../events/types/event.types";
import type {
    EventInvitation,
    EventInvitationStatus,
    InvitationEventSummary,
} from "../types/eventInvitation.types";

interface InvitationEventSummaryRow {
    id: string;
    title: string;
    type: EventType;
    mode: EventMode | null;
    visibility: EventVisibility;
    location_name: string;
    start_date: string;
    max_participants: number;
    status: EventStatus;
    created_by: string;
}

interface FriendProfileRow {
    id: string;
    full_name: string;
    avatar_url: string | null;
    country: string | null;
    competitive_rating: number | null;
}

interface EventInvitationRow {
    id: string;
    event_id: string;
    inviter_id: string;
    invitee_id: string;
    status: EventInvitationStatus;
    created_at: string;
    updated_at: string;
    event: InvitationEventSummaryRow[] | InvitationEventSummaryRow;
    inviter: FriendProfileRow[] | FriendProfileRow;
    invitee: FriendProfileRow[] | FriendProfileRow;
}

const friendProfileSelect =
    "id, full_name, avatar_url, country, competitive_rating";

const invitationEventSelect =
    "id, title, type, mode, visibility, location_name, start_date, max_participants, status, created_by";

const eventInvitationSelect = `
    id,
    event_id,
    inviter_id,
    invitee_id,
    status,
    created_at,
    updated_at,
    event:events!event_invitations_event_id_fkey(${invitationEventSelect}),
    inviter:profiles!event_invitations_inviter_id_fkey(${friendProfileSelect}),
    invitee:profiles!event_invitations_invitee_id_fkey(${friendProfileSelect})
`;

function normalizeRelation<T>(relation: T[] | T): T {
    return Array.isArray(relation) ? relation[0] : relation;
}

function mapFriendProfile(row: FriendProfileRow): FriendProfile {
    return {
        id: row.id,
        fullName: row.full_name,
        avatarUrl: row.avatar_url,
        country: row.country ?? null,
        competitiveRating: row.competitive_rating ?? DEFAULT_COMPETITIVE_RATING,
    };
}

function mapInvitationEvent(row: InvitationEventSummaryRow): InvitationEventSummary {
    return {
        id: row.id,
        title: row.title,
        type: row.type,
        mode: row.mode,
        visibility: row.visibility,
        locationName: row.location_name,
        startDate: row.start_date,
        maxParticipants: Number(row.max_participants),
        status: row.status,
        createdBy: row.created_by,
    };
}

function mapEventInvitation(row: EventInvitationRow): EventInvitation {
    return {
        id: row.id,
        eventId: row.event_id,
        inviterId: row.inviter_id,
        inviteeId: row.invitee_id,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        event: mapInvitationEvent(normalizeRelation(row.event)),
        inviter: mapFriendProfile(normalizeRelation(row.inviter)),
        invitee: mapFriendProfile(normalizeRelation(row.invitee)),
    };
}

function isEventClosed(event: InvitationEventSummary) {
    return (
        event.status === "completed" ||
        event.status === "cancelled" ||
        new Date(event.startDate) < new Date()
    );
}

async function getCurrentUserContext() {
    const profile = await getCurrentProfile();

    if (!profile) {
        throw new Error("You must be logged in to manage event invitations");
    }

    return profile;
}

async function getEventSummary(eventId: string): Promise<InvitationEventSummary> {
    const { data, error } = await supabase
        .from("events")
        .select(invitationEventSelect)
        .eq("id", eventId)
        .single();

    if (error) throw error;

    return mapInvitationEvent(data);
}

async function getEventInvitationById(
    invitationId: string
): Promise<EventInvitation> {
    const { data, error } = await supabase
        .from("event_invitations")
        .select(eventInvitationSelect)
        .eq("id", invitationId)
        .single();

    if (error) throw error;

    return mapEventInvitation(data);
}

function handleInvitationWriteError(error: any): never {
    if (error?.code === "23505") {
        throw new Error("There is already a pending invitation for this user");
    }

    throw error;
}

async function mutateInvitationStatus(
    invitationId: string,
    status: EventInvitationStatus
): Promise<EventInvitation> {
    const { data, error } = await supabase
        .from("event_invitations")
        .update({
            status,
            updated_at: new Date().toISOString(),
        })
        .eq("id", invitationId)
        .select(eventInvitationSelect)
        .single();

    if (error) throw error;

    return mapEventInvitation(data);
}

export async function getEventInvitations(
    eventId: string
): Promise<EventInvitation[]> {
    const { data, error } = await supabase
        .from("event_invitations")
        .select(eventInvitationSelect)
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map(mapEventInvitation);
}

export async function getMyEventInvitations(
    userId: string
): Promise<EventInvitation[]> {
    const { data, error } = await supabase
        .from("event_invitations")
        .select(eventInvitationSelect)
        .eq("invitee_id", userId)
        .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map(mapEventInvitation);
}

export async function getMyEventInvitationForEvent(
    eventId: string,
    userId: string
): Promise<EventInvitation | null> {
    const { data, error } = await supabase
        .from("event_invitations")
        .select(eventInvitationSelect)
        .eq("event_id", eventId)
        .eq("invitee_id", userId)
        .order("created_at", { ascending: false })
        .limit(1);

    if (error) throw error;

    const invitation = data[0];

    return invitation ? mapEventInvitation(invitation) : null;
}

export async function inviteFriendToEvent(
    eventId: string,
    friendId: string
): Promise<EventInvitation> {
    const currentUser = await getCurrentUserContext();
    const event = await getEventSummary(eventId);

    if (event.visibility !== "private") {
        throw new Error("Only private events can send invitations");
    }

    if (currentUser.id !== event.createdBy && currentUser.role !== "admin") {
        throw new Error("Only the event creator or an admin can invite friends");
    }

    if (isEventClosed(event)) {
        throw new Error("This event is already finished");
    }

    const friends = await getFriends(currentUser.id);
    const isFriend = friends.some((friend) => friend.id === friendId);

    if (!isFriend) {
        throw new Error("Only friends can be invited to private events");
    }

    const alreadyRegistered = await isUserRegistered(eventId, friendId);

    if (alreadyRegistered) {
        throw new Error("This friend is already registered for the event");
    }

    const existingInvitations = await getEventInvitations(eventId);
    const hasActiveInvitation = existingInvitations.some(
        (invitation) =>
            invitation.inviteeId === friendId &&
            (invitation.status === "pending" || invitation.status === "accepted")
    );

    if (hasActiveInvitation) {
        throw new Error("This friend already has an active invitation");
    }

    const { data, error } = await supabase
        .from("event_invitations")
        .insert({
            event_id: eventId,
            inviter_id: currentUser.id,
            invitee_id: friendId,
        })
        .select(eventInvitationSelect)
        .single();

    if (error) {
        handleInvitationWriteError(error);
    }

    return mapEventInvitation(data);
}

export async function acceptEventInvitation(
    invitationId: string
): Promise<EventInvitation> {
    const currentUser = await getCurrentUserContext();
    const invitation = await getEventInvitationById(invitationId);

    if (invitation.inviteeId !== currentUser.id) {
        throw new Error("Only the invited user can accept this invitation");
    }

    if (invitation.status !== "pending") {
        throw new Error("Only pending invitations can be accepted");
    }

    if (isEventClosed(invitation.event)) {
        throw new Error("This event is already finished");
    }

    const alreadyRegistered = await isUserRegistered(
        invitation.eventId,
        currentUser.id
    );

    if (invitation.event.type === "match") {
        await joinMatch(invitation.eventId, currentUser.id);
        return mutateInvitationStatus(invitationId, "accepted");
    }

    if (!alreadyRegistered) {
        const registrationsCount = await getEventRegistrationsCount(invitation.eventId);

        if (registrationsCount >= invitation.event.maxParticipants) {
            throw new Error("This event is already full");
        }
    }

    const updatedInvitation = await mutateInvitationStatus(invitationId, "accepted");

    if (!alreadyRegistered) {
        await registerToEvent(invitation.eventId, currentUser.id);
    }

    return updatedInvitation;
}

export async function declineEventInvitation(
    invitationId: string
): Promise<EventInvitation> {
    const currentUser = await getCurrentUserContext();
    const invitation = await getEventInvitationById(invitationId);

    if (invitation.inviteeId !== currentUser.id) {
        throw new Error("Only the invited user can decline this invitation");
    }

    if (invitation.status !== "pending") {
        throw new Error("Only pending invitations can be declined");
    }

    return mutateInvitationStatus(invitationId, "declined");
}

export async function cancelEventInvitation(
    invitationId: string
): Promise<EventInvitation> {
    const currentUser = await getCurrentUserContext();
    const invitation = await getEventInvitationById(invitationId);

    if (
        invitation.inviterId !== currentUser.id &&
        currentUser.role !== "admin"
    ) {
        throw new Error("Only the inviter or an admin can cancel this invitation");
    }

    if (invitation.status !== "pending") {
        throw new Error("Only pending invitations can be cancelled");
    }

    return mutateInvitationStatus(invitationId, "cancelled");
}
