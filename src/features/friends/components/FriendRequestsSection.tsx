import { Check, Clock3, UserRoundX, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { FriendRequest } from "../types/friends.types";

interface FriendRequestsSectionProps {
    incomingRequests: FriendRequest[];
    outgoingRequests: FriendRequest[];
    actionLoadingId: string | null;
    onAccept: (requestId: string) => Promise<void>;
    onReject: (requestId: string) => Promise<void>;
    onCancel: (requestId: string) => Promise<void>;
}

export function FriendRequestsSection({
    incomingRequests,
    outgoingRequests,
    actionLoadingId,
    onAccept,
    onReject,
    onCancel,
}: FriendRequestsSectionProps) {
    const { t } = useTranslation();

    return (
        <div className="rounded-[2rem] bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <Clock3 size={22} />
                </span>

                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{t("friends.pendingRequests")}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                        {t("friends.pendingRequestsBody")}
                    </p>
                </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                        {t("friends.incoming")}
                    </h3>

                    {incomingRequests.length === 0 ? (
                        <div className="mt-4 rounded-3xl bg-slate-50 p-5 text-sm text-slate-500">
                            {t("friends.noIncoming")}
                        </div>
                    ) : (
                        <div className="mt-4 space-y-4">
                            {incomingRequests.map((request) => {
                                const isAccepting =
                                    actionLoadingId === `accept:${request.id}`;
                                const isRejecting =
                                    actionLoadingId === `reject:${request.id}`;

                                return (
                                    <div
                                        key={request.id}
                                        className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
                                    >
                                        <h4 className="font-bold text-slate-900">
                                            {request.requester.fullName}
                                        </h4>

                                        <div className="mt-4 flex gap-3">
                                            <button
                                                type="button"
                                                disabled={isAccepting || isRejecting}
                                                onClick={() => onAccept(request.id)}
                                                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white disabled:opacity-60"
                                            >
                                                <Check size={18} />
                                                {isAccepting ? t("friends.accepting") : t("friends.accept")}
                                            </button>

                                            <button
                                                type="button"
                                                disabled={isAccepting || isRejecting}
                                                onClick={() => onReject(request.id)}
                                                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-500 px-4 py-3 font-semibold text-white disabled:opacity-60"
                                            >
                                                <X size={18} />
                                                {isRejecting ? t("friends.rejecting") : t("friends.reject")}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                        {t("friends.outgoing")}
                    </h3>

                    {outgoingRequests.length === 0 ? (
                        <div className="mt-4 rounded-3xl bg-slate-50 p-5 text-sm text-slate-500">
                            {t("friends.noOutgoing")}
                        </div>
                    ) : (
                        <div className="mt-4 space-y-4">
                            {outgoingRequests.map((request) => {
                                const isCancelling =
                                    actionLoadingId === `cancel:${request.id}`;

                                return (
                                    <div
                                        key={request.id}
                                        className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
                                    >
                                        <h4 className="font-bold text-slate-900">
                                            {request.receiver.fullName}
                                        </h4>

                                        <button
                                            type="button"
                                            disabled={isCancelling}
                                            onClick={() => onCancel(request.id)}
                                            className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 font-semibold text-white disabled:opacity-60"
                                        >
                                            <UserRoundX size={18} />
                                            {isCancelling ? t("friends.cancelling") : t("friends.cancelRequest")}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
