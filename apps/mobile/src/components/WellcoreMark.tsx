import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

type Props = {
  size?: number;
  stroke?: number;
  color?: string;
};

export function WellcoreMark({ size = 32, stroke = 1.5, color = "#1a1a1a" }: Props) {
  const c = size / 2;
  const r1 = size / 2 - stroke / 2;
  const r2 = r1 - 5;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={c} cy={c} r={r1} fill="none" stroke={color} strokeWidth={stroke} />
        <Circle cx={c} cy={c} r={r2} fill="none" stroke={color} strokeWidth={stroke} opacity={0.45} />
      </Svg>
    </View>
  );
}
