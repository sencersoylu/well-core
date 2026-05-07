import { Pressable, Text, StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from "react-native";
import { Colors, Spacing, TextStyles } from "../../theme/index";

type Props = PressableProps & { label: string; disabled?: boolean; style?: StyleProp<ViewStyle> };

export function PrimaryButton({ label, disabled, style, ...rest }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      style={[styles.btn, disabled && styles.btnDisabled, style]}
      {...rest}
    >
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { backgroundColor: Colors.ink, paddingVertical: Spacing.md, paddingHorizontal: Spacing.lg, borderRadius: 999, alignItems: "center" },
  btnDisabled: { backgroundColor: Colors.hairlineStrong },
  label: { ...TextStyles.button, color: Colors.bg },
  labelDisabled: { color: Colors.ink3 },
});
