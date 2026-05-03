import { ScrollView, Text, View, StyleSheet } from "react-native";
import { Colors, Spacing, TextStyles } from "../src/theme/index.js";

export default function DesignSystem() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Design system</Text>
      <Text style={styles.subtitle}>Wellcore primitives showcase</Text>
      <Text style={styles.note}>Sections will be added by Faz 1 tasks.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingTop: Spacing.screenTop, gap: Spacing.lg },
  title: { ...TextStyles.h1, color: Colors.ink },
  subtitle: { ...TextStyles.body, color: Colors.ink3 },
  note: { ...TextStyles.caption, color: Colors.ink4 },
});
