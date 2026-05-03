import { Linking, Pressable, Text, View, StyleSheet } from "react-native";
import { Colors, Spacing, TextStyles, Radius, FontFamily } from "../../theme/index.js";

type Resource = {
  region: string;
  name: string;
  phone: string;
  text?: string;
};

const RESOURCES: Resource[] = [
  { region: "United States", name: "988 Suicide & Crisis Lifeline", phone: "988", text: "Text \"HELLO\" to 741741" },
  { region: "United States", name: "Crisis Text Line", phone: "", text: "Text HOME to 741741" },
  { region: "Türkiye", name: "İntihar Önleme Hattı", phone: "182" },
  { region: "Türkiye", name: "Acil Yardım", phone: "112" },
];

export function CrisisResourcesScreen() {
  return (
    <View style={styles.root}>
      <View style={styles.banner}>
        <Text style={styles.bannerLabel}>You are not alone</Text>
        <Text style={styles.bannerTitle}>If you are in crisis, reach out now.</Text>
        <Text style={styles.bannerBody}>
          Wellcore is a wellness companion — it cannot help in a mental-health emergency. The resources below connect you with trained counselors, free of charge, anytime.
        </Text>
      </View>

      <View style={{ gap: Spacing.sm }}>
        {RESOURCES.map((r) => (
          <View key={`${r.region}-${r.name}`} style={styles.card}>
            <Text style={styles.region}>{r.region}</Text>
            <Text style={styles.name}>{r.name}</Text>
            <View style={styles.actions}>
              {r.phone && (
                <Pressable onPress={() => Linking.openURL(`tel:${r.phone}`)} style={styles.action}>
                  <Text style={styles.actionText}>Call {r.phone}</Text>
                </Pressable>
              )}
              {r.text && (
                <Text style={styles.note}>{r.text}</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.md },
  banner: {
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    backgroundColor: Colors.crisisBg,
    borderWidth: 1,
    borderColor: Colors.crisisBorder,
    gap: Spacing.sm,
  },
  bannerLabel: { ...TextStyles.eyebrow, color: Colors.crisisText },
  bannerTitle: { ...TextStyles.h2, color: Colors.crisisText },
  bannerBody: { ...TextStyles.body, color: Colors.crisisText },
  card: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgElev,
    borderWidth: 1,
    borderColor: Colors.hairline,
    gap: 4,
  },
  region: { ...TextStyles.eyebrow, color: Colors.ink3 },
  name: { ...TextStyles.h3, color: Colors.ink },
  actions: { flexDirection: "row", gap: Spacing.md, marginTop: Spacing.sm, alignItems: "center" },
  action: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.crisisText,
  },
  actionText: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: 14,
    letterSpacing: 0.5,
    color: Colors.bg,
  },
  note: { ...TextStyles.caption, color: Colors.ink3 },
});
