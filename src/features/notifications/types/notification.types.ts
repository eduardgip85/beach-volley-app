export type NotificationCategory =
    | "friends"
    | "events"
    | "results"
    | "tournaments"
    | "product";

export interface AppNotification {
    id: string;
    recipientId: string;
    actorId: string | null;
    category: NotificationCategory;
    type: string;
    titleKey: string;
    bodyKey: string;
    data: Record<string, string>;
    deepLink: string | null;
    readAt: string | null;
    createdAt: string;
}

export interface NotificationPreferences {
    inAppEnabled: boolean;
    pushEnabled: boolean;
    friendsEnabled: boolean;
    eventsEnabled: boolean;
    resultsEnabled: boolean;
    tournamentsEnabled: boolean;
    productEnabled: boolean;
}
