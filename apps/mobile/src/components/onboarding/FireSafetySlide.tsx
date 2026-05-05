import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Colors, Spacing, TextStyles, Radius } from "../../theme/index";
import { IconCheck } from "../icons/index";

const RULES: { title: string; body: string }[] = [
  { title: "100% cotton clothing only", body: "No synthetic fabrics, no nylon, no polyester. Static buildup is the leading fire risk inside oxygen-rich chambers." },
  { title: "No cosmetics, lotions, or hair products", body: "Skin/hair products may be flammable in pressurized oxygen. Wash off before each session." },
  { title: "No electronics inside", body: "Phones, tablets, watches, and battery-powered devices stay outside. Loose batteries are an ignition source." },
  { title: "Hydrate beforehand", body: "Dehydration increases fatigue and ear-equalization difficulty. Drink water 30 minutes prior." },
  { title: "Dissipate static before entry", body: "Touch a grounded metal surface immediately before stepping in." },
  { title: "Adequate ventilation", body: "Run the chamber in a well-ventilated room, away from heat sources, candles, or open flame." },
];

type Props = {
  onAcknowledge?: () => void;
};

export function FireSafetySlide({ onAcknowledge }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.banner}>
        <Text style={styles.bannerLabel}>Important · Required reading</Text>
        <Text style={styles.bannerTitle}>Fire safety in oxygen-rich environments</Text>
        <Text style={styles.bannerBody}>
          Hyperbaric chambers are oxygen-enriched environments. The following rules are required by safety guidance from the FDA (August 2025) and follow chamber-manufacturer manuals. Acknowledge before continuing.
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ gap: Spacing.md, paddingVertical: Spacing.md }}>
        {RULES.map((r) => (
          <View key={r.title} style={styles.rule}>
            <View style={styles.ruleIcon}><IconCheck size={16} color={Colors.disclaimerText} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ruleTitle}>{r.title}</Text>
              <Text style={styles.ruleBody}>{r.body}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.md, flex: 1 },
  banner: {
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    backgroundColor: Colors.disclaimerBg,
    borderWidth: 1,
    borderColor: Colors.disclaimerBorder,
    gap: Spacing.sm,
  },
  bannerLabel: { ...TextStyles.eyebrow, color: Colors.disclaimerText },
  bannerTitle: { ...TextStyles.h2, color: Colors.disclaimerText },
  bannerBody: { ...TextStyles.body, color: Colors.disclaimerText },
  rule: { flexDirection: "row", gap: Spacing.md, alignItems: "flex-start" },
  ruleIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.disclaimerBg, alignItems: "center", justifyContent: "center" },
  ruleTitle: { ...TextStyles.h3, color: Colors.ink },
  ruleBody: { ...TextStyles.body, color: Colors.ink2, marginTop: 2 },
});
