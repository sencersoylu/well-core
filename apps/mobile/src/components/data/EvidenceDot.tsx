import { View, type StyleProp, type ViewStyle } from "react-native";
import { evidenceLevelToDots, type EvidenceLevel } from "@wellcore/shared/evidence";
import { Colors } from "../../theme/index";

type Props = {
  level: EvidenceLevel;
  size?: number;
  filledColor?: string;
  emptyColor?: string;
  gap?: number;
  style?: StyleProp<ViewStyle>;
};

export function EvidenceDot({
  level,
  size = 6,
  filledColor = Colors.ink,
  emptyColor = Colors.ink5,
  gap = 4,
  style,
}: Props) {
  const { filled, total } = evidenceLevelToDots(level);
  return (
    <View style={[{ flexDirection: "row", gap }, style]}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: i < filled ? filledColor : emptyColor,
          }}
        />
      ))}
    </View>
  );
}
