import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { qk } from "./keys";

export function useUserProtocols() {
  return useQuery({
    queryKey: qk.userProtocols(),
    queryFn: async () => {
      const res = await api.me.protocols.$get();
      if (!res.ok) throw new Error("user_protocols_fetch_failed");
      return res.json();
    },
    staleTime: 30_000,
  });
}
