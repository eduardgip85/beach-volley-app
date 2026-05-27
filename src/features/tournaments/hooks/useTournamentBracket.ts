import { useEffect, useState } from "react";
import {
  getTournamentBracketMatches,
} from "../services/tournamentBracket.service";
import type { TournamentBracketMatch } from "../types/tournamentBracket.types";

interface UseTournamentBracketOptions {
  eventId?: string;
  enabled?: boolean;
  refreshKey?: number;
}

export function useTournamentBracket(options: UseTournamentBracketOptions) {
  const { eventId, enabled = true, refreshKey = 0 } = options;
  const [matches, setMatches] = useState<TournamentBracketMatch[]>([]);
  const [loading, setLoading] = useState(Boolean(eventId && enabled));
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBracket() {
      if (!eventId || !enabled) {
        setMatches([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const data = await getTournamentBracketMatches(eventId);
        setMatches(data);
      } catch (bracketError) {
        console.error(bracketError);
        setError(
          bracketError instanceof Error
            ? bracketError.message
            : "Could not load tournament bracket"
        );
      } finally {
        setLoading(false);
      }
    }

    void loadBracket();
  }, [eventId, enabled, refreshKey]);

  return {
    matches,
    loading,
    error,
  };
}
