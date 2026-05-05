import { useEffect } from "react";
import { Redirect } from "expo-router";
import { useAuth } from "../../src/auth/useAuth";

export default function AuthCallback() {
  const { refetch, status } = useAuth();
  useEffect(() => { void refetch(); }, [refetch]);
  if (status === "loading") return null;
  if (status === "authenticated") return <Redirect href={"/onboarding/goals" as any} />;
  return <Redirect href={"/onboarding/welcome" as any} />;
}
