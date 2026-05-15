import { MailPlus, UserRoundX, Users } from "lucide-react";
import type { FriendProfile } from "../../friends/types/friends.types";
import type { EventInvitation } from "../types/eventInvitation.types";

interface InviteFriendsSectionProps {
    friends: FriendProfile[];
    invitations: EventInvitation[];
    actionLoadingId: string | null;
    onInvite: (friendId: string) => Promise<void>;
    onCancel: (invitationId: string) => Promise<void>;
}

export function InviteFriendsSection({
    friends,
    invitations,
    actionLoadingId,
    onInvite,
    onCancel,
}: InviteFriendsSectionProps) {
    const pendingInvitations = invitations.filter(
        (invitation) => invitation.status === "pending"
    );

    return (
        <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                    <MailPlus size={22} />
                </span>

                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Invite friends</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        Invite friends to this private event.
                    </p>
                </div>
            </div>

            {friends.length === 0 ? (
                <div className="mt-6 rounded-3xl bg-slate-50 p-6 text-center">
                    <p className="font-bold text-slate-900">No friends available to invite</p>
                    <p className="mt-2 text-sm text-slate-500">
                        Build your friends list first to send private event invitations.
                    </p>
                </div>
            ) : (
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                    {friends.map((friend) => {
                        const invitation = invitations.find(
                            (item) => item.inviteeId === friend.id
                        );
                        const isPending = invitation?.status === "pending";
                        const isAccepted = invitation?.status === "accepted";
                        const isInviting = actionLoadingId === `invite:${friend.id}`;
                        const isCancelling = invitation
                            ? actionLoadingId === `cancel:${invitation.id}`
                            : false;

                        return (
                            <div
                                key={friend.id}
                                className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-lg font-black text-white">
                                                {friend.fullName.charAt(0).toUpperCase()}
                                            </div>

                                            <div className="min-w-0">
                                                <h3 className="truncate font-bold text-slate-900">
                                                    {friend.fullName}
                                                </h3>
                                            </div>
                                        </div>

                                        {invitation ? (
                                            <p className="mt-4 text-sm font-medium text-slate-600">
                                                Current invitation:{" "}
                                                <span className="capitalize">{invitation.status}</span>
                                            </p>
                                        ) : null}
                                    </div>

                                    <Users className="text-slate-300" />
                                </div>

                                {isPending ? (
                                    <button
                                        type="button"
                                        onClick={() => onCancel(invitation.id)}
                                        disabled={isCancelling}
                                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-60"
                                    >
                                        <UserRoundX size={18} />
                                        {isCancelling ? "Cancelling..." : "Cancel invitation"}
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => onInvite(friend.id)}
                                        disabled={isAccepted || isInviting}
                                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
                                    >
                                        <MailPlus size={18} />
                                        {isInviting
                                            ? "Inviting..."
                                            : isAccepted
                                              ? "Already accepted"
                                              : "Invite to event"}
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {pendingInvitations.length > 0 ? (
                <p className="mt-6 text-sm text-slate-500">
                    Pending invitations: {pendingInvitations.length}
                </p>
            ) : null}
        </div>
    );
}
