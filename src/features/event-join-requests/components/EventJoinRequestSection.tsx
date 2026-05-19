import { Check, Mail, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { EventJoinRequest } from "../types/eventJoinRequest.types";

interface EventJoinRequestSectionProps {
    requests: EventJoinRequest[];
    actionLoadingId: string | null;
    onAccept: (requestId: string) => Promise<void>;
    onReject: (requestId: string) => Promise<void>;
}

export function EventJoinRequestSection({
    requests,
    actionLoadingId,
    onAccept,
    onReject,
}: EventJoinRequestSectionProps) {
    const { t } = useTranslation();

    return (
        <div className="rounded-3xl bg-white p-6 shadow-sm md:p-8">
            <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <Mail size={22} />
                </span>

                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        {t("eventJoinRequests.title")}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        {t("eventJoinRequests.body")}
                    </p>
                </div>
            </div>

            {requests.length === 0 ? (
                <div className="mt-6 rounded-3xl bg-slate-50 p-6 text-center">
                    <p className="font-bold text-slate-900">{t("eventJoinRequests.emptyTitle")}</p>
                    <p className="mt-2 text-sm text-slate-500">
                        {t("eventJoinRequests.emptyBody")}
                    </p>
                </div>
            ) : (
                <div className="mt-6 space-y-4">
                    {requests.map((request) => {
                        const isAccepting =
                            actionLoadingId === `accept:${request.id}`;
                        const isRejecting =
                            actionLoadingId === `reject:${request.id}`;

                        return (
                            <div
                                key={request.id}
                                className="rounded-3xl border border-slate-100 bg-slate-50 p-5"
                            >
                                <h3 className="font-bold text-slate-900">
                                    {request.requester.fullName}
                                </h3>
                                <p className="mt-1 text-sm text-slate-500">
                                    {request.requester.email}
                                </p>

                                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                                    <button
                                        type="button"
                                        onClick={() => onAccept(request.id)}
                                        disabled={isAccepting || isRejecting}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 font-semibold text-white disabled:opacity-60"
                                    >
                                        <Check size={18} />
                                        {isAccepting
                                            ? t("eventJoinRequests.accepting")
                                            : t("eventJoinRequests.acceptRequest")}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => onReject(request.id)}
                                        disabled={isAccepting || isRejecting}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-50 px-4 py-3 font-semibold text-red-600 disabled:opacity-60"
                                    >
                                        <X size={18} />
                                        {isRejecting
                                            ? t("eventJoinRequests.rejecting")
                                            : t("eventJoinRequests.rejectRequest")}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
