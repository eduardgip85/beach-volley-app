import type { MatchPlayer, MatchPlayerStatus, MatchTeam } from "../types/matchPlayer.types";

const activeStatuses: MatchPlayerStatus[] = ["joined", "confirmed"];

export function isActiveMatchPlayerStatus(status: MatchPlayerStatus) {
    return activeStatuses.includes(status);
}

export function getActiveMatchPlayers(players: MatchPlayer[]) {
    return players.filter((player) => isActiveMatchPlayerStatus(player.status));
}

export function countTeamPlayers(
    players: Pick<MatchPlayer, "team" | "status">[],
    team: MatchTeam
) {
    return players.filter(
        (player) => player.team === team && isActiveMatchPlayerStatus(player.status)
    ).length;
}

export function getAutoAssignedTeam(
    players: Pick<MatchPlayer, "team" | "status">[]
): MatchTeam {
    const teamACount = countTeamPlayers(players, "team_a");
    const teamBCount = countTeamPlayers(players, "team_b");

    if (teamACount >= 2 && teamBCount >= 2) {
        throw new Error("This match is already full");
    }

    if (teamACount <= teamBCount && teamACount < 2) {
        return "team_a";
    }

    if (teamBCount < 2) {
        return "team_b";
    }

    return "team_a";
}
