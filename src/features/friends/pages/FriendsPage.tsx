import { Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../auth/context/AuthContext";
import { FriendRequestsSection } from "../components/FriendRequestsSection";
import { FriendsListSection } from "../components/FriendsListSection";
import { FriendsSearchSection } from "../components/FriendsSearchSection";
import { useFriends } from "../hooks/useFriends";

export function FriendsPage() {
    const { t } = useTranslation();
    const { profile } = useAuth();
    const { state, actions, helpers } = useFriends(profile?.id);

    if (!profile) {
        return <p className="text-slate-500">{t("friends.loading")}</p>;
    }

    return (
        <section className="space-y-8">
            <div className="rounded-[2rem] bg-white p-8 shadow-sm">
                <div className="flex items-center gap-4">
                    <span className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-slate-900 text-white">
                        <Users size={30} />
                    </span>

                    <div>
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                            {t("friends.eyebrow")}
                        </p>
                        <h1 className="mt-2 text-3xl font-black text-slate-900">
                            {t("friends.title")}
                        </h1>
                        <p className="mt-2 max-w-2xl text-sm text-slate-500">
                            {t("friends.body")}
                        </p>
                    </div>
                </div>
            </div>

            {state.error ? (
                <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {state.error}
                </p>
            ) : null}

            <FriendsSearchSection
                query={state.searchQuery}
                onQueryChange={actions.setSearchQuery}
                onSearch={actions.search}
                searchLoading={state.searchLoading}
                searchError={state.searchError}
                searchResults={state.searchResults}
                actionLoadingId={state.actionLoadingId}
                getRelationshipStatus={helpers.getRelationshipStatus}
                onSendRequest={actions.sendRequest}
            />

            <FriendRequestsSection
                incomingRequests={state.incomingRequests}
                outgoingRequests={state.outgoingRequests}
                actionLoadingId={state.actionLoadingId}
                onAccept={actions.acceptRequest}
                onReject={actions.rejectRequest}
                onCancel={actions.cancelRequest}
            />

            <FriendsListSection friends={state.friends} loading={state.loading} />
        </section>
    );
}
