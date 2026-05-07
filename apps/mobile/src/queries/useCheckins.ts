import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { qk } from "./keys";

export function useCheckins(sessionId?: string, limit = 40) {
  return useQuery({
    queryKey: qk.checkins(sessionId),
    queryFn: async () => {
      const res = await api.me.checkins.$get({
        query: { limit: String(limit), ...(sessionId ? { sessionId } : {}) },
      });
      if (!res.ok) throw new Error("checkins_fetch_failed");
      return res.json();
    },
    staleTime: 30_000,
  });
}
