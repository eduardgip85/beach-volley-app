import { supabase } from "../../../config/supabase";

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
  const { error } = await supabase
    .from("registrations")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", userId);

  if (error) throw error;
}