import { beforeEach, describe, expect, it, vi } from "vitest";
import {
    getAuthDeepLinkTarget,
    getInternalPathFromDeepLink,
    restoreSessionFromDeepLink,
} from "../../features/auth/services/authDeepLink.service";

const mocks = vi.hoisted(() => ({
    mockExchangeCodeForSession: vi.fn(),
    mockSetSession: vi.fn(),
}));

vi.mock("../../config/supabase", () => ({
    supabase: {
        auth: {
            exchangeCodeForSession: mocks.mockExchangeCodeForSession,
            setSession: mocks.mockSetSession,
        },
    },
}));

describe("authDeepLink.service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("derives the internal path from a native auth callback URL", () => {
        const url = new URL(
            "app.sandset.mobile://auth/callback?redirect=%2Fprofile"
        );

        expect(getInternalPathFromDeepLink(url)).toBe("/auth/callback");
    });

    it("extracts the redirect target from a native reset-password URL", () => {
        const target = getAuthDeepLinkTarget(
            "app.sandset.mobile://reset-password"
        );

        expect(target.internalPath).toBe("/reset-password");
        expect(target.redirectTo).toBe("/events");
    });

    it("exchanges an auth code for a session", async () => {
        const session = { access_token: "session-token" };

        mocks.mockExchangeCodeForSession.mockResolvedValue({
            data: { session },
            error: null,
        });

        const result = await restoreSessionFromDeepLink(
            "app.sandset.mobile://auth/callback?redirect=%2Fprofile&code=oauth-code"
        );

        expect(mocks.mockExchangeCodeForSession).toHaveBeenCalledWith(
            "oauth-code"
        );
        expect(result).toBe(session);
    });

    it("restores a session from access and refresh tokens in the hash", async () => {
        const session = { access_token: "access-token" };

        mocks.mockSetSession.mockResolvedValue({
            data: { session },
            error: null,
        });

        const result = await restoreSessionFromDeepLink(
            "app.sandset.mobile://reset-password#access_token=access-token&refresh_token=refresh-token&type=recovery"
        );

        expect(mocks.mockSetSession).toHaveBeenCalledWith({
            access_token: "access-token",
            refresh_token: "refresh-token",
        });
        expect(result).toBe(session);
    });
});
