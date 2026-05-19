import { Clock3, Lock } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { EventJoinRequest } from "../types/eventJoinRequest.types";

interface PrivateEventAccessCardProps {
    request: EventJoinRequest | null;
    actionLoadingId: string | null;
    onRequestAccess: () => Promise<void>;
}

function getStatusMessage(
    request: EventJoinRequest | null,
    t: (key: string) => string
) {
    if (!request) {
        return t("privateAccess.noRequest");
    }

    switch (request.status) {
        case "accepted":
            return t("privateAccess.accepted");
        case "rejected":
            return t("privateAccess.rejected");
        case "cancelled":
            return t("privateAccess.cancelled");
        default:
            return t("privateAccess.pending");
    }
}

export function PrivateEventAccessCard({
    request,
    actionLoadingId,
    onRequestAccess,
}: PrivateEventAccessCardProps) {
    const { t } = useTranslation();
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
                    <h2 className="text-xl font-bold text-slate-900">{t("privateAccess.title")}</h2>
                    <p className="mt-1 text-sm text-slate-600">
                        {getStatusMessage(request, t)}
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
                    {isRequesting ? t("privateAccess.sending") : t("privateAccess.requestToJoin")}
                </button>
            ) : null}
        </div>
    );
}
