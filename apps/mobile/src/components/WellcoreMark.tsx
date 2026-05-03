import { View } from "react-native";
import Svg, { Circle } from "react-native-svg";

export type MarkSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_MAP: Record<MarkSize, { px: number; stroke: number; gap: number }> = {
  xs: { px: 16, stroke: 1.0, gap: 3 },
  sm: { px: 22, stroke: 1.25, gap: 4 },
  md: { px: 32, stroke: 1.5, gap: 5 },
  lg: { px: 48, stroke: 2.0, gap: 7 },
  xl: { px: 96, stroke: 3.0, gap: 14 },
};

type Props = {
  size?: MarkSize | number;
  stroke?: number;
  color?: string;
  /**
   * If true, wraps the SVG in a View with clear-space padding equal to the
   * mark's stroke width. Use when placing the mark adjacent to text/edges.
   */
  withClearSpace?: boolean;
};

export function WellcoreMark({ size = "md", stroke, color = "#1a1a1a", withClearSpace = false }: Props) {
  const config = typeof size === "number"
    ? { px: size, stroke: stroke ?? Math.max(1, size / 22), gap: Math.max(3, size / 6) }
    : SIZE_MAP[size];

  const px = config.px;
  const strokeWidth = stroke ?? config.stroke;
  const c = px / 2;
  const r1 = px / 2 - strokeWidth / 2;
  const r2 = r1 - config.gap;

  const padding = withClearSpace ? strokeWidth * 4 : 0;
  const total = px + padding * 2;

  return (
    <View style={{ width: total, height: total, alignItems: "center", justifyContent: "center" }}>
      <Svg width={px} height={px}>
        <Circle cx={c} cy={c} r={r1} fill="none" stroke={color} strokeWidth={strokeWidth} />
        <Circle cx={c} cy={c} r={r2} fill="none" stroke={color} strokeWidth={strokeWidth} opacity={0.45} />
      </Svg>
    </View>
  );
}
