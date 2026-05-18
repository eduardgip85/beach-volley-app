import { useEffect, useState } from "react";
import {
  getAdminEvents,
  type AdminEventListItem,
} from "../services/adminEvents.service";

interface UseAdminEventsParams {
  page: number;
  pageSize: number;
  search: string;
  onlyVisibleActive: boolean;
}

export function useAdminEvents({
  page,
  pageSize,
  search,
  onlyVisibleActive,
}: UseAdminEventsParams) {
  const [items, setItems] = useState<AdminEventListItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const result = await getAdminEvents({
          page,
          pageSize,
          search,
          onlyVisibleActive,
        });

        if (ignore) {
          return;
        }

        setItems(result.items);
        setTotalCount(result.totalCount);
      } catch (err) {
        if (ignore) {
          return;
        }

        console.error(err);
        setError("Could not load events");
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      ignore = true;
    };
  }, [page, pageSize, search, onlyVisibleActive]);

  return {
    items,
    totalCount,
    loading,
    error,
    setItems,
  };
}
