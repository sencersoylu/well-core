import { useMutation } from "@tanstack/react-query";
import { api } from "../api/client";

export type DsarInput = {
  type: "access" | "deletion" | "correction";
  notes?: string;
};

export function useDsar() {
  return useMutation({
    mutationFn: async (input: DsarInput) => {
      const res = await api.privacy.dsar.$post({ json: input as any });
      if (!res.ok) throw new Error("dsar_failed");
      return res.json();
    },
  });
}
