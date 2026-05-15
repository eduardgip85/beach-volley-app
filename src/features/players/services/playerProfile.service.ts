import { supabase } from "../../../config/supabase";
import type {
    PublicPlayerProfile,
    PublicProfileModeStats,
    PublicProfileRecentMatch,
    PublicProfileRecentMatchSet,
} from "../types/publicProfile.types";

interface PublicProfileRow {
    id: string;
    full_name: string;
    avatar_url: string | null;
    has_ball: boolean | null;
    has_net: boolean | null;
    competitive_rating: number | null;
    matches_played: number | null;
    wins: number | null;
    losses: number | null;
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
        avatarUrl: row.avatar_url,
        hasBall: row.has_ball ?? false,
        hasNet: row.has_net ?? false,
        competitiveRating: row.competitive_rating ?? 1000,
        matchesPlayed: row.matches_played ?? 0,
        wins: row.wins ?? 0,
        losses: row.losses ?? 0,
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
            "id, full_name, avatar_url, has_ball, has_net, competitive_rating, matches_played, wins, losses"
        )
        .eq("id", userId)
        .single<PublicProfileRow>();

    if (profileError) throw profileError;

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

    const competitive = getEmptyModeStats();
    const casual = getEmptyModeStats();

    for (const row of (modeStatsRows ?? []) as PublicModeStatsRow[]) {
        const target = row.mode === "competitive" ? competitive : casual;
        target.matchesPlayed = Number(row.matches_played ?? 0);
        target.wins = Number(row.wins ?? 0);
        target.losses = Number(row.losses ?? 0);
    }

    return {
        ...mapPublicProfile(profileRow),
        competitive,
        casual,
        recentMatches: ((matchSummaryRows ?? []) as PublicMatchSummaryRow[]).map(
            mapPublicRecentMatch
        ),
    };
}
