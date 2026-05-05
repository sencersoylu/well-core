import { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Colors, Spacing, TextStyles } from "../../src/theme/index";
import { HeroGradient } from "../../src/components/brand/HeroGradient";
import { WellcoreMark } from "../../src/components/WellcoreMark";
import { WellcoreWordmark } from "../../src/components/brand/WellcoreWordmark";
import { PrimaryButton } from "../../src/onboarding/ui/PrimaryButton";
import { signInWithApple } from "../../src/auth/appleSignIn";
import { useAuth } from "../../src/auth/useAuth";

export default function Welcome() {
  const { t } = useTranslation();
  const router = useRouter();
  const { refetch } = useAuth();
  const [busy, setBusy] = useState(false);

  const onSignIn = async () => {
    if (busy) return;
    setBusy(true);
    const r = await signInWithApple();
    setBusy(false);
    if (!r.ok && r.reason === "error") Alert.alert(t("onboarding.welcome.signIn"), r.message ?? "Sign-in failed.");
    if (r.ok) {
      const me = await refetch();
      if (me.data) router.replace("/onboarding/goals" as any);
    }
  };

  return (
    <View style={styles.root}>
      <HeroGradient style={StyleSheet.absoluteFill} />
      <View style={styles.center}>
        <WellcoreMark size={48} />
        <WellcoreWordmark size="lg" />
        <Text style={styles.tagline}>{t("onboarding.welcome.tagline")}</Text>
        <Text style={styles.subtitle}>{t("onboarding.welcome.subtitle")}</Text>
      </View>
      <View style={styles.footer}>
        <PrimaryButton label={t("onboarding.welcome.signIn")} onPress={onSignIn} disabled={busy} />
        <Text style={styles.note}>{t("onboarding.welcome.alreadyMember")}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: Spacing.lg, gap: Spacing.sm },
  tagline: { ...TextStyles.h1, color: Colors.ink, textAlign: "center", marginTop: Spacing.lg },
  subtitle: { ...TextStyles.body, color: Colors.ink2, textAlign: "center", maxWidth: 320 },
  footer: { padding: Spacing.lg, gap: Spacing.sm },
  note: { ...TextStyles.caption, color: Colors.ink3, textAlign: "center" },
});
