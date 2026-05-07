import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { qk } from "./keys";

export type UpdateSessionInput = {
  totalDurationSec?: number;
  treatmentDurationSec?: number;
  pausedDurationSec?: number;
  status?: "in_progress" | "completed" | "aborted";
  endedAt?: string;
  clientState?: Record<string, unknown>;
};

export function useUpdateSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, body }: { id: string; body: UpdateSessionInput }) => {
      const res = await (api.sessions[":id"].$patch as any)({ param: { id }, json: body });
      if (!res.ok) throw new Error("update_session_failed");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.sessions() }),
  });
}
