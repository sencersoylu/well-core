import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { qk } from "./keys";

export function useStartProtocol() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (protocolId: string) => {
      const res = await api.me.protocols.$post({ json: { protocolId } });
      if (!res.ok) throw new Error("start_protocol_failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.userProtocols() }),
  });
}
