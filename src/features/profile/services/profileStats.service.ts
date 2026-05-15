import { supabase } from "../../../config/supabase";
import type { ProfileStatsData, ProfileStatsSnapshot } from "../types/profileStats.types";

function mapProfileStats(row: any): ProfileStatsSnapshot {
    return {
        competitiveRating: row.competitive_rating ?? 1000,
        matchesPlayed: row.matches_played ?? 0,
        wins: row.wins ?? 0,
        losses: row.losses ?? 0,
    };
}

export async function getProfileStatsSnapshot(
    userId: string
): Promise<ProfileStatsSnapshot> {
    const { data, error } = await supabase
        .from("profiles")
        .select("competitive_rating, matches_played, wins, losses")
        .eq("id", userId)
        .single();

    if (error) throw error;

    return mapProfileStats(data);
}

function mapProfileDashboardStats(data: any): ProfileStatsData {
    return {
        competitiveRating: data?.competitiveRating ?? 1000,
        matchesPlayed: data?.matchesPlayed ?? 0,
        wins: data?.wins ?? 0,
        losses: data?.losses ?? 0,
        competitive: {
            matchesPlayed: data?.competitive?.matchesPlayed ?? 0,
            wins: data?.competitive?.wins ?? 0,
            losses: data?.competitive?.losses ?? 0,
        },
        casual: {
            matchesPlayed: data?.casual?.matchesPlayed ?? 0,
            wins: data?.casual?.wins ?? 0,
            losses: data?.casual?.losses ?? 0,
        },
        recentMatches: data?.recentMatches ?? [],
    };
}

export async function getProfileDashboardStats(
    userId: string
): Promise<ProfileStatsData> {
    const { data, error } = await supabase.rpc("get_profile_dashboard_stats", {
        target_user_id: userId,
    });

    if (error) throw error;

    return mapProfileDashboardStats(data);
}
