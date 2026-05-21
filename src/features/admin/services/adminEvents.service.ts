import { supabase } from "../../../config/supabase";
import type {
  Event,
  EventResultValidationStatus,
} from "../../events/types/event.types";
import { resolveEventStatus } from "../../events/utils/event-status.utils";

interface AdminEventsRow {
  id: string;
  title: string;
  description: string | null;
  type: Event["type"];
  visibility: Event["visibility"];
  mode: Event["mode"];
  location_name: string;
  latitude: number | null;
  longitude: number | null;
  start_date: string;
  end_date: string | null;
  max_participants: number;
  status: string | null;
  image_url: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface MatchResultStatusRow {
  event_id: string;
  validation_status: EventResultValidationStatus;
}

interface EventParticipantCountRow {
  event_id: string;
}

interface AdminEventCreatorRow {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export interface AdminEventListItem {
  event: Event;
  creatorName: string | null;
  creatorAvatarUrl: string | null;
}

export interface GetAdminEventsParams {
  page: number;
  pageSize: number;
  search?: string;
  onlyVisibleActive?: boolean;
}

export interface GetAdminEventsResult {
  items: AdminEventListItem[];
  totalCount: number;
  summary: {
    active: number;
    finished: number;
    cancelled: number;
  };
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

async function getEventParticipantCountByEventIds(rows: AdminEventsRow[]) {
  const matchEventIds = rows
    .filter((row) => row.type === "match")
    .map((row) => row.id);
  const nonMatchEventIds = rows
    .filter((row) => row.type !== "match")
    .map((row) => row.id);
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

function mapEvent(
  row: AdminEventsRow,
  resultValidationStatus: EventResultValidationStatus | null = null,
  participantCount?: number
): Event {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    type: row.type,
    visibility: row.visibility,
    mode: row.mode,
    locationName: row.location_name,
    latitude: Number(row.latitude ?? 0),
    longitude: Number(row.longitude ?? 0),
    startDate: row.start_date,
    endDate: row.end_date,
    maxParticipants: row.max_participants,
    status: resolveEventStatus({
      type: row.type,
      status: row.status,
      startDate: row.start_date,
      resultValidationStatus,
      participantCount,
    }),
    resultValidationStatus,
    participantCount,
    imageUrl: row.image_url,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function sanitizeSearchValue(value: string) {
  return value.trim().replace(/[%(),]/g, " ").replace(/\s+/g, " ");
}

export async function getAdminEvents({
  page,
  pageSize,
  search = "",
  onlyVisibleActive = false,
}: GetAdminEventsParams): Promise<GetAdminEventsResult> {
  const safePage = Math.max(1, page);
  const from = (safePage - 1) * pageSize;
  const to = from + pageSize - 1;
  const normalizedSearch = sanitizeSearchValue(search);
  const nowIso = new Date().toISOString();

  let matchingCreatorIds: string[] = [];

  if (normalizedSearch) {
    const { data: creators, error: creatorsError } = await supabase
      .from("profiles")
      .select("id")
      .ilike("full_name", `%${normalizedSearch}%`)
      .limit(50);

    if (creatorsError) {
      throw creatorsError;
    }

    matchingCreatorIds = (creators ?? []).map((creator) => creator.id);
  }

  let query = supabase
    .from("events")
    .select("*", { count: "exact" })
    .order("start_date", { ascending: onlyVisibleActive })
    .range(from, to);

  if (onlyVisibleActive) {
    query = query
      .neq("status", "cancelled")
      .gte("start_date", nowIso);
  }

  if (normalizedSearch) {
    const searchClauses = [
      `title.ilike.%${normalizedSearch}%`,
      `location_name.ilike.%${normalizedSearch}%`,
    ];

    if (matchingCreatorIds.length > 0) {
      searchClauses.push(`created_by.in.(${matchingCreatorIds.join(",")})`);
    }

    query = query.or(
      searchClauses.join(",")
    );
  }

  const { data, error, count } = await query;

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as AdminEventsRow[];

  let summaryQuery = supabase
    .from("events")
    .select("*")
    .order("start_date", { ascending: onlyVisibleActive });

  if (onlyVisibleActive) {
    summaryQuery = summaryQuery
      .neq("status", "cancelled")
      .gte("start_date", nowIso);
  }

  if (normalizedSearch) {
    const searchClauses = [
      `title.ilike.%${normalizedSearch}%`,
      `location_name.ilike.%${normalizedSearch}%`,
    ];

    if (matchingCreatorIds.length > 0) {
      searchClauses.push(`created_by.in.(${matchingCreatorIds.join(",")})`);
    }

    summaryQuery = summaryQuery.or(searchClauses.join(","));
  }

  const { data: summaryData, error: summaryError } = await summaryQuery;

  if (summaryError) {
    throw summaryError;
  }

  const summaryRows = (summaryData ?? []) as AdminEventsRow[];
  const allRows = [...rows, ...summaryRows];
  const uniqueRows = new Map<string, AdminEventsRow>();

  for (const row of allRows) {
    uniqueRows.set(row.id, row);
  }

  const dedupedRows = Array.from(uniqueRows.values());
  const matchEventIds = dedupedRows
    .filter((row) => row.type === "match")
    .map((row) => row.id);
  const resultStatuses = await getMatchResultStatusByEventIds(matchEventIds);
  const participantCounts = await getEventParticipantCountByEventIds(dedupedRows);
  const pageEvents = rows.map((row) =>
    mapEvent(
      row,
      resultStatuses.get(row.id) ?? null,
      participantCounts.get(row.id) ?? 0
    )
  );
  const summaryEvents = summaryRows.map((row) =>
    mapEvent(
      row,
      resultStatuses.get(row.id) ?? null,
      participantCounts.get(row.id) ?? 0
    )
  );
  const creatorIds = Array.from(
    new Set(pageEvents.map((event) => event.createdBy).filter(Boolean))
  );

  let creatorMap = new Map<string, AdminEventCreatorRow>();

  if (creatorIds.length > 0) {
    const { data: creators, error: creatorsError } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", creatorIds);

    if (creatorsError) {
      throw creatorsError;
    }

    creatorMap = new Map(
      ((creators ?? []) as AdminEventCreatorRow[]).map((creator) => [
        creator.id,
        creator,
      ])
    );
  }

  return {
    items: pageEvents.map((event) => {
      const creator = creatorMap.get(event.createdBy);

      return {
        event,
        creatorName: creator?.full_name ?? null,
        creatorAvatarUrl: creator?.avatar_url ?? null,
      };
    }),
    totalCount: count ?? 0,
    summary: summaryEvents.reduce(
      (acc, event) => {
        if (event.status === "completed") {
          acc.finished += 1;
        } else if (event.status === "cancelled") {
          acc.cancelled += 1;
        } else {
          acc.active += 1;
        }

        return acc;
      },
      { active: 0, finished: 0, cancelled: 0 }
    ),
  };
}
