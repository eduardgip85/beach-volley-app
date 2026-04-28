import { supabase } from "../../../config/supabase";
import type { CreateEventPayload, Event } from "../types/event.types";

function mapEvent(row: any): Event {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        type: row.type,
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

export async function getEvents(): Promise<Event[]> {
    const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("start_date", { ascending: true });

    if (error) throw error;

    return data.map(mapEvent);
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

export async function createEvent(
    payload: CreateEventPayload,
    userId: string
): Promise<Event> {
    const { data, error } = await supabase
        .from("events")
        .insert({
        title: payload.title,
        description: payload.description,
        type: payload.type,
        location_name: payload.locationName,
        latitude: payload.latitude,
        longitude: payload.longitude,
        image_url: payload.imageUrl ?? null,
        start_date: payload.startDate,
        end_date: payload.endDate ?? null,
        max_participants: payload.maxParticipants,
        created_by: userId,
        status: "active",
        })
        .select()
        .single();

    if (error) throw error;

    return mapEvent(data);
}