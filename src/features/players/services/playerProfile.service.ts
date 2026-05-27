import { supabase } from "../../../config/supabase";
import { DEFAULT_COMPETITIVE_RATING } from "../../ratings/utils/rating-display.utils";
import type {
    PublicPlayerProfile,
    PublicProfileModeStats,
    PublicProfileRecentMatch,
    PublicProfileRecentMatchSet,
} from "../types/publicProfile.types";

interface PublicProfileRow {
    id: string;
    full_name: string;
    username: string | null;
    avatar_url: string | null;
    country: string | null;
    has_ball: boolean | null;
    has_net: boolean | null;
    competitive_rating: number | null;
    matches_played: number | null;
    wins: number | null;
    losses: number | null;
    profile_visibility: "public" | "private" | null;
    show_rating: boolean | null;
    show_stats: boolean | null;
    preferred_hand: "right" | "left" | "both" | null;
    preferred_court_side: "right" | "left" | "both" | null;
    preferred_match_mode: "casual" | "competitive" | null;
    availability_status:
        | "available"
        | "looking_for_match"
        | "busy"
        | "offline"
        | null;
    preferred_play_days: Array<
        | "monday"
        | "tuesday"
        | "wednesday"
        | "thursday"
        | "friday"
        | "saturday"
        | "sunday"
    > | null;
}

interface PublicMatchSummaryRow {
    event_id: string;
    title: string;
    start_date: string;
    mode: "casual" | "competitive" | null;
    winning_team: "team_a" | "team_b";
    player_team: "team_a" | "team_b";
    sets:
        | Array<{
              setNumber: number;
              teamAScore: number;
              teamBScore: number;
          }>
        | null;
}

interface PublicModeStatsRow {
    mode: "casual" | "competitive" | null;
    matches_played: number;
    wins: number;
    losses: number;
}

function mapPublicProfile(
    row: PublicProfileRow
): Omit<PublicPlayerProfile, "competitive" | "casual" | "recentMatches"> {
    return {
        id: row.id,
        fullName: row.full_name,
        username: row.username ?? null,
        avatarUrl: row.avatar_url,
        country: row.country ?? null,
        hasBall: row.has_ball ?? false,
        hasNet: row.has_net ?? false,
        competitiveRating: row.competitive_rating ?? DEFAULT_COMPETITIVE_RATING,
        matchesPlayed: row.matches_played ?? 0,
        wins: row.wins ?? 0,
        losses: row.losses ?? 0,
        profileVisibility: row.profile_visibility ?? "public",
        showRating: row.show_rating ?? true,
        showStats: row.show_stats ?? true,
        preferredHand: row.preferred_hand ?? null,
        preferredCourtSide: row.preferred_court_side ?? null,
        preferredMatchMode: row.preferred_match_mode ?? null,
        availabilityStatus: row.availability_status ?? null,
        preferredPlayDays: row.preferred_play_days ?? [],
    };
}

function mapPublicRecentMatch(row: PublicMatchSummaryRow): PublicProfileRecentMatch {
    const sets: PublicProfileRecentMatchSet[] = (row.sets ?? []).map((set) => ({
        setNumber: Number(set.setNumber),
        teamAScore: Number(set.teamAScore),
        teamBScore: Number(set.teamBScore),
    }));

    return {
        eventId: row.event_id,
        title: row.title,
        startDate: row.start_date,
        mode: row.mode,
        winningTeam: row.winning_team,
        playerTeam: row.player_team,
        outcome: row.winning_team === row.player_team ? "win" : "loss",
        sets,
    };
}

function getEmptyModeStats(): PublicProfileModeStats {
    return {
        matchesPlayed: 0,
        wins: 0,
        losses: 0,
    };
}

export async function getPublicProfile(
    userId: string
): Promise<PublicPlayerProfile> {
    const { data: profileRow, error: profileError } = await supabase
        .from("profiles")
        .select(
            "id, full_name, username, avatar_url, country, has_ball, has_net, competitive_rating, matches_played, wins, losses, profile_visibility, show_rating, show_stats, preferred_hand, preferred_court_side, preferred_match_mode, availability_status, preferred_play_days"
        )
        .eq("id", userId)
        .single<PublicProfileRow>();

    if (profileError) throw profileError;

    const competitive = getEmptyModeStats();
    const casual = getEmptyModeStats();
    const baseProfile = mapPublicProfile(profileRow);

    if (!baseProfile.showStats) {
        return {
            ...baseProfile,
            competitive,
            casual,
            recentMatches: [],
        };
    }

    const [
        { data: matchSummaryRows, error: recentMatchesError },
        { data: modeStatsRows, error: modeStatsError },
    ] = await Promise.all([
        supabase.rpc("get_public_player_match_summaries", {
            target_user_id: userId,
        }),
        supabase.rpc("get_public_player_mode_stats", {
            target_user_id: userId,
        }),
    ]);

    if (recentMatchesError) throw recentMatchesError;
    if (modeStatsError) throw modeStatsError;

    for (const row of (modeStatsRows ?? []) as PublicModeStatsRow[]) {
        const target = row.mode === "competitive" ? competitive : casual;
        target.matchesPlayed = Number(row.matches_played ?? 0);
        target.wins = Number(row.wins ?? 0);
        target.losses = Number(row.losses ?? 0);
    }

    return {
        ...baseProfile,
        competitive,
        casual,
        recentMatches: ((matchSummaryRows ?? []) as PublicMatchSummaryRow[]).map(
            mapPublicRecentMatch
        ),
    };
}
