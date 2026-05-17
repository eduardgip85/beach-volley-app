import { supabase } from "../../../config/supabase";

interface EventParticipationRow {
  id: string;
  start_date: string;
  status: string;
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
