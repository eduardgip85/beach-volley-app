import { Clock3, Lock } from "lucide-react";
import type { EventJoinRequest } from "../types/eventJoinRequest.types";

interface PrivateEventAccessCardProps {
    request: EventJoinRequest | null;
    actionLoadingId: string | null;
    onRequestAccess: () => Promise<void>;
}

function getStatusMessage(request: EventJoinRequest | null) {
    if (!request) {
        return "This private event requires approval before joining.";
    }

    switch (request.status) {
        case "accepted":
            return "Your access request was accepted.";
        case "rejected":
            return "Your previous request was rejected. You can send a new request when you want.";
        case "cancelled":
            return "Your previous request was cancelled. You can send a new one at any time.";
        default:
            return "Your access request is pending review.";
    }
}

export function PrivateEventAccessCard({
    request,
    actionLoadingId,
    onRequestAccess,
}: PrivateEventAccessCardProps) {
    const isPending = request?.status === "pending";
    const isAccepted = request?.status === "accepted";
    const isRequesting = actionLoadingId === "request:undefined" || Boolean(actionLoadingId?.startsWith("request:"));

    return (
        <div className="rounded-3xl bg-amber-50 p-6 ring-1 ring-amber-100">
            <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-white">
                    {isPending ? <Clock3 size={20} /> : <Lock size={20} />}
                </span>

                <div>
                    <h2 className="text-xl font-bold text-slate-900">Private access</h2>
                    <p className="mt-1 text-sm text-slate-600">
                        {getStatusMessage(request)}
                    </p>
                </div>
            </div>

            {!isPending && !isAccepted ? (
                <button
                    type="button"
                    onClick={onRequestAccess}
                    disabled={isRequesting}
                    className="mt-5 rounded-2xl bg-slate-900 px-5 py-3 font-bold text-white disabled:opacity-60"
                >
                    {isRequesting ? "Sending request..." : "Request to Join"}
                </button>
            ) : null}
        </div>
    );
}
