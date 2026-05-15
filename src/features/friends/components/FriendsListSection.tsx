import { Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";
import type { FriendProfile } from "../types/friends.types";

interface FriendsListSectionProps {
    friends: FriendProfile[];
    loading: boolean;
}

export function FriendsListSection({
    friends,
    loading,
}: FriendsListSectionProps) {
    return (
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Users size={22} />
                </span>

                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Your friends</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Accepted friendships are shown here.
                    </p>
                </div>
            </div>

            {loading ? (
                <p className="mt-6 text-sm text-slate-500">Loading your friends...</p>
            ) : null}

            {!loading && friends.length === 0 ? (
                <div className="mt-6 rounded-3xl bg-slate-50 p-6 text-center">
                    <p className="font-bold text-slate-900">No friends yet</p>
                    <p className="mt-2 text-sm text-slate-500">
                        Search for players and send your first friend request.
                    </p>
                </div>
            ) : null}

            {!loading && friends.length > 0 ? (
                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {friends.map((friend) => (
                        <Link
                            key={friend.id}
                            to={`/players/${friend.id}`}
                            className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
                        >
                            <div className="flex items-center gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-lg font-black text-white">
                                    {friend.fullName.charAt(0).toUpperCase()}
                                </div>

                                <div className="min-w-0">
                                    <h3 className="truncate font-bold text-slate-900">
                                        {friend.fullName}
                                    </h3>
                                    <p className="truncate text-sm text-slate-500">
                                        View public profile
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase">
                                <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-700">
                                    {friend.role}
                                </span>
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                                    <Trophy size={14} />
                                    {friend.competitiveRating}
                                </span>
                            </div>
                        </Link>
                    ))}
                </div>
            ) : null}
        </div>
    );
}
