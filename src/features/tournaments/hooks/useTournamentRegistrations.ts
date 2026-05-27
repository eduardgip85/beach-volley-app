import { useEffect, useMemo, useState } from "react";
import { getFriends } from "../../friends/services/friends.service";
import type { FriendProfile } from "../../friends/types/friends.types";
import type { TournamentSettings } from "../../events/types/event.types";
import {
  acceptTournamentTeamInvitation,
  cancelTournamentEntry,
  createIndividualTournamentEntry,
  createTeamTournamentEntry,
  declineTournamentTeamInvitation,
  getTournamentEntries,
} from "../services/tournamentRegistrations.service";
import type { TournamentEntry } from "../types/tournamentRegistration.types";

interface UseTournamentRegistrationsOptions {
  eventId?: string;
  currentUserId?: string;
  settings?: TournamentSettings | null;
  enabled?: boolean;
}

export function useTournamentRegistrations(
  options: UseTournamentRegistrationsOptions
) {
  const { eventId, currentUserId, settings, enabled = true } = options;
  const [entries, setEntries] = useState<TournamentEntry[]>([]);
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [loading, setLoading] = useState(Boolean(eventId && enabled));
  const [error, setError] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  async function refresh() {
    if (!eventId || !enabled) {
      setEntries([]);
      setFriends([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const tasks: Promise<unknown>[] = [getTournamentEntries(eventId)];

      if (currentUserId && settings?.registrationType === "team") {
        tasks.push(getFriends(currentUserId));
      } else {
        tasks.push(Promise.resolve([]));
      }

      const [entriesData, friendsData] = await Promise.all(tasks);
      setEntries(entriesData as TournamentEntry[]);
      setFriends(friendsData as FriendProfile[]);
    } catch (refreshError) {
      console.error(refreshError);
      setError(
        refreshError instanceof Error
          ? refreshError.message
          : "Could not load tournament registrations"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, [eventId, currentUserId, settings?.registrationType, enabled]);

  const myActiveEntry = useMemo(
    () =>
      entries
        .filter((entry) => entry.entryKind === "registration")
        .find(
        (entry) =>
          entry.status !== "cancelled" &&
          entry.status !== "expired" &&
          entry.members.some((member) => member.userId === currentUserId)
      ) ?? null,
    [currentUserId, entries]
  );

  const myPendingInvitation = useMemo(
    () =>
      entries
        .filter((entry) => entry.entryKind === "registration")
        .flatMap((entry) =>
          entry.members.map((member) => ({
            entry,
            member,
          }))
        )
        .find(
          ({ member }) =>
            member.userId === currentUserId && member.status === "pending"
        ) ?? null,
    [currentUserId, entries]
  );

  const confirmedEntries = useMemo(
    () =>
      entries.filter(
        (entry) =>
          entry.entryKind === "registration" && entry.status === "confirmed"
      ),
    [entries]
  );

  const pendingEntries = useMemo(
    () =>
      entries.filter(
        (entry) =>
          entry.entryKind === "registration" && entry.status === "pending"
      ),
    [entries]
  );

  const balancedTeamEntries = useMemo(
    () =>
      entries.filter(
        (entry) =>
          entry.entryKind === "balanced_team" && entry.status === "confirmed"
      ),
    [entries]
  );

  const unavailableFriendIds = useMemo(() => {
    return new Set(
      entries
        .filter(
          (entry) =>
            entry.entryKind === "registration" &&
            (entry.status === "pending" || entry.status === "confirmed")
        )
        .flatMap((entry) => entry.members.map((member) => member.userId))
    );
  }, [entries]);

  const invitableFriends = useMemo(
    () => friends.filter((friend) => !unavailableFriendIds.has(friend.id)),
    [friends, unavailableFriendIds]
  );

  async function runMutation(
    loadingId: string,
    action: () => Promise<void>
  ) {
    try {
      setActionLoadingId(loadingId);
      setError("");
      await action();
      await refresh();
    } catch (mutationError) {
      console.error(mutationError);
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Could not update tournament registrations"
      );
    } finally {
      setActionLoadingId(null);
    }
  }

  return {
    state: {
      loading,
      error,
      actionLoadingId,
      entries,
      friends: invitableFriends,
      confirmedEntries,
      pendingEntries,
      balancedTeamEntries,
      myActiveEntry,
      myPendingInvitation,
    },
    actions: {
      refresh,
      clearError: () => setError(""),
      joinIndividual: () =>
        runMutation("join-individual", () =>
          createIndividualTournamentEntry(eventId!)
        ),
      createTeam: (teamName: string, invitedUserIds: string[]) =>
        runMutation("create-team", () =>
          createTeamTournamentEntry(eventId!, teamName, invitedUserIds)
        ),
      acceptInvitation: (memberId: string) =>
        runMutation(`accept:${memberId}`, () =>
          acceptTournamentTeamInvitation(memberId)
        ),
      declineInvitation: (memberId: string) =>
        runMutation(`decline:${memberId}`, () =>
          declineTournamentTeamInvitation(memberId)
        ),
      cancelEntry: (entryId: string) =>
        runMutation(`cancel:${entryId}`, () => cancelTournamentEntry(entryId)),
    },
  };
}
