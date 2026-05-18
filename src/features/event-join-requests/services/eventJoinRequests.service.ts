import { getCurrentProfile } from "../../auth/services/auth.service";
import { joinMatch } from "../../match-players/services/matchPlayers.service";
import {
    getEventRegistrationsCount,
    isUserRegistered,
    registerToEvent,
} from "../../registrations/services/registrations.service";
import { supabase } from "../../../config/supabase";
import { isUnlimitedEventCapacity } from "../../events/types/event.types";
import type {
    EventMode,
    EventStatus,
    EventType,
    EventVisibility,
} from "../../events/types/event.types";
import type {
    EventJoinRequest,
    EventJoinRequestEventSummary,
    EventJoinRequestProfile,
    EventJoinRequestStatus,
} from "../types/eventJoinRequest.types";

interface EventSummaryRow {
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

interface RequesterProfileRow {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
}

interface EventJoinRequestRow {
    id: string;
    event_id: string;
    requester_id: string;
    status: EventJoinRequestStatus;
    created_at: string;
    updated_at: string;
    event: EventSummaryRow[] | EventSummaryRow;
    requester: RequesterProfileRow[] | RequesterProfileRow;
}

interface EventResultStatusRow {
    validation_status: string;
}

const eventJoinRequestSelect = `
    id,
    event_id,
    requester_id,
    status,
    created_at,
    updated_at,
    event:events!event_join_requests_event_id_fkey(
        id,
        title,
        type,
        mode,
        visibility,
        location_name,
        start_date,
        max_participants,
        status,
        created_by
    ),
    requester:profiles!event_join_requests_requester_id_fkey(
        id,
        full_name,
        email,
        avatar_url
    )
`;

function normalizeRelation<T>(relation: T[] | T): T {
    return Array.isArray(relation) ? relation[0] : relation;
}

function mapEventSummary(row: EventSummaryRow): EventJoinRequestEventSummary {
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

function isEventClosed(event: EventJoinRequestEventSummary) {
    return (
        event.status === "completed" ||
        event.status === "cancelled" ||
        new Date(event.startDate) < new Date()
    );
}

function mapRequesterProfile(row: RequesterProfileRow): EventJoinRequestProfile {
    return {
        id: row.id,
        fullName: row.full_name,
        email: row.email,
        avatarUrl: row.avatar_url,
    };
}

function mapEventJoinRequest(row: EventJoinRequestRow): EventJoinRequest {
    return {
        id: row.id,
        eventId: row.event_id,
        requesterId: row.requester_id,
        status: row.status,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        event: mapEventSummary(normalizeRelation(row.event)),
        requester: mapRequesterProfile(normalizeRelation(row.requester)),
    };
}

async function getCurrentUserContext() {
    const profile = await getCurrentProfile();

    if (!profile) {
        throw new Error("You must be logged in to manage private event requests");
    }

    return profile;
}

async function getEventSummary(eventId: string): Promise<EventJoinRequestEventSummary> {
    const { data, error } = await supabase
        .from("events")
        .select(
            "id, title, type, mode, visibility, location_name, start_date, max_participants, status, created_by"
        )
        .eq("id", eventId)
        .single();

    if (error) throw error;

    return mapEventSummary(data);
}

async function isMatchClosed(eventId: string) {
    const { data, error } = await supabase
        .from("match_results")
        .select("validation_status")
        .eq("event_id", eventId)
        .eq("validation_status", "accepted")
        .maybeSingle<EventResultStatusRow>();

    if (error) throw error;

    return Boolean(data);
}

async function getEventJoinRequestById(
    requestId: string
): Promise<EventJoinRequest> {
    const { data, error } = await supabase
        .from("event_join_requests")
        .select(eventJoinRequestSelect)
        .eq("id", requestId)
        .single();

    if (error) throw error;

    return mapEventJoinRequest(data);
}

function handleRequestWriteError(error: any): never {
    if (error?.code === "23505") {
        throw new Error("You already have a pending request for this event");
    }

    throw error;
}

async function mutateRequestStatus(
    requestId: string,
    status: EventJoinRequestStatus
): Promise<EventJoinRequest> {
    const { data, error } = await supabase
        .from("event_join_requests")
        .update({
            status,
            updated_at: new Date().toISOString(),
        })
        .eq("id", requestId)
        .select(eventJoinRequestSelect)
        .single();

    if (error) throw error;

    return mapEventJoinRequest(data);
}

export async function getEventJoinRequests(
    eventId: string
): Promise<EventJoinRequest[]> {
    const { data, error } = await supabase
        .from("event_join_requests")
        .select(eventJoinRequestSelect)
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map(mapEventJoinRequest);
}

export async function getMyEventJoinRequests(
    userId: string
): Promise<EventJoinRequest[]> {
    const { data, error } = await supabase
        .from("event_join_requests")
        .select(eventJoinRequestSelect)
        .eq("requester_id", userId)
        .order("created_at", { ascending: false });

    if (error) throw error;

    return data.map(mapEventJoinRequest);
}

export async function getMyEventJoinRequestForEvent(
    eventId: string,
    userId: string
): Promise<EventJoinRequest | null> {
    const { data, error } = await supabase
        .from("event_join_requests")
        .select(eventJoinRequestSelect)
        .eq("event_id", eventId)
        .eq("requester_id", userId)
        .in("status", ["pending", "accepted", "rejected", "cancelled"])
        .order("created_at", { ascending: false })
        .maybeSingle();

    if (error) throw error;

    return data ? mapEventJoinRequest(data) : null;
}

export async function requestToJoinPrivateEvent(
    eventId: string
): Promise<EventJoinRequest> {
    const currentUser = await getCurrentUserContext();
    const event = await getEventSummary(eventId);

    if (event.visibility !== "private") {
        throw new Error("Only private events require join approval");
    }

    if (currentUser.id === event.createdBy || currentUser.role === "admin") {
        throw new Error("Event managers do not need to request access");
    }

    const alreadyRegistered = await isUserRegistered(eventId, currentUser.id);

    if (alreadyRegistered) {
        throw new Error("You are already registered for this event");
    }

    if (isEventClosed(event)) {
        throw new Error("This event is already finished");
    }

    if (event.type === "match" && (await isMatchClosed(eventId))) {
        throw new Error("This match is already closed because the result was validated");
    }

    const existingRequest = await getMyEventJoinRequestForEvent(
        eventId,
        currentUser.id
    );

    if (existingRequest?.status === "pending") {
        throw new Error("You already have a pending request for this event");
    }

    if (existingRequest?.status === "accepted") {
        throw new Error("Your access request was already accepted");
    }

    if (
        existingRequest &&
        (existingRequest.status === "rejected" ||
            existingRequest.status === "cancelled")
    ) {
        return mutateRequestStatus(existingRequest.id, "pending");
    }

    const { data, error } = await supabase
        .from("event_join_requests")
        .insert({
            event_id: eventId,
            requester_id: currentUser.id,
        })
        .select(eventJoinRequestSelect)
        .single();

    if (error) {
        handleRequestWriteError(error);
    }

    return mapEventJoinRequest(data);
}

export async function acceptEventJoinRequest(
    requestId: string
): Promise<EventJoinRequest> {
    const currentUser = await getCurrentUserContext();
    const request = await getEventJoinRequestById(requestId);

    if (
        currentUser.id !== request.event.createdBy &&
        currentUser.role !== "admin"
    ) {
        throw new Error("Only the event creator or an admin can accept this request");
    }

    if (request.status !== "pending") {
        throw new Error("Only pending requests can be accepted");
    }

    if (isEventClosed(request.event)) {
        throw new Error("This event is already finished");
    }

    if (request.event.type === "match" && (await isMatchClosed(request.eventId))) {
        throw new Error("This match is already closed because the result was validated");
    }

    const alreadyRegistered = await isUserRegistered(
        request.eventId,
        request.requesterId
    );

    if (request.event.type === "match") {
        await joinMatch(request.eventId, request.requesterId);
        return mutateRequestStatus(requestId, "accepted");
    }

    if (!alreadyRegistered) {
        const registrationsCount = await getEventRegistrationsCount(request.eventId);

        if (
            !isUnlimitedEventCapacity(request.event.maxParticipants) &&
            registrationsCount >= request.event.maxParticipants
        ) {
            throw new Error("This event is already full");
        }
    }

    const updatedRequest = await mutateRequestStatus(requestId, "accepted");

    if (!alreadyRegistered) {
        await registerToEvent(request.eventId, request.requesterId);
    }

    return updatedRequest;
}

export async function rejectEventJoinRequest(
    requestId: string
): Promise<EventJoinRequest> {
    const currentUser = await getCurrentUserContext();
    const request = await getEventJoinRequestById(requestId);

    if (
        currentUser.id !== request.event.createdBy &&
        currentUser.role !== "admin"
    ) {
        throw new Error("Only the event creator or an admin can reject this request");
    }

    if (request.status !== "pending") {
        throw new Error("Only pending requests can be rejected");
    }

    return mutateRequestStatus(requestId, "rejected");
}

export async function cancelEventJoinRequest(
    requestId: string
): Promise<EventJoinRequest> {
    const currentUser = await getCurrentUserContext();
    const request = await getEventJoinRequestById(requestId);

    if (request.requesterId !== currentUser.id) {
        throw new Error("Only the requester can cancel this request");
    }

    if (request.status !== "pending") {
        throw new Error("Only pending requests can be cancelled");
    }

    return mutateRequestStatus(requestId, "cancelled");
}
