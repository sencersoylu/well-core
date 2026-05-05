import { Pressable, Text, View, StyleSheet } from "react-native";
import { Colors, Spacing, TextStyles, Radius } from "../../theme/index";

export type ChamberType = "soft_1_3" | "hard_1_5" | "hard_2_0_plus";

type Option = {
  value: ChamberType;
  label: string;
  description: string;
};

const OPTIONS: Option[] = [
  { value: "soft_1_3", label: "Soft chamber · 1.3 ATA", description: "Inflatable mild-pressure chamber. Most common for home use." },
  { value: "hard_1_5", label: "Hard chamber · 1.5 ATA", description: "Rigid chamber at moderate pressure." },
  { value: "hard_2_0_plus", label: "Hard chamber · 2.0+ ATA", description: "Rigid clinical-grade chamber. Most published research uses this range." },
];

type Props = {
  value: ChamberType | null;
  onChange: (v: ChamberType) => void;
};

export function ChamberTypeSelector({ value, onChange }: Props) {
  return (
    <View style={{ gap: Spacing.sm }}>
      {OPTIONS.map((opt) => {
        const selected = value === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[styles.card, selected && styles.cardSelected]}
          >
            <View style={[styles.radio, selected && styles.radioSelected]}>
              {selected && <View style={styles.radioInner} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, selected && { color: Colors.ink }]}>{opt.label}</Text>
              <Text style={styles.description}>{opt.description}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgElev,
    borderWidth: 1,
    borderColor: Colors.hairline,
    alignItems: "center",
  },
  cardSelected: {
    borderColor: Colors.ink,
    borderWidth: 1.5,
  },
  radio: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1.5, borderColor: Colors.ink4,
    alignItems: "center", justifyContent: "center",
  },
  radioSelected: { borderColor: Colors.ink },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.ink },
  label: { ...TextStyles.h3, color: Colors.ink2 },
  description: { ...TextStyles.caption, color: Colors.ink3, marginTop: 2 },
});
