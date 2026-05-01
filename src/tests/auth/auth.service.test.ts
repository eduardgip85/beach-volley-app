import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    getCurrentProfile,
    loginUser,
    logoutUser,
    registerUser,
} from "../../features/auth/services/auth.service";

const mocks = vi.hoisted(() => ({
    mockSignUp: vi.fn(),
    mockSignInWithPassword: vi.fn(),
    mockSignOut: vi.fn(),
    mockGetUser: vi.fn(),
    mockInsert: vi.fn(),
    mockSelect: vi.fn(),
    mockEq: vi.fn(),
    mockSingle: vi.fn(),
}));

vi.mock("../../config/supabase", () => ({
    supabase: {
        auth: {
        signUp: mocks.mockSignUp,
        signInWithPassword: mocks.mockSignInWithPassword,
        signOut: mocks.mockSignOut,
        getUser: mocks.mockGetUser,
        },
        from: vi.fn(() => ({
        insert: mocks.mockInsert,
        select: mocks.mockSelect,
        })),
    },
}));

const profileRow = {
    id: "user-1",
    email: "test@test.com",
    full_name: "Test User",
    role: "admin",
    avatar_url: null,
    created_at: "2026-05-01T10:00:00.000Z",
};

describe("auth.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();

        mocks.mockSelect.mockReturnValue({
        eq: mocks.mockEq,
        });

        mocks.mockEq.mockReturnValue({
        single: mocks.mockSingle,
        });
    });

    describe("registerUser", () => {
        it("should register a user and create a player profile", async () => {
            const authData = {
                user: {
                id: "user-1",
                },
            };

            mocks.mockSignUp.mockResolvedValue({
                data: authData,
                error: null,
            });

            mocks.mockInsert.mockResolvedValue({
                error: null,
            });

            const result = await registerUser({
                email: "test@test.com",
                password: "password123",
                fullName: "Test User",
            });

            expect(result).toEqual(authData);

            expect(mocks.mockSignUp).toHaveBeenCalledWith({
                email: "test@test.com",
                password: "password123",
            });

            expect(mocks.mockInsert).toHaveBeenCalledWith({
                id: "user-1",
                full_name: "Test User",
                email: "test@test.com",
                role: "player",
            });
        });

        it("should throw when Supabase signUp fails", async () => {
            mocks.mockSignUp.mockResolvedValue({
                data: null,
                error: new Error("Register failed"),
            });

            await expect(
                registerUser({
                email: "test@test.com",
                password: "password123",
                fullName: "Test User",
                })
            ).rejects.toThrow("Register failed");
        });

        it("should throw when user id is missing", async () => {
            mocks.mockSignUp.mockResolvedValue({
                data: {
                user: null,
                },
                error: null,
            });

            await expect(
                registerUser({
                email: "test@test.com",
                password: "password123",
                fullName: "Test User",
                })
            ).rejects.toThrow("User could not be created");
        });

    });

    describe("loginUser", () => {
        it("should login a user", async () => {
            const authData = {
                session: {
                access_token: "token",
                },
                user: {
                id: "user-1",
                },
            };

            mocks.mockSignInWithPassword.mockResolvedValue({
                data: authData,
                error: null,
            });

            const result = await loginUser("test@test.com", "password123");

            expect(result).toEqual(authData);
            expect(mocks.mockSignInWithPassword).toHaveBeenCalledWith({
                email: "test@test.com",
                password: "password123",
            });
        });

        it("should throw when login fails", async () => {
            mocks.mockSignInWithPassword.mockResolvedValue({
                data: null,
                error: new Error("Login failed"),
            });

            await expect(loginUser("test@test.com", "wrong")).rejects.toThrow(
                "Login failed"
            );
        });
    });

    describe("logoutUser", () => {
        it("should logout a user", async () => {
            mocks.mockSignOut.mockResolvedValue({
                error: null,
            });

            await logoutUser();

            expect(mocks.mockSignOut).toHaveBeenCalled();
        });

        it("should throw when logout fails", async () => {
            mocks.mockSignOut.mockResolvedValue({
                error: new Error("Logout failed"),
            });

            await expect(logoutUser()).rejects.toThrow("Logout failed");
        });
    });

    describe("getCurrentProfile", () => {
        it("should return null when there is no authenticated user", async () => {
            mocks.mockGetUser.mockResolvedValue({
                data: {
                user: null,
                },
            });

            const result = await getCurrentProfile();

            expect(result).toBeNull();
        });

        it("should return the mapped current profile", async () => {
            mocks.mockGetUser.mockResolvedValue({
                data: {
                user: {
                    id: "user-1",
                },
                },
            });

            mocks.mockSingle.mockResolvedValue({
                data: profileRow,
                error: null,
            });

            const result = await getCurrentProfile();

            expect(result).toEqual({
                id: "user-1",
                email: "test@test.com",
                fullName: "Test User",
                role: "admin",
                avatarUrl: null,
                createdAt: "2026-05-01T10:00:00.000Z",
            });

            expect(mocks.mockSelect).toHaveBeenCalledWith("*");
            expect(mocks.mockEq).toHaveBeenCalledWith("id", "user-1");
        });

    });
});