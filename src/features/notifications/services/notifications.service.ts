import { supabase } from "../../../config/supabase";
import type {
    AppNotification,
    NotificationPreferences,
} from "../types/notification.types";

export const NOTIFICATIONS_UPDATED_EVENT = "notifications:updated";

interface NotificationRow {
    id: string;
    recipient_id: string;
    actor_id: string | null;
    category: AppNotification["category"];
    type: string;
    title_key: string;
    body_key: string;
    data: Record<string, string> | null;
    deep_link: string | null;
    read_at: string | null;
    created_at: string;
}

interface NotificationPreferencesRow {
    in_app_enabled: boolean;
    push_enabled: boolean;
    friends_enabled: boolean;
    events_enabled: boolean;
    results_enabled: boolean;
    tournaments_enabled: boolean;
    product_enabled: boolean;
}

const defaultPreferences: NotificationPreferences = {
    inAppEnabled: true,
    pushEnabled: false,
    friendsEnabled: true,
    eventsEnabled: true,
    resultsEnabled: true,
    tournamentsEnabled: true,
    productEnabled: true,
};

function notifyUpdated() {
    window.dispatchEvent(new Event(NOTIFICATIONS_UPDATED_EVENT));
}

function mapNotification(row: NotificationRow): AppNotification {
    return {
        id: row.id,
        recipientId: row.recipient_id,
        actorId: row.actor_id,
        category: row.category,
        type: row.type,
        titleKey: row.title_key,
        bodyKey: row.body_key,
        data: row.data ?? {},
        deepLink: row.deep_link,
        readAt: row.read_at,
        createdAt: row.created_at,
    };
}

function mapPreferences(row: NotificationPreferencesRow): NotificationPreferences {
    return {
        inAppEnabled: row.in_app_enabled,
        pushEnabled: row.push_enabled,
        friendsEnabled: row.friends_enabled,
        eventsEnabled: row.events_enabled,
        resultsEnabled: row.results_enabled,
        tournamentsEnabled: row.tournaments_enabled,
        productEnabled: row.product_enabled,
    };
}

export async function getNotifications(userId: string) {
    const { data, error } = await supabase
        .from("notifications")
        .select("id, recipient_id, actor_id, category, type, title_key, body_key, data, deep_link, read_at, created_at")
        .eq("recipient_id", userId)
        .order("created_at", { ascending: false })
        .limit(100);

    if (error) throw error;
    return data.map((row) => mapNotification(row as NotificationRow));
}

export async function getUnreadNotificationCount(userId: string) {
    const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("recipient_id", userId)
        .is("read_at", null);

    if (error) throw error;
    return count ?? 0;
}

export async function markNotificationRead(notificationId: string) {
    const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("id", notificationId);

    if (error) throw error;
    notifyUpdated();
}

export async function markAllNotificationsRead(userId: string) {
    const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .eq("recipient_id", userId)
        .is("read_at", null);

    if (error) throw error;
    notifyUpdated();
}

export async function getNotificationPreferences(userId: string) {
    const { data, error } = await supabase
        .from("notification_preferences")
        .select("in_app_enabled, push_enabled, friends_enabled, events_enabled, results_enabled, tournaments_enabled, product_enabled")
        .eq("user_id", userId)
        .maybeSingle();

    if (error) throw error;
    return data ? mapPreferences(data as NotificationPreferencesRow) : defaultPreferences;
}

export async function saveNotificationPreferences(
    userId: string,
    preferences: NotificationPreferences
) {
    const { error } = await supabase.from("notification_preferences").upsert({
        user_id: userId,
        in_app_enabled: preferences.inAppEnabled,
        push_enabled: preferences.pushEnabled,
        friends_enabled: preferences.friendsEnabled,
        events_enabled: preferences.eventsEnabled,
        results_enabled: preferences.resultsEnabled,
        tournaments_enabled: preferences.tournamentsEnabled,
        product_enabled: preferences.productEnabled,
        updated_at: new Date().toISOString(),
    });

    if (error) throw error;
}
