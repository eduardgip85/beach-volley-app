import { supabase } from "../../../config/supabase";
import type { Event } from "../../events/types/event.types";

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
}

function normalizeEventStatus(status: unknown, startDate: string): Event["status"] {
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

function mapEvent(row: AdminEventsRow): Event {
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
    status: normalizeEventStatus(row.status, row.start_date),
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
    .order("start_date", { ascending: false })
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
  const events = rows.map(mapEvent);
  const creatorIds = Array.from(
    new Set(events.map((event) => event.createdBy).filter(Boolean))
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
    items: events.map((event) => {
      const creator = creatorMap.get(event.createdBy);

      return {
        event,
        creatorName: creator?.full_name ?? null,
        creatorAvatarUrl: creator?.avatar_url ?? null,
      };
    }),
    totalCount: count ?? 0,
  };
}
