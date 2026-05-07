import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import { qk } from "./keys";

export function useProtocol(slug: string | undefined) {
  return useQuery({
    queryKey: qk.protocol(slug ?? ""),
    enabled: !!slug,
    queryFn: async () => {
      const res = await api.protocols[":slug"].$get({ param: { slug: slug! } });
      if (!res.ok) throw new Error("protocol_fetch_failed");
      return res.json();
    },
    staleTime: 5 * 60_000,
  });
}
