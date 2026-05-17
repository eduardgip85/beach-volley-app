import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    changePassword,
    deleteCurrentAccount,
    logoutAllSessions,
    updateProfileSettings,
} from "../../features/settings/services/settings.service";

const mocks = vi.hoisted(() => ({
    mockUpdate: vi.fn(),
    mockEq: vi.fn(),
    mockUpdateUser: vi.fn(),
    mockSignOut: vi.fn(),
    mockInvoke: vi.fn(),
}));

vi.mock("../../config/supabase", () => ({
    supabase: {
        auth: {
            updateUser: mocks.mockUpdateUser,
            signOut: mocks.mockSignOut,
        },
        functions: {
            invoke: mocks.mockInvoke,
        },
        from: vi.fn(() => ({
            update: mocks.mockUpdate,
        })),
    },
}));

describe("settings.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.mockUpdate.mockReturnValue({
            eq: mocks.mockEq,
        });
        mocks.mockEq.mockResolvedValue({
            error: null,
        });
        mocks.mockUpdateUser.mockResolvedValue({
            error: null,
        });
        mocks.mockSignOut.mockResolvedValue({
            error: null,
        });
        mocks.mockInvoke.mockResolvedValue({
            data: { ok: true },
            error: null,
        });
    });

    it("updates mapped profile settings fields", async () => {
        await updateProfileSettings({
            userId: "user-1",
            fullName: "Edu",
            username: "ed1",
            avatarUrl: "https://example.com/avatar.png",
        });

        expect(mocks.mockUpdate).toHaveBeenCalledWith({
            full_name: "Edu",
            username: "ed1",
            avatar_url: "https://example.com/avatar.png",
        });
        expect(mocks.mockEq).toHaveBeenCalledWith("id", "user-1");
    });

    it("changes password through Supabase auth", async () => {
        await changePassword("password123");

        expect(mocks.mockUpdateUser).toHaveBeenCalledWith({
            password: "password123",
        });
    });

    it("logs out every session through global sign out", async () => {
        await logoutAllSessions();

        expect(mocks.mockSignOut).toHaveBeenCalledWith({
            scope: "global",
        });
    });

    it("invokes delete-account and signs out locally afterwards", async () => {
        await deleteCurrentAccount();

        expect(mocks.mockInvoke).toHaveBeenCalledWith("delete-account", {
            body: {},
        });
        expect(mocks.mockSignOut).toHaveBeenCalledWith({
            scope: "local",
        });
    });
});
