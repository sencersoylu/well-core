import { create } from "zustand";
import * as SecureStore from "expo-secure-store";
import type { ChamberType, ConsentAcceptance, GoalId, HealthCardId, OnboardingStep } from "./types";

const STORAGE_KEY = "wellcore.onboarding.v1";

const HARD_CARDS: HealthCardId[] = ["pregnancy", "pneumothorax", "ear_surgery", "active_malignancy", "severe_copd"];
const SOFT_CARDS: HealthCardId[] = ["claustrophobia", "recent_surgery"];

type State = {
  step: OnboardingStep;
  goals: GoalId[];
  chamberType: ChamberType | null;
  fireSafetyAcked: boolean;
  disclaimersAcked: boolean;
  healthAnswers: Array<{ cardId: HealthCardId; answer: boolean }>;
  suicidalityScore: number | null;
  crisisRequired: boolean;
  hardStop: boolean;
  hardStopReason: HealthCardId | null;
  softWarning: boolean;
  consentAcceptances: ConsentAcceptance[];
  locale: "en-US" | "tr-TR";
  displayName: string;
  dob: string | null;
};

type Actions = {
  setStep: (s: OnboardingStep) => void;
  setGoals: (g: GoalId[]) => void;
  setChamberType: (c: ChamberType) => void;
  ackFireSafety: () => void;
  ackDisclaimers: () => void;
  addHealthAnswer: (cardId: HealthCardId, answer: boolean) => void;
  setSuicidalityScore: (n: number) => void;
  addConsent: (c: ConsentAcceptance) => void;
  setLocale: (l: "en-US" | "tr-TR") => void;
  setProfile: (p: { displayName?: string; dob?: string | null }) => void;
  reset: () => void;
  persistNow: () => Promise<void>;
  hydrate: () => Promise<void>;
};

const initial: State = {
  step: "welcome",
  goals: [],
  chamberType: null,
  fireSafetyAcked: false,
  disclaimersAcked: false,
  healthAnswers: [],
  suicidalityScore: null,
  crisisRequired: false,
  hardStop: false,
  hardStopReason: null,
  softWarning: false,
  consentAcceptances: [],
  locale: "en-US",
  displayName: "",
  dob: null,
};

const STATE_KEYS = Object.keys(initial) as (keyof State)[];

export const useOnboardingStore = create<State & Actions>()((set, get) => ({
  ...initial,
  setStep: (step) => { set({ step }); void get().persistNow(); },
  setGoals: (g) => { set({ goals: g.slice(0, 5) }); void get().persistNow(); },
  setChamberType: (c) => { set({ chamberType: c }); void get().persistNow(); },
  ackFireSafety: () => { set({ fireSafetyAcked: true }); void get().persistNow(); },
  ackDisclaimers: () => { set({ disclaimersAcked: true }); void get().persistNow(); },
  addHealthAnswer: (cardId, answer) => {
    const next = get().healthAnswers.filter((a) => a.cardId !== cardId).concat({ cardId, answer });
    const hardStopHit = next.find((a) => a.answer && HARD_CARDS.includes(a.cardId));
    const softHit = next.some((a) => a.answer && SOFT_CARDS.includes(a.cardId));
    set({
      healthAnswers: next,
      hardStop: !!hardStopHit,
      hardStopReason: hardStopHit?.cardId ?? null,
      softWarning: softHit,
    });
    void get().persistNow();
  },
  setSuicidalityScore: (n) => {
    set({ suicidalityScore: n, crisisRequired: n >= 1 });
    void get().persistNow();
  },
  addConsent: (c) => {
    const next = get().consentAcceptances.filter((x) => x.type !== c.type).concat(c);
    set({ consentAcceptances: next });
    void get().persistNow();
  },
  setLocale: (l) => { set({ locale: l }); void get().persistNow(); },
  setProfile: ({ displayName, dob }) => {
    set({
      displayName: displayName ?? get().displayName,
      dob: dob === undefined ? get().dob : dob,
    });
    void get().persistNow();
  },
  reset: () => { set(initial); },
  persistNow: async () => {
    const full = get();
    const snap = STATE_KEYS.reduce<Partial<State>>((acc, key) => {
      (acc as Record<string, unknown>)[key] = full[key];
      return acc;
    }, {});
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(snap));
  },
  hydrate: async () => {
    const raw = await SecureStore.getItemAsync(STORAGE_KEY);
    if (!raw) return;
    try { set({ ...(JSON.parse(raw) as State) }); } catch { /* ignore */ }
  },
}));
