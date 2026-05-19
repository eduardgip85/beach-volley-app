import { supabase } from "../../../config/supabase";
import { joinMatch } from "../../match-players/services/matchPlayers.service";
import { getUserRegisteredEventIds } from "../../registrations/services/registrations.service";
import { UNLIMITED_EVENT_CAPACITY } from "../types/event.types";
import type {
    CreateEventPayload,
    Event,
    EventMode,
    EventResultValidationStatus,
    EventType,
    EventVisibility,
} from "../types/event.types";
import { resolveEventStatus } from "../utils/event-status.utils";

function normalizeEventType(type: unknown): EventType {
    if (
        type === "open_play" ||
        type === "openPlay" ||
        type === "openplay" ||
        type === "tournament"
    ) {
        if (type === "openPlay" || type === "openplay") {
            return "open_play";
        }

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

    if (!Number.isFinite(maxParticipants) || maxParticipants <= 0) {
        return UNLIMITED_EVENT_CAPACITY;
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

interface MatchResultStatusRow {
    event_id: string;
    validation_status: EventResultValidationStatus;
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

function isTypeConstraintError(error: unknown) {
    if (!error || typeof error !== "object") {
        return false;
    }

    const dbError = error as {
        code?: string;
        message?: string;
        constraint?: string;
    };

    return (
        dbError.constraint === "events_type_check" ||
        dbError.message?.includes("events_type_check") ||
        dbError.code === "23514"
    );
}

async function insertEventWithTypeFallback(payload: Record<string, unknown>) {
    const candidateTypes =
        payload.type === "open_play"
            ? ["open_play", "openPlay", "openplay"]
            : [payload.type];

    let lastError: unknown = null;

    for (const candidateType of candidateTypes) {
        const { data, error } = await supabase
            .from("events")
            .insert({
                ...payload,
                type: candidateType,
            })
            .select()
            .single();

        if (!error) {
            return data;
        }

        lastError = error;

        if (!(payload.type === "open_play" && isTypeConstraintError(error))) {
            throw error;
        }
    }

    throw lastError;
}

async function updateEventWithTypeFallback(
    eventId: string,
    payload: Record<string, unknown>
) {
    const candidateTypes =
        payload.type === "open_play"
            ? ["open_play", "openPlay", "openplay"]
            : [payload.type];

    let lastError: unknown = null;

    for (const candidateType of candidateTypes) {
        const { data, error } = await supabase
            .from("events")
            .update({
                ...payload,
                type: candidateType,
            })
            .eq("id", eventId)
            .select()
            .maybeSingle();

        if (!error) {
            if (data) {
                return data;
            }

            return await getEventById(eventId);
        }

        lastError = error;

        if (!(payload.type === "open_play" && isTypeConstraintError(error))) {
            throw error;
        }
    }

    throw lastError;
}

function pickResultValidationStatus(
    rows: MatchResultStatusRow[]
): EventResultValidationStatus | null {
    if (rows.some((row) => row.validation_status === "accepted")) {
        return "accepted";
    }

    if (rows.some((row) => row.validation_status === "pending")) {
        return "pending";
    }

    if (rows.some((row) => row.validation_status === "rejected")) {
        return "rejected";
    }

    return null;
}

async function getMatchResultStatusByEventIds(eventIds: string[]) {
    if (eventIds.length === 0) {
        return new Map<string, EventResultValidationStatus | null>();
    }

    const { data, error } = await supabase
        .from("match_results")
        .select("event_id, validation_status")
        .in("event_id", eventIds);

    if (error) throw error;

    const groupedRows = new Map<string, MatchResultStatusRow[]>();

    for (const row of (data ?? []) as MatchResultStatusRow[]) {
        const currentRows = groupedRows.get(row.event_id) ?? [];
        currentRows.push(row);
        groupedRows.set(row.event_id, currentRows);
    }

    return new Map(
        Array.from(groupedRows.entries()).map(([eventId, rows]) => [
            eventId,
            pickResultValidationStatus(rows),
        ])
    );
}

function mapEvent(
    row: any,
    resultValidationStatus: EventResultValidationStatus | null = null
): Event {
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
        status: resolveEventStatus({
            type,
            status: row.status,
            startDate,
            resultValidationStatus,
        }),
        resultValidationStatus,
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

export interface AccessibleEventsResult {
    events: Event[];
    myEventIds: string[];
}

export async function getEvents(): Promise<Event[]> {
    const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_date", { ascending: true });

    if (error) throw error;

    const matchEventIds = (data ?? [])
        .filter((row) => normalizeEventType(row.type) === "match")
        .map((row) => row.id);
    const resultStatuses = await getMatchResultStatusByEventIds(matchEventIds);

    return data.map((row) => mapEvent(row, resultStatuses.get(row.id) ?? null));
}

export async function getPublicEvents(): Promise<Event[]> {
    const events = await getEvents();

    return events.filter((event) => event.visibility === "public");
}

export async function getAccessibleEventsForUser(
    userId?: string | null
): Promise<AccessibleEventsResult> {
    if (!userId) {
        return {
            events: await getPublicEvents(),
            myEventIds: [],
        };
    }

    const [publicEvents, createdEvents, registeredEventIds] = await Promise.all([
        getPublicEvents(),
        getEventsCreatedByUser(userId),
        getUserRegisteredEventIds(userId),
    ]);

    const joinedEvents =
        registeredEventIds.length > 0 ? await getEventsByIds(registeredEventIds) : [];

    const mergedEvents = new Map<string, Event>();

    [...publicEvents, ...createdEvents, ...joinedEvents].forEach((event) => {
        mergedEvents.set(event.id, event);
    });

    return {
        events: Array.from(mergedEvents.values()).sort((left, right) =>
            left.startDate.localeCompare(right.startDate)
        ),
        myEventIds: Array.from(
            new Set([
                ...createdEvents.map((event) => event.id),
                ...registeredEventIds,
            ])
        ),
    };
}

export async function getEventById(eventId: string): Promise<Event> {
    const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

    if (error) throw error;

    const resultStatuses = await getMatchResultStatusByEventIds([eventId]);

    return mapEvent(data, resultStatuses.get(eventId) ?? null);
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
    const resultStatuses = await getMatchResultStatusByEventIds([eventId]);

    return {
        event: mapEvent(row.event, resultStatuses.get(eventId) ?? null),
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
    const data = await insertEventWithTypeFallback({
        ...buildEventWritePayload(payload),
        created_by: userId,
        status: "active",
    });

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
    const data = await updateEventWithTypeFallback(eventId, {
        ...buildEventWritePayload(payload),
        updated_at: new Date().toISOString(),
    });

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

    const matchEventIds = (data ?? [])
        .filter((row) => normalizeEventType(row.type) === "match")
        .map((row) => row.id);
    const resultStatuses = await getMatchResultStatusByEventIds(matchEventIds);

    return data.map((row) => mapEvent(row, resultStatuses.get(row.id) ?? null));
}

export async function getEventsCreatedByUser(userId: string): Promise<Event[]> {
    const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("created_by", userId)
        .order("start_date", { ascending: true });

    if (error) throw error;

    const matchEventIds = (data ?? [])
        .filter((row) => normalizeEventType(row.type) === "match")
        .map((row) => row.id);
    const resultStatuses = await getMatchResultStatusByEventIds(matchEventIds);

    return data.map((row) => mapEvent(row, resultStatuses.get(row.id) ?? null));
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
