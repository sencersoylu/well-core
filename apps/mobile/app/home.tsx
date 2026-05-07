import { Pressable, Text, View, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Colors, Spacing, TextStyles } from "../src/theme/index";
import { useAuth } from "../src/auth/useAuth";

export default function Home() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  return (
    <View style={styles.root}>
      <Text style={styles.title}>{t("home.welcome", { name: user?.name ?? user?.email ?? "" })}</Text>
      <Text style={styles.body}>{t("home.fazStub")}</Text>
      <Pressable onPress={() => signOut()} style={styles.btn}>
        <Text style={styles.btnText}>{t("home.signOut")}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg, alignItems: "center", justifyContent: "center", gap: Spacing.lg, padding: Spacing.lg },
  title: { ...TextStyles.h1, color: Colors.ink, textAlign: "center" },
  body: { ...TextStyles.body, color: Colors.ink2, textAlign: "center" },
  btn: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, borderRadius: 999, borderWidth: 1, borderColor: Colors.hairlineStrong },
  btnText: { ...TextStyles.eyebrow, color: Colors.ink2 },
});
