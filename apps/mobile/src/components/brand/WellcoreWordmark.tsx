import { View, Text, StyleSheet } from "react-native";
import { WellcoreMark, type MarkSize } from "../WellcoreMark";
import { Colors, FontFamily } from "../../theme/index";

type Props = {
  size?: MarkSize;
  showMark?: boolean;
  italic?: boolean;
  color?: string;
};

const SIZE_TO_FONT: Record<MarkSize, number> = {
  xs: 14, sm: 18, md: 24, lg: 32, xl: 56,
};

export function WellcoreWordmark({ size = "md", showMark = true, italic = true, color = Colors.ink }: Props) {
  const fontSize = SIZE_TO_FONT[size];
  return (
    <View style={styles.row}>
      {showMark && <WellcoreMark size={size} color={color} />}
      <Text
        style={{
          fontFamily: italic ? FontFamily.serifItalic : FontFamily.serif,
          fontSize,
          letterSpacing: -0.02 * fontSize,
          color,
          fontStyle: italic ? "italic" : "normal",
        }}
      >
        wellcore
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 6 },
});
