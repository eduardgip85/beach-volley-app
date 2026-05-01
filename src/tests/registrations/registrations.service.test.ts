import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  getEventRegistrationsCount,
  isUserRegistered,
  registerToEvent,
} from "../../features/registrations/services/registrations.service";

const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockMaybeSingle = vi.fn();
const mockInsert = vi.fn();
const mockSingle = vi.fn();
const mockDelete = vi.fn();

vi.mock("../../config/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
      insert: mockInsert,
      delete: mockDelete,
    })),
  },
}));

describe("registrations.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mockSelect.mockReturnValue({
        eq: mockEq,
        });

        mockEq.mockReturnValue({
        eq: mockEq,
        maybeSingle: mockMaybeSingle,
        });

        mockInsert.mockReturnValue({
        select: mockSelect,
        });

        mockDelete.mockReturnValue({
        eq: mockEq,
        });
    }); 

    describe("getEventRegistrationsCount", () => {
        it("should return the registrations count for an event", async () => {
            mockEq.mockResolvedValue({
                count: 3,
                error: null,
            });

            const result = await getEventRegistrationsCount("event-1");

            expect(result).toBe(3);
            expect(mockSelect).toHaveBeenCalledWith("*", {
                count: "exact",
                head: true,
            });
            expect(mockEq).toHaveBeenCalledWith("event_id", "event-1");
        });

        it("should return 0 when count is null", async () => {
            mockEq.mockResolvedValue({
                count: null,
                error: null,
            });

            const result = await getEventRegistrationsCount("event-1");

            expect(result).toBe(0);
        });
    });

    describe("isUserRegistered", () => {
        it("should return true when user is registered", async () => {
            mockMaybeSingle.mockResolvedValue({
                data: { id: "registration-1" },
                error: null,
            });

            const result = await isUserRegistered("event-1", "user-1");

            expect(result).toBe(true);
            expect(mockSelect).toHaveBeenCalledWith("id");
            expect(mockEq).toHaveBeenCalledWith("event_id", "event-1");
            expect(mockEq).toHaveBeenCalledWith("user_id", "user-1");
        });

        it("should return false when user is not registered", async () => {
            mockMaybeSingle.mockResolvedValue({
                data: null,
                error: null,
            });

            const result = await isUserRegistered("event-1", "user-1");

            expect(result).toBe(false);
        });

        it("should throw when registration check fails", async () => {
            mockMaybeSingle.mockResolvedValue({
                data: null,
                error: new Error("Check failed"),
            });

            await expect(isUserRegistered("event-1", "user-1")).rejects.toThrow(
                "Check failed"
            );
        });
    });

    describe("registerToEvent", () => {
        it("should create a registration", async () => {
            const registration = {
                id: "registration-1",
                event_id: "event-1",
                user_id: "user-1",
            };

            mockSingle.mockResolvedValue({
                data: registration,
                error: null,
            });

            mockSelect.mockReturnValue({
                single: mockSingle,
            });

            const result = await registerToEvent("event-1", "user-1");

            expect(result).toEqual(registration);
            expect(mockInsert).toHaveBeenCalledWith({
                event_id: "event-1",
                user_id: "user-1",
            });
        });

        it("should throw when registration fails", async () => {
            mockSingle.mockResolvedValue({
                data: null,
                error: new Error("Register failed"),
            });

            mockSelect.mockReturnValue({
                single: mockSingle,
            });

            await expect(registerToEvent("event-1", "user-1")).rejects.toThrow(
                "Register failed"
            );
        });
    });

});