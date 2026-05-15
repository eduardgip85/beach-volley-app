import { describe, expect, it } from "vitest";
import {
    countTeamPlayers,
    getAutoAssignedTeam,
    isActiveMatchPlayerStatus,
} from "../../features/match-players/utils/matchPlayers.utils";

describe("matchPlayers.utils", () => {
    const activePlayer = {
        team: "team_a" as const,
        status: "joined" as const,
    };

    it("recognizes active match player statuses", () => {
        expect(isActiveMatchPlayerStatus("joined")).toBe(true);
        expect(isActiveMatchPlayerStatus("confirmed")).toBe(true);
        expect(isActiveMatchPlayerStatus("left")).toBe(false);
        expect(isActiveMatchPlayerStatus("removed")).toBe(false);
    });

    it("counts active players per team", () => {
        expect(
            countTeamPlayers(
                [
                    activePlayer,
                    { team: "team_a", status: "confirmed" as const },
                    { team: "team_b", status: "left" as const },
                ],
                "team_a"
            )
        ).toBe(2);
    });

    it("auto-assigns to the team with fewer players", () => {
        expect(getAutoAssignedTeam([])).toBe("team_a");
        expect(
            getAutoAssignedTeam([
                { team: "team_a", status: "joined" as const },
            ])
        ).toBe("team_b");
        expect(
            getAutoAssignedTeam([
                { team: "team_a", status: "joined" as const },
                { team: "team_b", status: "joined" as const },
                { team: "team_b", status: "joined" as const },
            ])
        ).toBe("team_a");
    });
});
