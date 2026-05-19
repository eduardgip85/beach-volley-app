import { supabase } from "../../../config/supabase";
import { getEventsByIds } from "../../events/services/events.service";
import type { MatchResult } from "../../match-results/types/matchResult.types";
import { getMatchResultsByEventIds } from "../../match-results/services/matchResults.service";
import type { ProfileMatchHistoryModeFilter, ProfileRecentMatch } from "../types/profileStats.types";

interface MatchHistoryMembershipRow {
    event_id: string;
    user_id: string;
    team: "team_a" | "team_b";
    status: string;
}

function mapProfileRecentMatch(
    userMembership: MatchHistoryMembershipRow,
    result: MatchResult,
    event: Awaited<ReturnType<typeof getEventsByIds>>[number]
): ProfileRecentMatch | null {
    if (!result.winningTeam) {
        return null;
    }

    return {
        event,
        result,
        outcome: result.winningTeam === userMembership.team ? "win" : "loss",
    };
}

export async function getProfileMatchHistory(
    userId: string,
    modeFilter: ProfileMatchHistoryModeFilter = "all",
    limitCount?: number
): Promise<ProfileRecentMatch[]> {
    const { data: membershipRows, error: membershipError } = await supabase
        .from("match_players")
        .select("event_id, user_id, team, status")
        .eq("user_id", userId)
        .in("status", ["joined", "confirmed"])
        .in("team", ["team_a", "team_b"]);

    if (membershipError) {
        throw membershipError;
    }

    const memberships = (membershipRows ?? []) as MatchHistoryMembershipRow[];

    if (memberships.length === 0) {
        return [];
    }

    const eventIds = Array.from(
        new Set(memberships.map((membership) => membership.event_id))
    );
    const membershipByEventId = new Map(
        memberships.map((membership) => [membership.event_id, membership])
    );

    const results = await getMatchResultsByEventIds(eventIds);
    const acceptedResults = results.filter(
        (result) => result.validationStatus === "accepted"
    );

    if (acceptedResults.length === 0) {
        return [];
    }

    const acceptedEventIds = Array.from(
        new Set(acceptedResults.map((result) => result.eventId))
    );
    const events = await getEventsByIds(acceptedEventIds);
    const eventById = new Map(events.map((event) => [event.id, event]));

    const mappedMatches = acceptedResults
        .map((result) => {
            const membership = membershipByEventId.get(result.eventId);
            const event = eventById.get(result.eventId);

            if (!membership || !event) {
                return null;
            }

            return mapProfileRecentMatch(membership, result, event);
        })
        .filter((match): match is ProfileRecentMatch => match !== null)
        .filter((match) => {
            if (modeFilter === "all") {
                return true;
            }

            return match.event.mode === modeFilter;
        })
        .sort((left, right) => right.event.startDate.localeCompare(left.event.startDate));

    if (typeof limitCount === "number" && limitCount >= 0) {
        return mappedMatches.slice(0, limitCount);
    }

    return mappedMatches;
}
