import { useEffect, useState } from "react";
import { supabase } from "../../../config/supabase";
import {
    getEventChatMessages,
    sendEventChatMessage,
} from "../services/eventChat.service";
import type { EventChatMessage } from "../types/eventChat.types";

interface UseEventChatOptions {
    canAccess: boolean;
    canSend: boolean;
    currentUserId?: string;
}

function mergeEventChatMessages(messages: EventChatMessage[]) {
    const uniqueMessages = new Map<string, EventChatMessage>();

    for (const message of messages) {
        uniqueMessages.set(message.id, message);
    }

    return Array.from(uniqueMessages.values()).sort((left, right) =>
        left.createdAt.localeCompare(right.createdAt)
    );
}

export function useEventChat(
    eventId?: string,
    options: UseEventChatOptions = {
        canAccess: false,
        canSend: false,
    }
) {
    const { canAccess, canSend, currentUserId } = options;

    const [messages, setMessages] = useState<EventChatMessage[]>([]);
    const [loading, setLoading] = useState(Boolean(eventId && canAccess));
    const [sending, setSending] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!eventId || !canAccess) {
            setMessages([]);
            setLoading(false);
            setError("");
            return;
        }

        const currentEventId = eventId;
        let isActive = true;

        async function refreshMessages() {
            try {
                if (isActive) {
                    setError("");
                }

                const data = await getEventChatMessages(currentEventId);

                if (isActive) {
                    setMessages((currentMessages) =>
                        currentMessages.length === 0
                            ? data
                            : mergeEventChatMessages([...currentMessages, ...data])
                    );
                }
            } catch (err) {
                console.error(err);

                if (isActive) {
                    setError("Could not load event chat");
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        }

        void refreshMessages();

        const channel = supabase
            .channel(`event-chat:${currentEventId}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "event_chat_messages",
                    filter: `event_id=eq.${currentEventId}`,
                },
                () => {
                    void refreshMessages();
                }
            )
            .subscribe();

        return () => {
            isActive = false;
            void supabase.removeChannel(channel);
        };
    }, [canAccess, eventId]);

    async function submitMessage(body: string) {
        if (!eventId || !currentUserId || !canAccess || !canSend) {
            return;
        }

        try {
            setSending(true);
            setError("");
            const message = await sendEventChatMessage(eventId, currentUserId, body);
            setMessages((currentMessages) =>
                mergeEventChatMessages([...currentMessages, message])
            );
        } catch (err) {
            console.error(err);
            setError(
                err instanceof Error && err.message
                    ? err.message
                    : "Could not send the message"
            );
            throw err;
        } finally {
            setSending(false);
        }
    }

    return {
        state: {
            messages,
            loading,
            sending,
            error,
            canAccess,
            canSend,
        },
        actions: {
            sendMessage: submitMessage,
        },
    };
}
