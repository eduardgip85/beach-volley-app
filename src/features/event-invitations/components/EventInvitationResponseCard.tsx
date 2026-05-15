import { Check, Mail, X } from "lucide-react";
import type { EventInvitation } from "../types/eventInvitation.types";

interface EventInvitationResponseCardProps {
    invitation: EventInvitation;
    actionLoadingId: string | null;
    onAccept: (invitationId: string) => Promise<void>;
    onDecline: (invitationId: string) => Promise<void>;
}

export function EventInvitationResponseCard({
    invitation,
    actionLoadingId,
    onAccept,
    onDecline,
}: EventInvitationResponseCardProps) {
    const isAccepting = actionLoadingId === `accept:${invitation.id}`;
    const isDeclining = actionLoadingId === `decline:${invitation.id}`;

    return (
        <div className="rounded-3xl bg-blue-50 p-6 ring-1 ring-blue-100">
            <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
                    <Mail size={20} />
                </span>

                <div>
                    <h2 className="text-xl font-bold text-slate-900">
                        Private event invitation
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">
                        {invitation.inviter.fullName} invited you to join this event.
                    </p>
                </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                    type="button"
                    onClick={() => onAccept(invitation.id)}
                    disabled={isAccepting || isDeclining}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 font-bold text-white disabled:opacity-60"
                >
                    <Check size={18} />
                    {isAccepting ? "Accepting..." : "Accept invitation"}
                </button>

                <button
                    type="button"
                    onClick={() => onDecline(invitation.id)}
                    disabled={isAccepting || isDeclining}
                    className="flex items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 py-3 font-bold text-white disabled:opacity-60"
                >
                    <X size={18} />
                    {isDeclining ? "Declining..." : "Decline invitation"}
                </button>
            </div>
        </div>
    );
}
