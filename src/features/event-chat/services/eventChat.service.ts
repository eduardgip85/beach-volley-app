import { supabase } from "../../../config/supabase";
import type { EventChatMessage, EventChatSender } from "../types/eventChat.types";

interface EventChatSenderRow {
    id: string;
    full_name: string;
    avatar_url: string | null;
}

interface EventChatMessageRow {
    id: string;
    event_id: string;
    sender_id: string;
    body: string;
    created_at: string;
    sender: EventChatSenderRow[] | EventChatSenderRow;
}

const eventChatMessageSelect = `
    id,
    event_id,
    sender_id,
    body,
    created_at,
    sender:profiles!event_chat_messages_sender_id_fkey(id, full_name, avatar_url)
`;

function normalizeRelation<T>(relation: T[] | T): T {
    return Array.isArray(relation) ? relation[0] : relation;
}

function mapSender(row: EventChatSenderRow): EventChatSender {
    return {
        id: row.id,
        fullName: row.full_name,
        avatarUrl: row.avatar_url,
    };
}

function mapEventChatMessage(row: EventChatMessageRow): EventChatMessage {
    return {
        id: row.id,
        eventId: row.event_id,
        senderId: row.sender_id,
        body: row.body,
        createdAt: row.created_at,
        sender: mapSender(normalizeRelation(row.sender)),
    };
}

export async function getEventChatMessages(
    eventId: string
): Promise<EventChatMessage[]> {
    const { data, error } = await supabase
        .from("event_chat_messages")
        .select(eventChatMessageSelect)
        .eq("event_id", eventId)
        .order("created_at", { ascending: true })
        .limit(100);

    if (error) throw error;

    return (data ?? []).map((row) =>
        mapEventChatMessage(row as EventChatMessageRow)
    );
}

export async function sendEventChatMessage(
    eventId: string,
    senderId: string,
    body: string
): Promise<EventChatMessage> {
    const trimmedBody = body.trim();

    if (!trimmedBody) {
        throw new Error("Message cannot be empty");
    }

    const { data, error } = await supabase
        .from("event_chat_messages")
        .insert({
            event_id: eventId,
            sender_id: senderId,
            body: trimmedBody,
        })
        .select(eventChatMessageSelect)
        .single();

    if (error) throw error;

    return mapEventChatMessage(data as EventChatMessageRow);
}
