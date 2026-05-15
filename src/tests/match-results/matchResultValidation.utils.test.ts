import { describe, expect, it } from "vitest";
import { canValidateResult } from "../../features/match-results/utils/matchResultValidation.utils";

function createPlayer(
    userId: string,
    team: "team_a" | "team_b"
) {
    return {
        id: `player-${userId}`,
        eventId: "event-1",
        userId,
        team,
        status: "joined" as const,
        joinedAt: "2026-05-01T10:00:00.000Z",
        updatedAt: "2026-05-01T10:00:00.000Z",
        profile: {
            id: userId,
            fullName: userId,
            email: `${userId}@test.com`,
            avatarUrl: null,
        },
    };
}

const result = {
    id: "result-1",
    eventId: "event-1",
    submittedBy: "user-1",
    winningTeam: "team_a" as const,
    validationStatus: "pending" as const,
    validatedBy: null,
    createdAt: "2026-05-01T10:00:00.000Z",
    updatedAt: "2026-05-01T10:00:00.000Z",
    sets: [],
};

describe("matchResultValidation.utils", () => {
    it("prevents the submitter from validating their own result", () => {
        expect(
            canValidateResult({
                user: { id: "user-1", role: "player" },
                event: { createdBy: "user-1" },
                matchPlayers: [createPlayer("user-1", "team_a"), createPlayer("user-3", "team_b")],
                result,
            })
        ).toBe(false);
    });

    it("allows a player from the opposing team to validate", () => {
        expect(
            canValidateResult({
                user: { id: "user-3", role: "player" },
                event: { createdBy: "user-1" },
                matchPlayers: [createPlayer("user-1", "team_a"), createPlayer("user-3", "team_b")],
                result,
            })
        ).toBe(true);
    });

    it("prevents a player from the same team from validating", () => {
        expect(
            canValidateResult({
                user: { id: "user-2", role: "player" },
                event: { createdBy: "user-1" },
                matchPlayers: [createPlayer("user-1", "team_a"), createPlayer("user-2", "team_a")],
                result,
            })
        ).toBe(false);
    });

    it("allows an admin to validate if they are not the submitter", () => {
        expect(
            canValidateResult({
                user: { id: "admin-1", role: "admin" },
                event: { createdBy: "user-1" },
                matchPlayers: [createPlayer("user-1", "team_a")],
                result,
            })
        ).toBe(true);
    });
});
