import { useState } from "react";
import { ScrollView, View, Text, Pressable, StyleSheet, SafeAreaView } from "react-native";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ProgressDots } from "../../src/onboarding/ui/ProgressDots";
import { PrimaryButton } from "../../src/onboarding/ui/PrimaryButton";
import { FireSafetySlide } from "../../src/components/onboarding/FireSafetySlide";
import { useOnboardingStore } from "../../src/onboarding/store";
import { Colors, Spacing, TextStyles } from "../../src/theme/index";

export default function FireSafety() {
  const { t } = useTranslation();
  const router = useRouter();
  const ackFireSafety = useOnboardingStore((s) => s.ackFireSafety);
  const setStep = useOnboardingStore((s) => s.setStep);
  const [bottom, setBottom] = useState(false);
  const [checked, setChecked] = useState(false);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 4) {
      setBottom(true);
    }
  };

  const canContinue = bottom && checked;

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} accessibilityRole="button" hitSlop={12}>
          <Text style={styles.back}>{"‹"}</Text>
        </Pressable>
        <ProgressDots total={12} index={2} />
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        onScroll={onScroll}
        scrollEventThrottle={64}
      >
        <Text style={styles.title}>{t("onboarding.fireSafety.title")}</Text>
        <Text style={styles.subtitle}>{t("onboarding.fireSafety.subtitle")}</Text>
        <View style={{ height: Spacing.lg }} />
        {/* FireSafetySlide rendered inside a plain View so its internal ScrollView
            expands to full content height — scroll detection is on the outer ScrollView */}
        <View>
          <FireSafetySlide />
        </View>
        <View style={{ height: Spacing.xl }} />
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={() => setChecked((v) => !v)}
          style={styles.checkRow}
          accessibilityRole="checkbox"
          accessibilityState={{ checked }}
        >
          <View style={[styles.box, checked && styles.boxChecked]}>
            {checked && <Text style={styles.tick}>✓</Text>}
          </View>
          <Text style={styles.checkLabel}>{t("onboarding.fireSafety.ack")}</Text>
        </Pressable>
        <PrimaryButton
          label={t("onboarding.common.continue")}
          disabled={!canContinue}
          onPress={() => {
            ackFireSafety();
            setStep("disclaimer");
            router.push("/onboarding/disclaimer" as any);
          }}
        />
        {!bottom && (
          <Text style={styles.hint}>{t("onboarding.fireSafety.scrollHint")}</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  back: { ...TextStyles.h1, color: Colors.ink, fontSize: 32, lineHeight: 32 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  title: { ...TextStyles.h1, color: Colors.ink, marginTop: Spacing.md },
  subtitle: { ...TextStyles.body, color: Colors.ink3, marginTop: Spacing.sm },
  footer: {
    padding: Spacing.lg,
    gap: Spacing.sm,
    borderTopColor: Colors.hairline,
    borderTopWidth: StyleSheet.hairlineWidth,
    backgroundColor: Colors.bg,
  },
  checkRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.hairlineStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  boxChecked: { backgroundColor: Colors.ink, borderColor: Colors.ink },
  tick: { color: Colors.bg, fontSize: 14, lineHeight: 16 },
  checkLabel: { ...TextStyles.body, color: Colors.ink },
  hint: { ...TextStyles.caption, color: Colors.ink3, textAlign: "center" },
});
