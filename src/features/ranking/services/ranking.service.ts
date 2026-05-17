import { supabase } from "../../../config/supabase";
import { DEFAULT_COMPETITIVE_RATING } from "../../ratings/utils/rating-display.utils";
import { calculateWinRate } from "../utils/ranking.utils";
import type {
    RankingPlayer,
    RankingScope,
    RatingHistoryPoint,
} from "../types/ranking.types";

interface RankingRow {
    ranking_position: number;
    profile_id: string;
    full_name: string;
    avatar_url: string | null;
    country: string | null;
    city: string | null;
    competitive_rating: number | null;
    matches_played: number | null;
    wins: number | null;
    losses: number | null;
    win_rate: number | null;
    current_streak: number | null;
    best_streak: number | null;
}

interface RatingHistoryRow {
    id: string;
    profile_id: string;
    rating: number | null;
    match_id: string | null;
    created_at: string;
}

function mapRankingPlayer(row: RankingRow): RankingPlayer {
    const wins = row.wins ?? 0;
    const losses = row.losses ?? 0;

    return {
        position: Number(row.ranking_position),
        profileId: row.profile_id,
        fullName: row.full_name,
        avatarUrl: row.avatar_url,
        country: row.country,
        city: row.city,
        competitiveRating: row.competitive_rating ?? DEFAULT_COMPETITIVE_RATING,
        matchesPlayed: row.matches_played ?? 0,
        wins,
        losses,
        winRate: row.win_rate ?? calculateWinRate(wins, losses),
        currentStreak: row.current_streak ?? 0,
        bestStreak: row.best_streak ?? 0,
    };
}

function mapRatingHistoryPoint(row: RatingHistoryRow): RatingHistoryPoint {
    return {
        id: row.id,
        profileId: row.profile_id,
        rating: row.rating ?? DEFAULT_COMPETITIVE_RATING,
        matchId: row.match_id,
        createdAt: row.created_at,
    };
}

export async function getCompetitiveRanking(options: {
    scope: RankingScope;
    country?: string | null;
    limit?: number;
}): Promise<RankingPlayer[]> {
    const { data, error } = await supabase.rpc("get_competitive_ranking", {
        scope: options.scope,
        target_country: options.country ?? null,
        limit_count: options.limit ?? 50,
    });

    if (error) throw error;

    return ((data ?? []) as RankingRow[]).map(mapRankingPlayer);
}

export async function getRatingHistory(
    profileId: string,
    limit = 20
): Promise<RatingHistoryPoint[]> {
    const { data, error } = await supabase.rpc("get_profile_rating_history", {
        target_user_id: profileId,
        limit_count: limit,
    });

    if (error) throw error;

    return ((data ?? []) as RatingHistoryRow[]).map(mapRatingHistoryPoint);
}
