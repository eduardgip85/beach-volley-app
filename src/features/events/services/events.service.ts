import { supabase } from "../../../config/supabase";
import { joinMatch } from "../../match-players/services/matchPlayers.service";
import { getUserRegisteredEventIds } from "../../registrations/services/registrations.service";
import {
    UNLIMITED_EVENT_CAPACITY,
    getTournamentTeamSize,
} from "../types/event.types";
import type {
    CreateEventPayload,
    Event,
    EventMode,
    EventResultValidationStatus,
    EventType,
    EventVisibility,
    TournamentBracketType,
    TournamentEntryFeeType,
    TournamentRegistrationType,
    TournamentSettings,
    TournamentSettingsInput,
    TournamentState,
    TournamentTeamFormat,
} from "../types/event.types";
import { resolveEventStatus } from "../utils/event-status.utils";

const EVENTS_CACHE_TTL_MS = 30_000;

interface CacheEntry<T> {
    value: T;
    expiresAt: number;
}

const cache = {
    events: null as CacheEntry<Event[]> | null,
    publicEvents: null as CacheEntry<Event[]> | null,
    createdEventsByUser: new Map<string, CacheEntry<Event[]>>(),
};

const inflightRequests = {
    events: null as Promise<Event[]> | null,
    publicEvents: null as Promise<Event[]> | null,
    createdEventsByUser: new Map<string, Promise<Event[]>>(),
};

function getCachedValue<T>(entry: CacheEntry<T> | null) {
    if (!entry) {
        return null;
    }

    if (entry.expiresAt <= Date.now()) {
        return null;
    }

    return entry.value;
}

function setCachedValue<T>(value: T): CacheEntry<T> {
    return {
        value,
        expiresAt: Date.now() + EVENTS_CACHE_TTL_MS,
    };
}

function invalidateEventCaches() {
    cache.events = null;
    cache.publicEvents = null;
    cache.createdEventsByUser.clear();
    inflightRequests.events = null;
    inflightRequests.publicEvents = null;
    inflightRequests.createdEventsByUser.clear();
}

export function invalidateEventServiceCache() {
    invalidateEventCaches();
}

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

interface EventParticipantCountRow {
    event_id: string;
}

interface TournamentSettingsRow {
    event_id: string;
    registration_type: TournamentRegistrationType;
    team_format: TournamentTeamFormat;
    entry_fee_type: TournamentEntryFeeType;
    entry_fee_amount: number | string | null;
    entry_fee_currency: string | null;
    bracket_type: TournamentBracketType;
    state: TournamentState;
    max_teams: number;
    court_count: number;
    match_duration_minutes: number;
    finals_duration_minutes: number;
    created_at: string;
    updated_at: string;
}

function normalizeTournamentRegistrationType(
    value: unknown
): TournamentRegistrationType {
    return value === "team" ? "team" : "individual";
}

function normalizeTournamentTeamFormat(value: unknown): TournamentTeamFormat {
    return value === "4v4" ? "4v4" : "2v2";
}

function normalizeTournamentEntryFeeType(value: unknown): TournamentEntryFeeType {
    return value === "paid" ? "paid" : "free";
}

function normalizeTournamentBracketType(
    value: unknown
): TournamentBracketType {
    switch (value) {
        case "round_robin":
        case "group_knockout":
        case "double_elimination":
        case "single_elimination":
            return value;
        default:
            return "single_elimination";
    }
}

function normalizeTournamentState(value: unknown): TournamentState {
    switch (value) {
        case "open_registration":
        case "full":
        case "bracket_ready":
        case "in_progress":
        case "completed":
        case "cancelled":
        case "draft":
            return value;
        default:
            return "draft";
    }
}

function mapTournamentSettings(
    row: TournamentSettingsRow
): TournamentSettings {
    return {
        eventId: row.event_id,
        registrationType: normalizeTournamentRegistrationType(
            row.registration_type
        ),
        teamFormat: normalizeTournamentTeamFormat(row.team_format),
        entryFeeType: normalizeTournamentEntryFeeType(row.entry_fee_type),
        entryFeeAmount:
            row.entry_fee_amount === null
                ? null
                : normalizeNumericValue(row.entry_fee_amount),
        entryFeeCurrency: row.entry_fee_currency?.trim() || "EUR",
        bracketType: normalizeTournamentBracketType(row.bracket_type),
        state: normalizeTournamentState(row.state),
        maxTeams: row.max_teams,
        courtCount: row.court_count,
        matchDurationMinutes: row.match_duration_minutes,
        finalsDurationMinutes: row.finals_duration_minutes,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
    };
}

function normalizeTournamentSettingsInput(
    value: TournamentSettingsInput | null | undefined
): TournamentSettingsInput {
    const registrationType = normalizeTournamentRegistrationType(
        value?.registrationType
    );
    const teamFormat = normalizeTournamentTeamFormat(value?.teamFormat);
    const entryFeeType = normalizeTournamentEntryFeeType(value?.entryFeeType);
    const rawEntryFeeAmount =
        value?.entryFeeAmount === null || value?.entryFeeAmount === undefined
            ? null
            : normalizeNumericValue(value.entryFeeAmount);
    const entryFeeAmount =
        entryFeeType === "paid"
            ? Math.max(0.01, Number((rawEntryFeeAmount ?? 0).toFixed(2)))
            : null;

    return {
        registrationType,
        teamFormat,
        entryFeeType,
        entryFeeAmount,
        entryFeeCurrency: value?.entryFeeCurrency?.trim() || "EUR",
        bracketType: normalizeTournamentBracketType(value?.bracketType),
        state: normalizeTournamentState(value?.state),
        maxTeams: Math.max(4, Math.trunc(value?.maxTeams ?? 8)),
        courtCount: Math.max(1, Math.trunc(value?.courtCount ?? 1)),
        matchDurationMinutes: Math.max(
            10,
            Math.trunc(value?.matchDurationMinutes ?? 25)
        ),
        finalsDurationMinutes: Math.max(
            Math.trunc(value?.finalsDurationMinutes ?? 40),
            Math.max(10, Math.trunc(value?.matchDurationMinutes ?? 25))
        ),
    };
}

function getTournamentMaxParticipants(
    tournamentSettings: TournamentSettingsInput
) {
    return (
        tournamentSettings.maxTeams *
        getTournamentTeamSize(tournamentSettings.teamFormat)
    );
}

function buildEventWritePayload(payload: CreateEventPayload) {
    const type = normalizeEventType(payload.type);
    const normalizedTournamentSettings =
        type === "tournament"
            ? normalizeTournamentSettingsInput(payload.tournamentSettings)
            : null;
    const resolvedMaxParticipants =
        type === "tournament" && normalizedTournamentSettings
            ? getTournamentMaxParticipants(normalizedTournamentSettings)
            : normalizeMaxParticipants(type, payload.maxParticipants);

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
        max_participants: resolvedMaxParticipants,
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

async function getEventParticipantCountByEventIds(eventRows: Record<string, unknown>[]) {
    const matchEventIds = eventRows
        .filter((row) => normalizeEventType(row.type) === "match")
        .map((row) => String(row.id));
    const nonMatchEventIds = eventRows
        .filter((row) => normalizeEventType(row.type) !== "match")
        .map((row) => String(row.id));

    const counts = new Map<string, number>();

    if (matchEventIds.length > 0) {
        const { data, error } = await supabase
            .from("match_players")
            .select("event_id")
            .in("event_id", matchEventIds)
            .in("status", ["joined", "confirmed"]);

        if (error) throw error;

        for (const row of (data ?? []) as EventParticipantCountRow[]) {
            counts.set(row.event_id, (counts.get(row.event_id) ?? 0) + 1);
        }
    }

    if (nonMatchEventIds.length > 0) {
        const { data, error } = await supabase
            .from("registrations")
            .select("event_id")
            .in("event_id", nonMatchEventIds);

        if (error) throw error;

        for (const row of (data ?? []) as EventParticipantCountRow[]) {
            counts.set(row.event_id, (counts.get(row.event_id) ?? 0) + 1);
        }
    }

    return counts;
}

async function getTournamentSettingsByEventIds(eventIds: string[]) {
    if (eventIds.length === 0) {
        return new Map<string, TournamentSettings>();
    }

    const { data, error } = await supabase
        .from("tournament_settings")
        .select("*")
        .in("event_id", eventIds);

    if (error) throw error;

    return new Map(
        ((data ?? []) as TournamentSettingsRow[]).map((row) => [
            row.event_id,
            mapTournamentSettings(row),
        ])
    );
}

async function syncTournamentSettings(
    eventId: string,
    eventType: EventType,
    tournamentSettings: TournamentSettingsInput | null | undefined
) {
    if (eventType !== "tournament") {
        const { error } = await supabase
            .from("tournament_settings")
            .delete()
            .eq("event_id", eventId);

        if (error) throw error;
        return;
    }

    const normalizedSettings = normalizeTournamentSettingsInput(tournamentSettings);
    const { error } = await supabase.from("tournament_settings").upsert({
        event_id: eventId,
        registration_type: normalizedSettings.registrationType,
        team_format: normalizedSettings.teamFormat,
        entry_fee_type: normalizedSettings.entryFeeType,
        entry_fee_amount: normalizedSettings.entryFeeAmount,
        entry_fee_currency: normalizedSettings.entryFeeCurrency ?? "EUR",
        bracket_type: normalizedSettings.bracketType,
        state: normalizedSettings.state ?? "draft",
        max_teams: normalizedSettings.maxTeams,
        court_count: normalizedSettings.courtCount,
        match_duration_minutes: normalizedSettings.matchDurationMinutes ?? 25,
        finals_duration_minutes: normalizedSettings.finalsDurationMinutes ?? 40,
        updated_at: new Date().toISOString(),
    });

    if (error) throw error;
}

function mapEvent(
    row: any,
    resultValidationStatus: EventResultValidationStatus | null = null,
    participantCount?: number,
    tournamentSettings?: TournamentSettings | null
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
            participantCount,
        }),
        resultValidationStatus,
        participantCount,
        imageUrl: readRowValue<string | null>(eventRow, "image_url", "imageUrl") ?? null,
        createdBy:
            readRowValue<string>(eventRow, "created_by", "createdBy") ?? "",
        createdAt:
            readRowValue<string>(eventRow, "created_at", "createdAt") ?? "",
        updatedAt:
            readRowValue<string>(eventRow, "updated_at", "updatedAt") ?? "",
        tournamentSettings: tournamentSettings ?? null,
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
    const cachedEvents = getCachedValue(cache.events);

    if (cachedEvents) {
        return cachedEvents;
    }

    if (inflightRequests.events) {
        return inflightRequests.events;
    }

    inflightRequests.events = (async () => {
        const { data, error } = await supabase
            .from("events")
            .select("*")
            .order("start_date", { ascending: true });

        if (error) throw error;

        const matchEventIds = (data ?? [])
            .filter((row) => normalizeEventType(row.type) === "match")
            .map((row) => row.id);
        const tournamentEventIds = (data ?? [])
            .filter((row) => normalizeEventType(row.type) === "tournament")
            .map((row) => row.id);
        const resultStatuses = await getMatchResultStatusByEventIds(matchEventIds);
        const participantCounts = await getEventParticipantCountByEventIds(
            (data ?? []) as Record<string, unknown>[]
        );
        const tournamentSettingsByEventId = await getTournamentSettingsByEventIds(
            tournamentEventIds
        );

        const events = data.map((row) =>
            mapEvent(
                row,
                resultStatuses.get(row.id) ?? null,
                participantCounts.get(row.id) ?? 0,
                tournamentSettingsByEventId.get(row.id) ?? null
            )
        );

        cache.events = setCachedValue(events);

        return events;
    })();

    try {
        return await inflightRequests.events;
    } finally {
        inflightRequests.events = null;
    }
}

export async function getPublicEvents(): Promise<Event[]> {
    const cachedPublicEvents = getCachedValue(cache.publicEvents);

    if (cachedPublicEvents) {
        return cachedPublicEvents;
    }

    if (inflightRequests.publicEvents) {
        return inflightRequests.publicEvents;
    }

    inflightRequests.publicEvents = (async () => {
        const events = await getEvents();
        const publicEvents = events.filter((event) => event.visibility === "public");

        cache.publicEvents = setCachedValue(publicEvents);

        return publicEvents;
    })();

    try {
        return await inflightRequests.publicEvents;
    } finally {
        inflightRequests.publicEvents = null;
    }
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
    const cachedEvents = getCachedValue(cache.events);
    const cachedEvent = cachedEvents?.find((event) => event.id === eventId);

    if (cachedEvent) {
        return cachedEvent;
    }

    const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

    if (error) throw error;

    const resultStatuses = await getMatchResultStatusByEventIds([eventId]);
    const participantCounts = await getEventParticipantCountByEventIds([
        data as Record<string, unknown>,
    ]);
    const tournamentSettingsByEventId =
        normalizeEventType(data.type) === "tournament"
            ? await getTournamentSettingsByEventIds([eventId])
            : new Map<string, TournamentSettings>();

    return mapEvent(
        data,
        resultStatuses.get(eventId) ?? null,
        participantCounts.get(eventId) ?? 0,
        tournamentSettingsByEventId.get(eventId) ?? null
    );
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
    const eventType = normalizeEventType((row.event as Record<string, unknown>).type);
    const resultStatuses =
        eventType === "match"
            ? await getMatchResultStatusByEventIds([eventId])
            : new Map<string, EventResultValidationStatus | null>();
    const participantCounts = await getEventParticipantCountByEventIds([
        row.event as Record<string, unknown>,
    ]);
    const tournamentSettingsByEventId =
        eventType === "tournament"
            ? await getTournamentSettingsByEventIds([eventId])
            : new Map<string, TournamentSettings>();

    return {
        event: mapEvent(
            row.event,
            resultStatuses.get(eventId) ?? null,
            participantCounts.get(eventId) ?? 0,
            tournamentSettingsByEventId.get(eventId) ?? null
        ),
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

    await syncTournamentSettings(
        event.id,
        event.type,
        payload.tournamentSettings
    );

    if (event.type === "match") {
        try {
            await joinMatch(event.id, userId);
        } catch (joinError) {
            console.error("Could not auto-add event creator to match players:", joinError);
        }
    }

    invalidateEventCaches();

    return getEventById(event.id);
}

export async function updateEvent(
    eventId: string,
    payload: CreateEventPayload
): Promise<Event> {
    const data = await updateEventWithTypeFallback(eventId, {
        ...buildEventWritePayload(payload),
        updated_at: new Date().toISOString(),
    });

    const normalizedType = normalizeEventType(data.type);
    await syncTournamentSettings(
        eventId,
        normalizedType,
        payload.tournamentSettings
    );

    invalidateEventCaches();

    return getEventById(eventId);
}

export async function deleteEvent(eventId: string): Promise<void> {
    const { error } = await supabase.from("events").delete().eq("id", eventId);

    if (error) throw error;

    invalidateEventCaches();
}

export async function getEventsByIds(eventIds: string[]): Promise<Event[]> {
    if (eventIds.length === 0) return [];

    const cachedEvents = getCachedValue(cache.events);

    if (cachedEvents) {
        const requestedIds = new Set(eventIds);
        const cachedMatches = cachedEvents.filter((event) => requestedIds.has(event.id));

        if (cachedMatches.length === requestedIds.size) {
            return cachedMatches.sort((left, right) =>
                left.startDate.localeCompare(right.startDate)
            );
        }
    }

    const { data, error } = await supabase
        .from("events")
        .select("*")
        .in("id", eventIds)
        .order("start_date", { ascending: true });

    if (error) throw error;

    const matchEventIds = (data ?? [])
        .filter((row) => normalizeEventType(row.type) === "match")
        .map((row) => row.id);
    const tournamentEventIds = (data ?? [])
        .filter((row) => normalizeEventType(row.type) === "tournament")
        .map((row) => row.id);
    const resultStatuses = await getMatchResultStatusByEventIds(matchEventIds);
    const participantCounts = await getEventParticipantCountByEventIds(
        (data ?? []) as Record<string, unknown>[]
    );
    const tournamentSettingsByEventId = await getTournamentSettingsByEventIds(
        tournamentEventIds
    );

    return data.map((row) =>
        mapEvent(
            row,
            resultStatuses.get(row.id) ?? null,
            participantCounts.get(row.id) ?? 0,
            tournamentSettingsByEventId.get(row.id) ?? null
        )
    );
}

export async function getEventsCreatedByUser(userId: string): Promise<Event[]> {
    const cachedCreatedEvents = getCachedValue(cache.createdEventsByUser.get(userId) ?? null);

    if (cachedCreatedEvents) {
        return cachedCreatedEvents;
    }

    const inflightCreatedEvents = inflightRequests.createdEventsByUser.get(userId);

    if (inflightCreatedEvents) {
        return inflightCreatedEvents;
    }

    const request = (async () => {
        const { data, error } = await supabase
            .from("events")
            .select("*")
            .eq("created_by", userId)
            .order("start_date", { ascending: true });

        if (error) throw error;

        const matchEventIds = (data ?? [])
            .filter((row) => normalizeEventType(row.type) === "match")
            .map((row) => row.id);
        const tournamentEventIds = (data ?? [])
            .filter((row) => normalizeEventType(row.type) === "tournament")
            .map((row) => row.id);
        const resultStatuses = await getMatchResultStatusByEventIds(matchEventIds);
        const participantCounts = await getEventParticipantCountByEventIds(
            (data ?? []) as Record<string, unknown>[]
        );
        const tournamentSettingsByEventId = await getTournamentSettingsByEventIds(
            tournamentEventIds
        );

        const createdEvents = data.map((row) =>
            mapEvent(
                row,
                resultStatuses.get(row.id) ?? null,
                participantCounts.get(row.id) ?? 0,
                tournamentSettingsByEventId.get(row.id) ?? null
            )
        );

        cache.createdEventsByUser.set(userId, setCachedValue(createdEvents));

        return createdEvents;
    })();

    inflightRequests.createdEventsByUser.set(userId, request);

    try {
        return await request;
    } finally {
        inflightRequests.createdEventsByUser.delete(userId);
    }
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
