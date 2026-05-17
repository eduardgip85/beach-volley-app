import type { FormEvent } from "react";
import { Search, UserPlus, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCompetitiveRating } from "../../ratings/utils/rating-display.utils";
import type { FriendProfile } from "../types/friends.types";

interface FriendsSearchSectionProps {
    query: string;
    onQueryChange: (value: string) => void;
    onSearch: () => Promise<void> | void;
    searchLoading: boolean;
    searchError: string;
    searchResults: FriendProfile[];
    actionLoadingId: string | null;
    getRelationshipStatus: (
        profileId: string
    ) => "friend" | "incoming_pending" | "outgoing_pending" | "none";
    onSendRequest: (receiverId: string) => Promise<void>;
}

function getRelationshipLabel(
    relationshipStatus: ReturnType<FriendsSearchSectionProps["getRelationshipStatus"]>
) {
    switch (relationshipStatus) {
        case "friend":
            return "Already friends";
        case "incoming_pending":
            return "Incoming request";
        case "outgoing_pending":
            return "Request sent";
        default:
            return "Send request";
    }
}

export function FriendsSearchSection({
    query,
    onQueryChange,
    onSearch,
    searchLoading,
    searchError,
    searchResults,
    actionLoadingId,
    getRelationshipStatus,
    onSendRequest,
}: FriendsSearchSectionProps) {
    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        await onSearch();
    }

    return (
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                    <Search size={22} />
                </span>

                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Find players</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Search by player name and send a friend request.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                    type="text"
                    value={query}
                    onChange={(event) => onQueryChange(event.target.value)}
                    placeholder="Search players by name"
                    className="flex-1 rounded-2xl border border-slate-200 px-4 py-3"
                />

                <button
                    type="submit"
                    disabled={searchLoading}
                    className="rounded-2xl bg-blue-600 px-5 py-3 font-semibold text-white disabled:opacity-60"
                >
                    {searchLoading ? "Searching..." : "Search"}
                </button>
            </form>

            {searchError ? (
                <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {searchError}
                </p>
            ) : null}

            {!searchLoading && query.trim() && searchResults.length === 0 && !searchError ? (
                <div className="mt-6 rounded-3xl bg-slate-50 p-6 text-center">
                    <p className="font-bold text-slate-900">No users found</p>
                    <p className="mt-2 text-sm text-slate-500">
                        Try a different player name.
                    </p>
                </div>
            ) : null}

            {searchResults.length > 0 ? (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {searchResults.map((profile) => {
                        const relationshipStatus = getRelationshipStatus(profile.id);
                        const isActionable = relationshipStatus === "none";
                        const isLoading = actionLoadingId === `send:${profile.id}`;

                        return (
                            <div
                                key={profile.id}
                                className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <Link
                                            to={`/players/${profile.id}`}
                                            className="flex items-center gap-3"
                                        >
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-lg font-black text-white">
                                                {profile.fullName.charAt(0).toUpperCase()}
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="truncate font-bold text-slate-900">
                                                    {profile.fullName}
                                                </h3>
                                                <p className="truncate text-sm text-slate-500">
                                                    View public profile
                                                </p>
                                            </div>
                                        </Link>

                                        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase">
                                            {profile.country ? (
                                                <span className="rounded-full bg-slate-200 px-3 py-1 text-slate-700">
                                                    {profile.country}
                                                </span>
                                            ) : null}
                                            <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                                                Rating {formatCompetitiveRating(profile.competitiveRating)}
                                            </span>
                                        </div>
                                    </div>

                                    <Users className="text-slate-300" />
                                </div>

                                <button
                                    type="button"
                                    disabled={!isActionable || isLoading}
                                    onClick={() => onSendRequest(profile.id)}
                                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                                >
                                    <UserPlus size={18} />
                                    {isLoading
                                        ? "Sending..."
                                        : getRelationshipLabel(relationshipStatus)}
                                </button>
                            </div>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
}
