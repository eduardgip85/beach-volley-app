import {
    Clock3,
    ArrowRight,
    CalendarDays,
    Link as LinkIcon,
    MapPin,
    Rows2,
    Trophy,
    UserMinus,
    UserPlus,
    Volleyball,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import type {
    AvailabilityStatus,
    PreferredCourtSide,
    PreferredHand,
    PreferredMatchMode,
    PreferredPlayDay,
} from "../../auth/types/auth.types";
import { useAuth } from "../../auth/context/AuthContext";
import { formatCompetitiveRating } from "../../ratings/utils/rating-display.utils";
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
            return "self";
        case "friend":
            return "friend";
        case "incoming_pending":
            return "incoming_pending";
        case "outgoing_pending":
            return "outgoing_pending";
        default:
            return "none";
    }
}

function getPreferenceLabel(
    kind: "hand" | "courtSide" | "matchType" | "availability",
    value:
        | PreferredHand
        | PreferredCourtSide
        | PreferredMatchMode
        | AvailabilityStatus,
    t: (key: string) => string
) {
    if (!value) {
        return null;
    }

    if (kind === "hand") {
        return t(
            `profile.preferences.options.${value === "both" ? "bothHands" : value}`
        );
    }

    if (kind === "courtSide") {
        if (value === "right") {
            return t("profile.preferences.options.rightSide");
        }

        if (value === "left") {
            return t("profile.preferences.options.leftSide");
        }

        return t("profile.preferences.options.bothSides");
    }

    if (kind === "matchType") {
        return value === "competitive"
            ? t("settings.preferences.competitive")
            : t("settings.preferences.casual");
    }

    return t(
        `settings.preferences.${
            value === "looking_for_match" ? "lookingForMatch" : value
        }`
    );
}

function formatPreferredPlayDays(
    preferredPlayDays: PreferredPlayDay[],
    t: (key: string) => string
) {
    if (preferredPlayDays.length === 0) {
        return null;
    }

    return preferredPlayDays
        .map((day) => t(`profile.preferences.days.${day}`))
        .join(", ");
}

export function PublicProfilePage() {
    const { t } = useTranslation();
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
        return <p className="text-slate-500">{t("publicProfile.loading")}</p>;
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
                {t("publicProfile.notFound")}
            </div>
        );
    }

    const preferenceItems = [
        {
            key: "hand",
            label: t("profile.preferences.preferredHand"),
            value: getPreferenceLabel("hand", publicProfile.preferredHand, t),
        },
        {
            key: "courtSide",
            label: t("profile.preferences.courtSide"),
            value: getPreferenceLabel(
                "courtSide",
                publicProfile.preferredCourtSide,
                t
            ),
        },
        {
            key: "matchType",
            label: t("profile.preferences.matchType"),
            value: getPreferenceLabel(
                "matchType",
                publicProfile.preferredMatchMode,
                t
            ),
        },
        {
            key: "availability",
            label: t("profile.preferences.availability"),
            value: getPreferenceLabel(
                "availability",
                publicProfile.availabilityStatus,
                t
            ),
        },
        {
            key: "days",
            label: t("profile.preferences.schedule"),
            value: formatPreferredPlayDays(publicProfile.preferredPlayDays, t),
        },
    ].filter((item) => item.value);

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
                                {t("publicProfile.eyebrow")}
                            </p>
                            <h1 className="mt-2 text-3xl font-black text-slate-900">
                                {publicProfile.fullName}
                            </h1>
                            {publicProfile.username ? (
                                <p className="mt-2 text-sm font-semibold text-slate-500">
                                    @{publicProfile.username}
                                </p>
                            ) : null}

                            <div className="mt-4 flex flex-wrap gap-3">
                                {publicProfile.showRating ? (
                                    <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">
                                        <Trophy size={14} />
                                        {t("publicProfile.rating", {
                                            rating: formatCompetitiveRating(publicProfile.competitiveRating),
                                        })}
                                    </span>
                                ) : null}

                                {publicProfile.country ? (
                                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                                        <MapPin size={14} />
                                        {publicProfile.country}
                                    </span>
                                ) : null}

                                {publicProfile.hasBall ? (
                                    <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                                        <Volleyball size={14} />
                                        {t("profile.ballVerified")}
                                    </span>
                                ) : null}

                                {publicProfile.hasNet ? (
                                    <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                                        <Rows2 size={14} />
                                        {t("profile.netVerified")}
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
                                {t("publicProfile.goToMyProfile")}
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
                                        ? t("publicProfile.removing")
                                        : t("publicProfile.removeFriend")}
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
                                        ? t("publicProfile.sending")
                                        : t(`publicProfile.friendAction.${getFriendActionLabel(relationshipStatus)}`)}
                                </button>
                            )
                        ) : (
                            <Link
                                to="/login"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 font-semibold text-white"
                            >
                                <LinkIcon size={18} />
                                {t("publicProfile.loginToAddFriend")}
                            </Link>
                        )}

                        {relationshipStatus === "incoming_pending" ? (
                            <Link
                                to="/friends"
                                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700"
                            >
                                {t("publicProfile.manageRequest")}
                                <ArrowRight size={18} />
                            </Link>
                        ) : null}
                    </div>
                </div>
            </div>

            {preferenceItems.length > 0 ? (
                <div className="rounded-[2rem] bg-white p-8 shadow-sm">
                    <div className="flex items-start gap-4">
                        <span className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] bg-amber-100 text-amber-700">
                            <Clock3 size={28} />
                        </span>
                        <div>
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-600">
                                {t("publicProfile.preferencesEyebrow")}
                            </p>
                            <h2 className="mt-2 text-2xl font-black text-slate-900">
                                {t("publicProfile.preferencesTitle")}
                            </h2>
                            <p className="mt-2 text-sm text-slate-500">
                                {t("publicProfile.preferencesBody")}
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                        {preferenceItems.map((item) => (
                            <div
                                key={item.key}
                                className="rounded-3xl bg-slate-50 px-5 py-4"
                            >
                                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                    {item.label}
                                </p>
                                <p className="mt-2 text-sm font-bold text-slate-900">
                                    {item.value}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : null}

            {publicProfile.showStats ? (
                <PublicRecentMatchesSection matches={publicProfile.recentMatches} />
            ) : (
                <div className="rounded-[2rem] bg-white p-8 shadow-sm">
                    <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">
                        {t("publicProfile.statsHidden")}
                    </p>
                    <h2 className="mt-3 text-2xl font-bold text-slate-900">
                        {t("publicProfile.statsPrivateTitle")}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        {t("publicProfile.statsPrivateBody")}
                    </p>
                </div>
            )}

            <div className="rounded-[2rem] bg-slate-900 p-8 text-white shadow-sm">
                <div className="flex items-start gap-4">
                    <span className="flex h-14 w-14 items-center justify-center rounded-[1.5rem] bg-white/10 text-blue-300">
                        <CalendarDays size={28} />
                    </span>
                    <div>
                        <h2 className="text-2xl font-bold">{t("publicProfile.safeViewTitle")}</h2>
                        <p className="mt-2 max-w-2xl text-slate-300">
                            {t("publicProfile.safeViewBody")}
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
