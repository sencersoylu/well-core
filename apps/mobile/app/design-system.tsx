import { ScrollView, Text, View, StyleSheet } from "react-native";
import type { ReactNode } from "react";
import { Colors, Spacing, TextStyles } from "../src/theme/index.js";
import { WellcoreMark } from "../src/components/WellcoreMark.js";
import { WellcoreWordmark } from "../src/components/brand/WellcoreWordmark.js";

export default function DesignSystem() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Design system</Text>
      <Text style={styles.subtitle}>Wellcore primitives showcase</Text>

      <Section title="Mark — Atrium logo">
        <View style={styles.row}>
          <WellcoreMark size="xs" />
          <WellcoreMark size="sm" />
          <WellcoreMark size="md" />
          <WellcoreMark size="lg" />
          <WellcoreMark size="xl" />
        </View>
      </Section>

      <Section title="Wordmark">
        <WellcoreWordmark size="sm" />
        <WellcoreWordmark size="md" />
        <WellcoreWordmark size="lg" />
        <WellcoreWordmark size="md" italic={false} />
        <WellcoreWordmark size="md" showMark={false} />
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: Spacing.sm }}>
      <Text style={{ ...TextStyles.eyebrow, color: Colors.ink3 }}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingTop: Spacing.screenTop, gap: Spacing.lg },
  title: { ...TextStyles.h1, color: Colors.ink },
  subtitle: { ...TextStyles.body, color: Colors.ink3 },
  row: { flexDirection: "row", alignItems: "center", gap: Spacing.md, flexWrap: "wrap" },
});
