import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    getNotificationPreferences,
    getNotifications,
    getUnreadNotificationCount,
    markAllNotificationsRead,
    markNotificationRead,
    saveNotificationPreferences,
} from "../../features/notifications/services/notifications.service";

const mocks = vi.hoisted(() => ({
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    limit: vi.fn(),
    is: vi.fn(),
    maybeSingle: vi.fn(),
    update: vi.fn(),
    upsert: vi.fn(),
}));

vi.mock("../../config/supabase", () => ({
    supabase: {
        from: vi.fn(() => ({
            select: mocks.select,
            update: mocks.update,
            upsert: mocks.upsert,
        })),
    },
}));

describe("notifications.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.select.mockReturnValue({ eq: mocks.eq });
        mocks.eq.mockReturnValue({
            order: mocks.order,
            is: mocks.is,
            maybeSingle: mocks.maybeSingle,
        });
        mocks.order.mockReturnValue({ limit: mocks.limit });
        mocks.update.mockReturnValue({ eq: mocks.eq });
        mocks.upsert.mockResolvedValue({ error: null });
    });

    it("maps notifications from Supabase", async () => {
        mocks.limit.mockResolvedValue({
            data: [
                {
                    id: "notification-1",
                    recipient_id: "user-1",
                    actor_id: "user-2",
                    category: "friends",
                    type: "friend_request_received",
                    title_key: "notifications.items.friendRequestReceivedTitle",
                    body_key: "notifications.items.friendRequestReceivedBody",
                    data: { actorName: "Alex" },
                    deep_link: "/friends",
                    read_at: null,
                    created_at: "2026-06-08T10:00:00.000Z",
                },
            ],
            error: null,
        });

        const result = await getNotifications("user-1");

        expect(result[0]).toMatchObject({
            recipientId: "user-1",
            actorId: "user-2",
            deepLink: "/friends",
            data: { actorName: "Alex" },
        });
    });

    it("returns the unread count", async () => {
        mocks.is.mockResolvedValue({ count: 4, error: null });

        await expect(getUnreadNotificationCount("user-1")).resolves.toBe(4);
        expect(mocks.is).toHaveBeenCalledWith("read_at", null);
    });

    it("marks one or all notifications as read", async () => {
        mocks.eq.mockResolvedValueOnce({ error: null });
        await markNotificationRead("notification-1");

        mocks.eq.mockReturnValueOnce({ is: mocks.is });
        mocks.is.mockResolvedValueOnce({ error: null });
        await markAllNotificationsRead("user-1");

        expect(mocks.update).toHaveBeenCalledTimes(2);
    });

    it("uses defaults when preferences do not exist and saves changes", async () => {
        mocks.maybeSingle.mockResolvedValue({ data: null, error: null });

        const preferences = await getNotificationPreferences("user-1");
        expect(preferences.eventsEnabled).toBe(true);
        expect(preferences.pushEnabled).toBe(false);

        await saveNotificationPreferences("user-1", {
            ...preferences,
            productEnabled: false,
        });

        expect(mocks.upsert).toHaveBeenCalledWith(
            expect.objectContaining({
                user_id: "user-1",
                product_enabled: false,
            })
        );
    });
});
