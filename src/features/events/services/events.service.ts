import { supabase } from "../../../config/supabase";
import { joinMatch } from "../../match-players/services/matchPlayers.service";
import type {
    CreateEventPayload,
    Event,
    EventMode,
    EventType,
    EventVisibility,
} from "../types/event.types";

function normalizeEventType(type: unknown): EventType {
    if (type === "open_play" || type === "tournament") {
        return type;
    }

    return "match";
}

function normalizeEventVisibility(visibility: unknown): EventVisibility {
    return visibility === "private" ? "private" : "public";
}

function normalizeEventMode(type: EventType, mode: unknown): EventMode | null {
    if (type === "open_play") {
        return null;
    }

    if (type === "match") {
        return mode === "competitive" ? "competitive" : "casual";
    }

    if (mode === "casual" || mode === "competitive") {
        return mode;
    }

    return null;
}

function normalizeMaxParticipants(type: EventType, maxParticipants: number) {
    if (type === "match") {
        return 4;
    }

    return maxParticipants;
}

function buildEventWritePayload(payload: CreateEventPayload) {
    const type = normalizeEventType(payload.type);

    return {
        title: payload.title,
        description: payload.description,
        type,
        visibility: normalizeEventVisibility(payload.visibility),
        mode: normalizeEventMode(type, payload.mode),
        location_name: payload.locationName,
        latitude: payload.latitude,
        longitude: payload.longitude,
        image_url: payload.imageUrl ?? null,
        start_date: payload.startDate,
        end_date: payload.endDate ?? null,
        max_participants: normalizeMaxParticipants(type, payload.maxParticipants),
    };
}

function mapEvent(row: any): Event {
    const type = normalizeEventType(row.type);

    return {
        id: row.id,
        title: row.title,
        description: row.description,
        type,
        visibility: normalizeEventVisibility(row.visibility),
        mode: normalizeEventMode(type, row.mode),
        locationName: row.location_name,
        latitude: Number(row.latitude),
        longitude: Number(row.longitude),
        startDate: row.start_date,
        endDate: row.end_date,
        maxParticipants: row.max_participants,
        status: row.status,
        imageUrl: row.image_url,
        createdBy: row.created_by,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

interface EventDetailSummaryRow {
    event: any;
    creatorName: string | null;
    registrationsCount: number;
    isRegistered: boolean;
}

export interface EventDetailSummary {
    event: Event;
    creatorName: string | null;
    registrationsCount: number;
    isRegistered: boolean;
}

export async function getEvents(): Promise<Event[]> {
    const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_date", { ascending: true });

    if (error) throw error;

    return data.map(mapEvent);
}

export async function getPublicEvents(): Promise<Event[]> {
    const events = await getEvents();

    return events.filter((event) => event.visibility === "public");
}

export async function getEventById(eventId: string): Promise<Event> {
    const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

    if (error) throw error;

    return mapEvent(data);
}

export async function getEventDetailSummary(
    eventId: string
): Promise<EventDetailSummary> {
    const { data, error } = await supabase.rpc("get_event_detail_summary", {
        target_event_id: eventId,
    });

    if (error) throw error;

    const row = data as EventDetailSummaryRow;

    return {
        event: mapEvent(row.event),
        creatorName: row.creatorName ?? null,
        registrationsCount: Number(row.registrationsCount ?? 0),
        isRegistered: Boolean(row.isRegistered),
    };
}

export async function createEvent(
    payload: CreateEventPayload,
    userId: string
): Promise<Event> {
    const { data, error } = await supabase
        .from("events")
        .insert({
        ...buildEventWritePayload(payload),
        created_by: userId,
        status: "active",
        })
        .select()
        .single();

    if (error) throw error;

    const event = mapEvent(data);

    if (event.type === "match") {
        try {
            await joinMatch(event.id, userId);
        } catch (joinError) {
            console.error("Could not auto-add event creator to match players:", joinError);
        }
    }

    return event;
}

export async function updateEvent(
    eventId: string,
    payload: CreateEventPayload
): Promise<Event> {
    const { data, error } = await supabase
        .from("events")
        .update({
        ...buildEventWritePayload(payload),
        updated_at: new Date().toISOString(),
        })
        .eq("id", eventId)
        .select()
        .single();

    if (error) throw error;

    return mapEvent(data);
}

export async function deleteEvent(eventId: string): Promise<void> {
    const { error } = await supabase.from("events").delete().eq("id", eventId);

    if (error) throw error;
}

export async function getEventsByIds(eventIds: string[]): Promise<Event[]> {
    if (eventIds.length === 0) return [];

    const { data, error } = await supabase
        .from("events")
        .select("*")
        .in("id", eventIds)
        .order("start_date", { ascending: true });

    if (error) throw error;

    return data.map(mapEvent);
}

export async function getEventsCreatedByUser(userId: string): Promise<Event[]> {
    const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("created_by", userId)
        .order("start_date", { ascending: true });

    if (error) throw error;

    return data.map(mapEvent);
}

export async function getProfileNameById(userId: string): Promise<string | null> {
    const { data, error } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .maybeSingle();

    if (error) throw error;

    return data?.full_name ?? null;
}
