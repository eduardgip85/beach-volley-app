export type EventType = "match" | "open_play" | "tournament";

export type EventVisibility = "public" | "private";

export type EventMode = "casual" | "competitive";

export type EventStatus = "active" | "cancelled" | "completed";

export interface Event {
    id: string;
    title: string;
    description: string | null;
    type: EventType;
    visibility: EventVisibility;
    mode: EventMode | null;
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
    visibility: EventVisibility;
    mode: EventMode | null;
    locationName: string;
    latitude: number;
    longitude: number;
    imageUrl?: string | null;
    startDate: string;
    endDate?: string | null;
    maxParticipants: number;
}
