import { api } from "../api/client";
import { useOnboardingStore } from "./store";

const CONSENT_MAP: Record<string, string> = {
  ccpa_sale: "ccpa_optin",
  mhmda: "mhmda_health_data",
  modpa: "modpa_health_data",
  terms: "terms",
  privacy: "privacy",
};

export async function commitOnboarding() {
  const s = useOnboardingStore.getState();

  await api.profile.$put({
    json: {
      displayName: s.displayName || undefined,
      dob: s.dob ?? undefined,
      goals: s.goals,
      chamberType: s.chamberType ?? undefined,
    } as any,
  });

  await api.profile.disclaimers.$post({ json: { fireSafety: true, generalDisclaimer: true } } as any);

  for (const c of s.consentAcceptances) {
    await api.profile.consent.$post({
      json: { type: CONSENT_MAP[c.type], version: c.version } as any,
    });
  }
}
