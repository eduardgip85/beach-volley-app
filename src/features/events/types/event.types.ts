export type EventType = "match" | "tournament";

export type EventStatus = "active" | "cancelled" | "completed";

export interface Event {
    id: string;
    title: string;
    description: string | null;
    type: EventType;
    locationName: string;
    latitude: number;
    longitude: number;
    startDate: string;
    endDate: string | null;
    maxParticipants: number;
    status: EventStatus;
    imageUrl?: string | null;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreateEventPayload {
    title: string;
    description: string;
    type: EventType;
    locationName: string;
    latitude: number;
    longitude: number;
    imageUrl?: string | null;
    startDate: string;
    endDate?: string | null;
    maxParticipants: number;
}