import { useEffect, useMemo, useState } from "react";
import { getMyTournamentTeamInvitations } from "../services/tournamentRegistrations.service";
import type { TournamentTeamInvitation } from "../types/tournamentRegistration.types";

export function useMyTournamentInvitations(userId?: string) {
  const [invitations, setInvitations] = useState<TournamentTeamInvitation[]>([]);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInvitations() {
      if (!userId) {
        setInvitations([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getMyTournamentTeamInvitations(userId);
        setInvitations(data);
      } catch (err) {
        console.error(err);
        setError("Could not load tournament invitations");
      } finally {
        setLoading(false);
      }
    }

    void loadInvitations();
  }, [userId]);

  const pendingInvitations = useMemo(() => invitations, [invitations]);

  return {
    invitations,
    pendingInvitations,
    loading,
    error,
  };
}
