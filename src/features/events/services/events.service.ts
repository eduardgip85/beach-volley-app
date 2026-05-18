import { supabase } from "../../../config/supabase";
import { joinMatch } from "../../match-players/services/matchPlayers.service";
import type {
    CreateEventPayload,
    Event,
    EventMode,
    EventStatus,
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

function readRowValue<T>(
    row: Record<string, unknown>,
    snakeCaseKey: string,
    camelCaseKey: string
): T | undefined {
    if (row[snakeCaseKey] !== undefined) {
        return row[snakeCaseKey] as T;
    }

    if (row[camelCaseKey] !== undefined) {
        return row[camelCaseKey] as T;
    }

    return undefined;
}

function normalizeNumericValue(value: unknown): number {
    if (typeof value === "number") {
        return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === "string") {
        const parsed = Number(value);

        return Number.isFinite(parsed) ? parsed : 0;
    }

    return 0;
}

function normalizeEventStatus(
    status: unknown,
    startDate: string
): EventStatus {
    if (status === "cancelled") {
        return "cancelled";
    }

    if (status === "completed") {
        return "completed";
    }

    if (new Date(startDate) < new Date()) {
        return "completed";
    }

    return "active";
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
    const eventRow = row as Record<string, unknown>;
    const type = normalizeEventType(row.type);
    const startDate =
        readRowValue<string>(eventRow, "start_date", "startDate") ?? "";

    return {
        id: row.id,
        title: row.title,
        description: row.description,
        type,
        visibility: normalizeEventVisibility(row.visibility),
        mode: normalizeEventMode(type, row.mode),
        locationName:
            readRowValue<string>(eventRow, "location_name", "locationName") ?? "",
        latitude: normalizeNumericValue(row.latitude),
        longitude: normalizeNumericValue(row.longitude),
        startDate,
        endDate: readRowValue<string | null>(eventRow, "end_date", "endDate") ?? null,
        maxParticipants:
            readRowValue<number>(eventRow, "max_participants", "maxParticipants") ?? 0,
        status: normalizeEventStatus(row.status, startDate),
        imageUrl: readRowValue<string | null>(eventRow, "image_url", "imageUrl") ?? null,
        createdBy:
            readRowValue<string>(eventRow, "created_by", "createdBy") ?? "",
        createdAt:
            readRowValue<string>(eventRow, "created_at", "createdAt") ?? "",
        updatedAt:
            readRowValue<string>(eventRow, "updated_at", "updatedAt") ?? "",
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
    const summaryRow = row as unknown as Record<string, unknown>;

    return {
        event: mapEvent(row.event),
        creatorName:
            summaryRow.creatorName?.toString() ??
            summaryRow.creator_name?.toString() ??
            null,
        registrationsCount: Number(
            summaryRow.registrationsCount ??
            summaryRow.registrations_count ??
            0
        ),
        isRegistered: Boolean(
            summaryRow.isRegistered ??
            summaryRow.is_registered
        ),
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
