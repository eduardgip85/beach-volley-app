import type { MatchPlayer } from "../../match-players/types/matchPlayer.types";
import type { MatchResult } from "../types/matchResult.types";

interface CanValidateResultInput {
    user: {
        id: string;
        role: "player" | "admin";
    } | null;
    event: {
        createdBy: string;
    };
    matchPlayers: MatchPlayer[];
    result: MatchResult | null;
}

export function canValidateResult({
    user,
    event,
    matchPlayers,
    result,
}: CanValidateResultInput) {
    if (!user || !result) {
        return false;
    }

    if (result.validationStatus !== "pending") {
        return false;
    }

    if (result.submittedBy === user.id) {
        return false;
    }

    if (user.role === "admin") {
        return true;
    }

    const currentPlayer = matchPlayers.find(
        (player) =>
            player.userId === user.id &&
            (player.status === "joined" || player.status === "confirmed")
    );
    const submitterPlayer = matchPlayers.find(
        (player) =>
            player.userId === result.submittedBy &&
            (player.status === "joined" || player.status === "confirmed")
    );

    if (!currentPlayer || !submitterPlayer) {
        return false;
    }

    if (!currentPlayer.team || !submitterPlayer.team) {
        return false;
    }

    if (currentPlayer.team === submitterPlayer.team) {
        return false;
    }

    if (user.id === event.createdBy && user.id === result.submittedBy) {
        return false;
    }

    return true;
}
