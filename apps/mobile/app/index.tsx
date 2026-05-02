import { useState } from "react";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { i18next, type Lang } from "../src/i18n/index.js";
import { WellcoreMark } from "../src/components/WellcoreMark.js";
import { Colors, Spacing, TextStyles } from "../src/theme/index.js";

export default function Index() {
  const { t } = useTranslation();
  const [lang, setLang] = useState<Lang>(i18next.language as Lang);

  const toggle = () => {
    const next: Lang = lang === "tr" ? "en" : "tr";
    void i18next.changeLanguage(next);
    setLang(next);
  };

  return (
    <View style={styles.root}>
      <View style={styles.brand}>
        <WellcoreMark size={36} />
        <Text style={styles.wordmark}>{t("brand.name")}</Text>
      </View>
      <Text style={styles.tagline}>{t("brand.tagline")}</Text>

      <Pressable accessibilityRole="button" onPress={toggle} style={styles.toggle}>
        <Text style={styles.toggleText}>{lang.toUpperCase()} → {lang === "tr" ? "EN" : "TR"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.screenH,
    gap: Spacing.lg,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  wordmark: {
    ...TextStyles.wordmark,
    color: Colors.ink,
    fontStyle: "italic",
  },
  tagline: {
    ...TextStyles.body,
    color: Colors.ink2,
    textAlign: "center",
    maxWidth: 280,
  },
  toggle: {
    marginTop: Spacing.xl,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.hairlineStrong,
  },
  toggleText: {
    ...TextStyles.eyebrow,
    color: Colors.ink2,
  },
});
