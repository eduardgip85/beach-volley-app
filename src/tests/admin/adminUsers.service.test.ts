import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    deleteEvent,
    getAllUsers,
} from "../../features/admin/services/adminUsers.service";

const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();

vi.mock("../../config/supabase", () => ({
    supabase: {
        from: vi.fn((table: string) => {
        if (table === "profiles") {
            return {
            select: mockSelect,
            };
        }

        return {
            delete: mockDelete,
        };
        }),
    },
}));

describe("adminUsers.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockSelect.mockReturnValue({
        order: mockOrder,
        });

        mockDelete.mockReturnValue({
        eq: mockEq,
        });
    });

    describe("getAllUsers", () => {
        it("should return all users ordered by created_at desc", async () => {
            const users = [
                {
                id: "user-1",
                email: "test@test.com",
                full_name: "Test User",
                role: "player",
                created_at: "2026-05-01",
                },
            ];

            mockOrder.mockResolvedValue({
                data: users,
                error: null,
            });

            const result = await getAllUsers();

            expect(result).toEqual(users);
            expect(mockSelect).toHaveBeenCalledWith("*");
            expect(mockOrder).toHaveBeenCalledWith("created_at", {
                ascending: false,
            });
        });

        it("should throw when users query fails", async () => {
            mockOrder.mockResolvedValue({
                data: null,
                error: new Error("Users failed"),
            });

            await expect(getAllUsers()).rejects.toThrow("Users failed");
        });
    });

    describe("deleteEvent", () => {
        it("should delete an event by id", async () => {
            mockEq.mockResolvedValue({
                error: null,
            });

            await deleteEvent("event-1");

            expect(mockDelete).toHaveBeenCalled();
            expect(mockEq).toHaveBeenCalledWith("id", "event-1");
        });

        it("should throw when delete fails", async () => {
            mockEq.mockResolvedValue({
                error: new Error("Delete failed"),
            });

            await expect(deleteEvent("event-1")).rejects.toThrow("Delete failed");
        });
    });
});