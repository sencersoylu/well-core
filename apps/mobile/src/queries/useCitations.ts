import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { qk } from "./keys";

export function useCitations() {
  return useQuery({
    queryKey: qk.citations(),
    queryFn: async () => {
      const res = await api.citations.$get();
      if (!res.ok) throw new Error("citations_fetch_failed");
      return res.json();
    },
    staleTime: 24 * 60 * 60_000, // 1 day
  });
}
