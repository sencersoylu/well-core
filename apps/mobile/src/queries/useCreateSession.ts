import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { qk } from "./keys";

export type CreateSessionInput = {
  userProtocolId?: string | null;
  pressureAta: number;
  clientState?: Record<string, unknown>;
};

export function useCreateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateSessionInput) => {
      const res = await api.sessions.$post({ json: input as any });
      if (!res.ok) throw new Error("create_session_failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.sessions() }),
  });
}
