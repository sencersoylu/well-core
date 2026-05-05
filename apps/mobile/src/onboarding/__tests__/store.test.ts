import { describe, expect, test, beforeEach } from "vitest";
import { useOnboardingStore } from "../store";
import { __reset } from "../../test/mocks/expo-secure-store";

beforeEach(() => {
  __reset();
  useOnboardingStore.getState().reset();
});

describe("onboarding store", () => {
  test("starts at welcome step", () => {
    expect(useOnboardingStore.getState().step).toBe("welcome");
  });

  test("setGoals enforces max 5", () => {
    useOnboardingStore.getState().setGoals(["recovery","wellness","brain_fog","long_covid","radiance","anti_aging"]);
    expect(useOnboardingStore.getState().goals.length).toBe(5);
  });

  test("addHealthAnswer with hard contraindication on card 1 marks hardStop", () => {
    useOnboardingStore.getState().addHealthAnswer("pregnancy", true);
    expect(useOnboardingStore.getState().hardStop).toBe(true);
    expect(useOnboardingStore.getState().hardStopReason).toBe("pregnancy");
  });

  test("PHQ-9 Item 9 score >= 1 marks crisis", () => {
    useOnboardingStore.getState().setSuicidalityScore(2);
    expect(useOnboardingStore.getState().crisisRequired).toBe(true);
  });

  test("hydrate roundtrips through secure store", async () => {
    useOnboardingStore.getState().setGoals(["recovery", "wellness"]);
    useOnboardingStore.getState().setChamberType("hard_2_0_plus");
    await useOnboardingStore.getState().persistNow();
    useOnboardingStore.getState().reset();
    expect(useOnboardingStore.getState().goals).toEqual([]);
    await useOnboardingStore.getState().hydrate();
    expect(useOnboardingStore.getState().goals).toEqual(["recovery", "wellness"]);
    expect(useOnboardingStore.getState().chamberType).toBe("hard_2_0_plus");
  });
});
