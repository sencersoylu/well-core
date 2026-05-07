import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Colors, Spacing, TextStyles } from "../../theme/index";
import type { HealthCardId } from "../types";

export function HealthCard({
  cardId,
  onAnswer,
}: {
  cardId: HealthCardId;
  onAnswer: (answer: boolean) => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={{ gap: Spacing.lg }}>
      <Text style={[TextStyles.h2, { color: Colors.ink }]}>{t(`onboarding.health.${cardId}.title`)}</Text>
      <Text style={[TextStyles.body, { color: Colors.ink2 }]}>{t(`onboarding.health.${cardId}.description`)}</Text>
      <View style={{ gap: Spacing.sm, marginTop: Spacing.md }}>
        <Pressable style={styles.btn} onPress={() => onAnswer(true)}><Text style={styles.label}>{t(`onboarding.health.${cardId}.yesLabel`)}</Text></Pressable>
        <Pressable style={styles.btn} onPress={() => onAnswer(false)}><Text style={styles.label}>{t(`onboarding.health.${cardId}.noLabel`)}</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: { borderWidth: 1, borderColor: Colors.hairlineStrong, borderRadius: 999, paddingVertical: Spacing.md, alignItems: "center" },
  label: { ...TextStyles.button, color: Colors.ink },
});
