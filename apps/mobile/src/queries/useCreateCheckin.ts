import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../api/client";
import { qk } from "./keys";

export type CreateCheckinInput = {
  sessionId?: string | null;
  checkinType: "pre" | "post";
  promisGlobalPhysical: number;
  promisGlobalMental: number;
  painLevel: number;
  energyLevel: number;
  sleepQuality: number;
  focusLevel: number;
  notes?: string;
};

export function useCreateCheckin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCheckinInput) => {
      const res = await api.checkins.$post({ json: input as any });
      if (!res.ok) throw new Error("create_checkin_failed");
      return res.json();
    },
    onSuccess: (_data, vars) => qc.invalidateQueries({ queryKey: qk.checkins(vars.sessionId ?? undefined) }),
  });
}
