import {
    ArrowRight,
    CalendarDays,
    Link as LinkIcon,
    Rows2,
    Trophy,
    UserMinus,
    UserPlus,
    Volleyball,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { PublicRecentMatchesSection } from "../components/PublicRecentMatchesSection";
import { usePublicProfile } from "../hooks/usePublicProfile";

function getFriendActionLabel(
    relationshipStatus:
        | "self"
        | "friend"
        | "incoming_pending"
        | "outgoing_pending"
        | "none"
) {
    switch (relationshipStatus) {
        case "self":
            return "This is your profile";
        case "friend":
            return "Already friends";
        case "incoming_pending":
            return "Incoming friend request";
        case "outgoing_pending":
            return "Friend request sent";
        default:
            return "Send friend request";
    }
}

export function PublicProfilePage() {
    const { userId } = useParams<{ userId: string }>();
    const { profile } = useAuth();
    const {
        publicProfile,
        loading,
        error,
        friendActionLoading,
        relationshipStatus,
        canSendFriendRequest,
        actions,
    } = usePublicProfile(userId);

    if (loading) {
        return <p className="text-slate-500">Loading player profile...</p>;
    }

    if (error) {
        return (
            <div className="rounded-3xl bg-red-50 px-5 py-4 text-sm text-red-600">
                {error}
            </div>
        );
    }

    if (!publicProfile) {
        return (
            <div className="rounded-3xl bg-slate-50 px-5 py-4 text-sm text-slate-600">
                Player profile not found.
            </div>
        );
    }

    return (
        <section className="space-y-8">
            <div className="rounded-[2rem] bg-white p-8 shadow-sm">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-5">
                        {publicProfile.avatarUrl ? (
                            <img
                                src={publicProfile.avatarUrl}
                                alt={publicProfile.fullName}
                                className="h-24 w-24 rounded-[2rem] object-cover"
                            />
                        ) : (
                            <div className="flex h-24 w-24 items-center justify-center rounded-[2rem] bg-blue-600 text-3xl font-black text-white">
                                {publicProfile.fullName.charAt(0).toUpperCase()}
                            </div>
                        )}

                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                                Player profile
                            </p>
                            <h1 className="mt-2 text-3xl font-black text-slate-900">
                                {publicProfile.fullName}
                            </h1>

                            <div className="mt-4 flex flex-wrap gap-3">
                                <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                                    <Trophy size={14} />
                                    Rating {publicProfile.competitiveRating}
                                </span>

                                {publicProfile.hasBall ? (
                                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                                        <Volleyball size={14} />
                                        Ball verified
                                    </span>
                                ) : null}

                                {publicProfile.hasNet ? (
                                    <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                                        <Rows2 size={14} />
                                        Net verified
                                    </span>
                                ) : null}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                        {relationshipStatus === "self" ? (
                            <Link
                                to="/profile"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white"
                            >
                                Go to my profile
                                <ArrowRight size={18} />
                            </Link>
                        ) : profile ? (
                            relationshipStatus === "friend" ? (
                                <button
                                    type="button"
                                    disabled={friendActionLoading}
                                    onClick={() => actions.removeFriend()}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-50 px-5 py-3 font-semibold text-red-600 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                                >
                                    <UserMinus size={18} />
                                    {friendActionLoading
                                        ? "Removing..."
                                        : "Remove friend"}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    disabled={!canSendFriendRequest || friendActionLoading}
                                    onClick={() => actions.sendFriendRequest()}
                                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                                >
                                    <UserPlus size={18} />
                                    {friendActionLoading
                                        ? "Sending..."
                                        : getFriendActionLabel(relationshipStatus)}
                                </button>
                            )
                        ) : (
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white"
                            >
                                <LinkIcon size={18} />
                                Log in to add friend
                            </Link>
                        )}

                        {relationshipStatus === "incoming_pending" ? (
                            <Link
                                to="/friends"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700"
                            >
                                Manage request
                                <ArrowRight size={18} />
                            </Link>
                        ) : null}
                    </div>
                </div>
            </div>

            <PublicRecentMatchesSection matches={publicProfile.recentMatches} />

            <div className="rounded-[2rem] bg-slate-900 p-8 text-white shadow-sm">
                <div className="flex items-start gap-4">
                    <span className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] bg-white/10 text-blue-300">
                        <CalendarDays size={28} />
                    </span>
                    <div>
                        <h2 className="text-2xl font-bold">Safe profile view</h2>
                        <p className="mt-2 max-w-2xl text-slate-300">
                            Contact details stay hidden. Match history is shown only as a
                            safe summary, without opening private event details.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
