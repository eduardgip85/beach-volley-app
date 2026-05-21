export interface EventChatSender {
    id: string;
    fullName: string;
    avatarUrl: string | null;
}

export interface EventChatMessage {
    id: string;
    eventId: string;
    senderId: string;
    body: string;
    createdAt: string;
    sender: EventChatSender;
}
