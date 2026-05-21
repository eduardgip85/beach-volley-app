import { MessageSquare, Send } from "lucide-react";
import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type KeyboardEvent,
} from "react";
import { useTranslation } from "react-i18next";
import { useEventChat } from "../hooks/useEventChat";

interface EventChatSectionProps {
    eventId: string;
    currentUserId: string;
    canSend?: boolean;
}

function formatMessageTimestamp(value: string, locale: string) {
    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return "";
    }

    return parsedDate.toLocaleTimeString(locale, {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function EventChatSection({
    eventId,
    currentUserId,
    canSend = true,
}: EventChatSectionProps) {
    const { t, i18n } = useTranslation();
    const [draft, setDraft] = useState("");
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const chat = useEventChat(eventId, {
        canAccess: true,
        canSend,
        currentUserId,
    });

    const isDraftEmpty = draft.trim().length === 0;
    const isSendDisabled =
        !chat.state.canSend || chat.state.sending || isDraftEmpty;

    const helperText = useMemo(() => {
        return t("eventChat.helper");
    }, [t]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "end",
        });
    }, [chat.state.messages.length]);

    async function handleSubmit() {
        if (isSendDisabled) {
            return;
        }

        try {
            await chat.actions.sendMessage(draft);
            setDraft("");
        } catch (_error) {
            return;
        }
    }

    function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            void handleSubmit();
        }
    }

    return (
        <section className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-slate-900">
                        <MessageSquare size={18} className="text-blue-600" />
                        <h2 className="text-lg font-black">{t("eventChat.title")}</h2>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                        {helperText}
                    </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-blue-700">
                    {t("eventChat.live")}
                </span>
            </div>

            <div className="mt-5 overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/80 p-3">
                {chat.state.loading ? (
                    <div className="h-[360px] space-y-3 overflow-hidden p-2">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={index}
                                className="h-16 animate-pulse rounded-2xl bg-white"
                            />
                        ))}
                    </div>
                ) : chat.state.messages.length === 0 ? (
                    <div className="flex h-[360px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-10 text-center">
                        <MessageSquare size={22} className="text-blue-500" />
                        <p className="mt-4 text-sm font-bold text-slate-900">
                            {t("eventChat.emptyTitle")}
                        </p>
                        <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                            {t("eventChat.emptyBody")}
                        </p>
                    </div>
                ) : (
                    <div className="h-[360px] space-y-3 overflow-y-auto pr-1">
                        {chat.state.messages.map((message) => {
                            const isOwnMessage = message.senderId === currentUserId;

                            return (
                                <div
                                    key={message.id}
                                    className={`flex ${
                                        isOwnMessage ? "justify-end" : "justify-start"
                                    }`}
                                >
                                    <div
                                        className={`max-w-[85%] rounded-3xl px-4 py-3 shadow-sm ${
                                            isOwnMessage
                                                ? "bg-blue-600 text-white"
                                                : "bg-white text-slate-900"
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            {!isOwnMessage ? (
                                                message.sender.avatarUrl ? (
                                                    <img
                                                        src={message.sender.avatarUrl}
                                                        alt={message.sender.fullName}
                                                        className="h-9 w-9 rounded-2xl object-cover"
                                                    />
                                                ) : (
                                                    <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-blue-100 text-xs font-black text-blue-700">
                                                        {message.sender.fullName
                                                            .charAt(0)
                                                            .toUpperCase()}
                                                    </div>
                                                )
                                            ) : null}

                                            <div className="min-w-0">
                                                <p
                                                    className={`text-xs font-bold uppercase tracking-wide ${
                                                        isOwnMessage
                                                            ? "text-blue-100"
                                                            : "text-slate-400"
                                                    }`}
                                                >
                                                    {isOwnMessage
                                                        ? t("eventChat.you")
                                                        : message.sender.fullName}
                                                </p>
                                                <p className="mt-2 max-h-40 overflow-y-auto whitespace-pre-wrap break-words pr-1 text-sm leading-6">
                                                    {message.body}
                                                </p>
                                                <p
                                                    className={`mt-2 text-[11px] ${
                                                        isOwnMessage
                                                            ? "text-blue-100/90"
                                                            : "text-slate-400"
                                                    }`}
                                                >
                                                    {formatMessageTimestamp(
                                                        message.createdAt,
                                                        i18n.language
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                )}
            </div>

            {chat.state.error ? (
                <p className="mt-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {chat.state.error === "Could not load event chat"
                        ? t("eventChat.loadError")
                        : chat.state.error === "Could not send the message"
                          ? t("eventChat.sendError")
                          : chat.state.error === "Message cannot be empty"
                            ? t("eventChat.emptyMessage")
                            : chat.state.error}
                </p>
            ) : null}

            <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-4">
                <label
                    htmlFor={`event-chat-${eventId}`}
                    className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400"
                >
                    {t("eventChat.writeMessage")}
                </label>

                <textarea
                    id={`event-chat-${eventId}`}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={4}
                    maxLength={1200}
                    placeholder={t("eventChat.placeholder")}
                    className="mt-3 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />

                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-xs text-slate-500">
                        {t("eventChat.messageLimit")}
                    </p>

                    <button
                        type="button"
                        onClick={() => void handleSubmit()}
                        disabled={isSendDisabled}
                        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Send size={16} />
                        {chat.state.sending
                            ? t("eventChat.sending")
                            : t("eventChat.send")}
                    </button>
                </div>
            </div>
        </section>
    );
}
