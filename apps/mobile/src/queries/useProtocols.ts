import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { qk } from "./keys";

export function useProtocols() {
  return useQuery({
    queryKey: qk.protocols(),
    queryFn: async () => {
      const res = await api.protocols.$get();
      if (!res.ok) throw new Error("protocols_fetch_failed");
      return res.json();
    },
    staleTime: 5 * 60_000,
  });
}
