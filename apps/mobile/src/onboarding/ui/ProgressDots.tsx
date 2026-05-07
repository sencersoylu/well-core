import { View, StyleSheet } from "react-native";
import { Colors } from "../../theme/index";

export function ProgressDots({ total, index }: { total: number; index: number }) {
  return (
    <View style={styles.row} accessibilityRole="progressbar" accessibilityValue={{ min: 1, max: total, now: index + 1 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[styles.dot, i === index && styles.dotActive, i < index && styles.dotDone]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 6, alignItems: "center" },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.hairline },
  dotDone: { backgroundColor: Colors.ink3 },
  dotActive: { width: 18, backgroundColor: Colors.ink },
});
