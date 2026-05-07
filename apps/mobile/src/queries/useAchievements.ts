import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { qk } from "./keys";

export function useAchievements() {
  return useQuery({
    queryKey: qk.achievements(),
    queryFn: async () => {
      const res = await api.me.achievements.$get();
      if (!res.ok) throw new Error("achievements_fetch_failed");
      return res.json();
    },
    staleTime: 60_000,
  });
}
