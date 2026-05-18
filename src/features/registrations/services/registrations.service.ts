import { supabase } from "../../../config/supabase";

interface EventParticipationRow {
  id: string;
  start_date: string;
  status: string;
}

interface EventParticipantProfileRow {
  id: string;
  full_name: string;
  avatar_url: string | null;
  country: string | null;
}

interface EventParticipantRow {
  id: string;
  user_id: string;
  profile: EventParticipantProfileRow[] | EventParticipantProfileRow;
}

export interface EventParticipantProfile {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  country: string | null;
}

export interface EventParticipant {
  id: string;
  userId: string;
  profile: EventParticipantProfile;
}

function normalizeRelation<T>(relation: T[] | T): T {
  return Array.isArray(relation) ? relation[0] : relation;
}

function mapEventParticipant(row: EventParticipantRow): EventParticipant {
  const profile = normalizeRelation(row.profile);

  return {
    id: row.id,
    userId: row.user_id,
    profile: {
      id: profile.id,
      fullName: profile.full_name,
      avatarUrl: profile.avatar_url,
      country: profile.country,
    },
  };
}

async function getEventParticipationRow(eventId: string): Promise<EventParticipationRow> {
  const { data, error } = await supabase
    .from("events")
    .select("id, start_date, status")
    .eq("id", eventId)
    .single();

  if (error) throw error;

  return data;
}

function isEventClosedForParticipation(event: EventParticipationRow) {
  return (
    event.status === "completed" ||
    event.status === "cancelled" ||
    new Date(event.start_date) < new Date()
  );
}

export async function getEventRegistrationsCount(eventId: string) {
  const { count, error } = await supabase
    .from("registrations")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);

  if (error) throw error;

  return count ?? 0;
}

export async function isUserRegistered(eventId: string, userId: string) {
  const { data, error } = await supabase
    .from("registrations")
    .select("id")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  return Boolean(data);
}

export async function registerToEvent(eventId: string, userId: string) {
  const event = await getEventParticipationRow(eventId);

  if (isEventClosedForParticipation(event)) {
    throw new Error("This event is already finished");
  }

  const { data, error } = await supabase
    .from("registrations")
    .insert({
      event_id: eventId,
      user_id: userId,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
}

export async function unregisterFromEvent(eventId: string, userId: string) {
  const event = await getEventParticipationRow(eventId);

  if (isEventClosedForParticipation(event)) {
    throw new Error("This event is already finished");
  }

  const { error } = await supabase
    .from("registrations")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", userId);

  if (error) throw error;
}

export async function getUserRegisteredEventIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("registrations")
    .select("event_id")
    .eq("user_id", userId);

  if (error) throw error;

  return data.map((item) => item.event_id);
}

export async function getEventRegisteredUserIds(eventId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("registrations")
    .select("user_id")
    .eq("event_id", eventId);

  if (error) throw error;

  return data.map((item) => item.user_id);
}

export async function getEventParticipants(
  eventId: string
): Promise<EventParticipant[]> {
  const { data, error } = await supabase
    .from("registrations")
    .select(
      "id, user_id, profile:profiles!registrations_user_id_fkey(id, full_name, avatar_url, country)"
    )
    .eq("event_id", eventId);

  if (error) throw error;

  return data.map((row) => mapEventParticipant(row as EventParticipantRow));
}
