import { useInfiniteQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { qk } from "./keys";

export function useSessions(limit = 20) {
  return useInfiniteQuery({
    queryKey: qk.sessions(),
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const res = await api.me.sessions.$get({
        query: { limit: String(limit), ...(pageParam ? { cursor: pageParam } : {}) },
      });
      if (!res.ok) throw new Error("sessions_fetch_failed");
      return res.json();
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}
