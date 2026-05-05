import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, cookieJar } from "../api/client";

export type AuthUser = { id: string; email: string; name?: string } | null;

const ME_KEY = ["auth", "me"] as const;

export function useAuth() {
  const qc = useQueryClient();

  const me = useQuery({
    queryKey: ME_KEY,
    queryFn: async (): Promise<AuthUser> => {
      const res = await api.auth.me.$get();
      if (res.status === 401) return null;
      if (!res.ok) throw new Error(`auth/me ${res.status}`);
      const body = await res.json();
      return body.user ?? null;
    },
  });

  const signOut = useMutation({
    mutationFn: async () => {
      await api.auth.signout.$post();
      await cookieJar.clear();
    },
    onSuccess: () => qc.setQueryData(ME_KEY, null),
  });

  return {
    user: me.data ?? null,
    status: me.isLoading ? "loading" : me.data ? "authenticated" : "unauthenticated",
    refetch: me.refetch,
    signOut: signOut.mutateAsync,
  } as const;
}
