import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    getCurrentProfile,
    loginUser,
    loginWithGoogle,
    logoutUser,
    registerUser,
} from "../../features/auth/services/auth.service";

const mocks = vi.hoisted(() => ({
    mockSignUp: vi.fn(),
    mockSignInWithPassword: vi.fn(),
    mockSignInWithOAuth: vi.fn(),
    mockResetPasswordForEmail: vi.fn(),
    mockUpdateUser: vi.fn(),
    mockSignOut: vi.fn(),
    mockGetSession: vi.fn(),
    mockInsert: vi.fn(),
    mockInsertSelect: vi.fn(),
    mockSelect: vi.fn(),
    mockEq: vi.fn(),
    mockSingle: vi.fn(),
    mockMaybeSingle: vi.fn(),
}));

const mobileMocks = vi.hoisted(() => ({
    mockIsNativePlatform: vi.fn(),
    mockOpenNativeBrowser: vi.fn(),
}));

vi.mock("../../config/supabase", () => ({
    supabase: {
        auth: {
        signUp: mocks.mockSignUp,
        signInWithPassword: mocks.mockSignInWithPassword,
        signInWithOAuth: mocks.mockSignInWithOAuth,
        resetPasswordForEmail: mocks.mockResetPasswordForEmail,
        updateUser: mocks.mockUpdateUser,
        signOut: mocks.mockSignOut,
        getSession: mocks.mockGetSession,
        },
        from: vi.fn(() => ({
        insert: mocks.mockInsert,
        select: mocks.mockSelect,
        })),
    },
}));

vi.mock("../../shared/mobile/capacitor", () => ({
    isNativePlatform: mobileMocks.mockIsNativePlatform,
    nativeAppScheme: "app.sandset.mobile",
}));

vi.mock("../../shared/mobile/browser", () => ({
    openNativeBrowser: mobileMocks.mockOpenNativeBrowser,
}));

const profileRow = {
    id: "user-1",
    email: "test@test.com",
    full_name: "Test User",
    username: "test-user",
    role: "admin",
    avatar_url: null,
    created_at: "2026-05-01T10:00:00.000Z",
    has_ball: false,
    has_net: false,
    equipment_verified: false,
    equipment_verified_at: null,
    competitive_rating: 2,
    rating_games_played: 0,
    matches_played: 0,
    wins: 0,
    losses: 0,
    country: "Spain",
    city: "Barcelona",
    current_streak: 2,
    best_streak: 4,
    availability_status: "available",
    profile_visibility: "public",
    show_rating: true,
    show_stats: true,
    preferred_language: "en",
    preferred_match_mode: "competitive",
    preferred_hand: null,
    preferred_court_side: null,
    preferred_play_days: [],
};

describe("auth.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        window.localStorage.setItem("beach-volley-app-language", "en");
        mobileMocks.mockIsNativePlatform.mockReturnValue(false);

        mocks.mockSelect.mockReturnValue({
        eq: mocks.mockEq,
        });

        mocks.mockEq.mockReturnValue({
        single: mocks.mockSingle,
        maybeSingle: mocks.mockMaybeSingle,
        });

        mocks.mockInsertSelect.mockReturnValue({
            single: mocks.mockSingle,
        });
    });

    describe("registerUser", () => {
        it("should register a user and return immediate access when a session exists", async () => {
            const authData = {
                user: {
                    id: "user-1",
                },
                session: {
                    access_token: "token",
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

            expect(result).toEqual({
                requiresEmailVerification: false,
            });

            expect(mocks.mockSignUp).toHaveBeenCalledWith({
                email: "test@test.com",
                password: "password123",
                options: {
                    data: {
                        full_name: "Test User",
                    },
                    emailRedirectTo:
                        "http://localhost:3000/auth/callback?redirect=%2Fprofile",
                },
            });
            expect(mocks.mockInsert).not.toHaveBeenCalled();
        });

        it("should not create a profile immediately when email verification is required", async () => {
            mocks.mockSignUp.mockResolvedValue({
                data: {
                    user: {
                        id: "user-2",
                    },
                    session: null,
                },
                error: null,
            });

            const result = await registerUser({
                email: "verify@test.com",
                password: "password123",
                fullName: "Verify User",
            });

            expect(result).toEqual({
                requiresEmailVerification: true,
            });
            expect(mocks.mockInsert).not.toHaveBeenCalled();
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

    describe("loginWithGoogle", () => {
        it("should start Google OAuth with the callback redirect", async () => {
            vi.stubGlobal("window", {
                location: {
                    origin: "http://localhost:5173",
                },
            });

            mocks.mockSignInWithOAuth.mockResolvedValue({
                data: {
                    provider: "google",
                    url: "https://accounts.google.com/o/oauth2/auth",
                },
                error: null,
            });

            const result = await loginWithGoogle("/profile");

            expect(mocks.mockSignInWithOAuth).toHaveBeenCalledWith({
                provider: "google",
                options: {
                    redirectTo:
                        "http://localhost:5173/auth/callback?redirect=%2Fprofile",
                },
            });
            expect(result).toEqual({
                provider: "google",
                url: "https://accounts.google.com/o/oauth2/auth",
            });

            vi.unstubAllGlobals();
        });

        it("should start Google OAuth in the native browser on mobile", async () => {
            mobileMocks.mockIsNativePlatform.mockReturnValue(true);
            mocks.mockSignInWithOAuth.mockResolvedValue({
                data: {
                    provider: "google",
                    url: "https://accounts.google.com/o/oauth2/auth",
                },
                error: null,
            });

            const result = await loginWithGoogle("/profile");

            expect(mocks.mockSignInWithOAuth).toHaveBeenCalledWith({
                provider: "google",
                options: {
                    redirectTo:
                        "app.sandset.mobile://auth/callback?redirect=%2Fprofile",
                    skipBrowserRedirect: true,
                },
            });
            expect(mobileMocks.mockOpenNativeBrowser).toHaveBeenCalledWith(
                "https://accounts.google.com/o/oauth2/auth"
            );
            expect(result).toEqual({
                provider: "google",
                url: "https://accounts.google.com/o/oauth2/auth",
            });
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
            mocks.mockGetSession.mockResolvedValue({
                data: {
                session: null,
                },
                error: null,
            });

            const result = await getCurrentProfile();

            expect(result).toBeNull();
        });

        it("should return the mapped current profile", async () => {
            mocks.mockGetSession.mockResolvedValue({
                data: {
                session: {
                    user: {
                        id: "user-1",
                    },
                },
                },
                error: null,
            });

            mocks.mockMaybeSingle.mockResolvedValue({
                data: profileRow,
                error: null,
            });

            const result = await getCurrentProfile();

            expect(result).toEqual({
                id: "user-1",
                email: "test@test.com",
                fullName: "Test User",
                username: "test-user",
                role: "admin",
                avatarUrl: null,
                createdAt: "2026-05-01T10:00:00.000Z",
                hasBall: false,
                hasNet: false,
                equipmentVerified: false,
                equipmentVerifiedAt: null,
                competitiveRating: 2,
                ratingGamesPlayed: 0,
                matchesPlayed: 0,
                wins: 0,
                losses: 0,
                country: "Spain",
                city: "Barcelona",
                currentStreak: 2,
                bestStreak: 4,
                availabilityStatus: "available",
                profileVisibility: "public",
                showRating: true,
                showStats: true,
                preferredLanguage: "en",
                preferredMatchMode: "competitive",
                preferredHand: null,
                preferredCourtSide: null,
                preferredPlayDays: [],
                ratingPlacementCompletedAt: null,
                ratingPlacementEstimate: null,
                ratingPlacementScore: null,
                provisionalRatingMatchesRemaining: 0,
            });

            expect(mocks.mockSelect).toHaveBeenCalledWith("*");
            expect(mocks.mockEq).toHaveBeenCalledWith("id", "user-1");
        });

        it("should create a profile when an OAuth user is missing one", async () => {
            mocks.mockGetSession.mockResolvedValue({
                data: {
                    session: {
                        user: {
                            id: "user-2",
                            email: "google@test.com",
                            user_metadata: {
                                full_name: "Google User",
                                avatar_url: "https://example.com/avatar.png",
                            },
                        },
                    },
                },
                error: null,
            });

            mocks.mockMaybeSingle.mockResolvedValue({
                data: null,
                error: null,
            });

            mocks.mockInsert.mockReturnValue({
                select: mocks.mockInsertSelect,
            });

            mocks.mockSingle.mockResolvedValue({
                data: {
                    ...profileRow,
                    id: "user-2",
                    email: "google@test.com",
                    full_name: "Google User",
                    avatar_url: "https://example.com/avatar.png",
                    role: "player",
                },
                error: null,
            });

            const result = await getCurrentProfile();

            expect(mocks.mockInsert).toHaveBeenCalledWith({
                id: "user-2",
                full_name: "Google User",
                email: "google@test.com",
                role: "player",
                avatar_url: "https://example.com/avatar.png",
                competitive_rating: 2,
                preferred_language: "en",
            });
            expect(result?.fullName).toBe("Google User");
            expect(result?.role).toBe("player");
        });

        it("should recover the existing profile when creation hits a duplicate conflict", async () => {
            mocks.mockGetSession.mockResolvedValue({
                data: {
                    session: {
                        user: {
                            id: "user-3",
                            email: "duplicate@test.com",
                            user_metadata: {
                                full_name: "Duplicate User",
                            },
                        },
                    },
                },
                error: null,
            });

            mocks.mockMaybeSingle.mockResolvedValueOnce({
                data: null,
                error: null,
            });

            mocks.mockInsert.mockReturnValue({
                select: mocks.mockInsertSelect,
            });

            mocks.mockSingle
                .mockResolvedValueOnce({
                    data: null,
                    error: {
                        code: "23505",
                        message: "duplicate key value violates unique constraint",
                    },
                })
                .mockResolvedValueOnce({
                    data: {
                        ...profileRow,
                        id: "user-3",
                        email: "duplicate@test.com",
                        full_name: "Duplicate User",
                    },
                    error: null,
                });

            const result = await getCurrentProfile();

            expect(result?.id).toBe("user-3");
            expect(result?.email).toBe("duplicate@test.com");
        });

    });
});
