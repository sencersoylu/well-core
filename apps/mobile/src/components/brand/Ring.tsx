import { useEffect } from "react";
import { View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import Animated, { useAnimatedProps, useSharedValue, withTiming, Easing } from "react-native-reanimated";
import { Colors } from "../../theme/index";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  /** 0..1 progress */
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  trackColor?: string;
  /** Animation duration in ms */
  duration?: number;
  /** Stagger before animation begins, in ms (currently reserved for composites) */
  delay?: number;
  children?: React.ReactNode;
};

export function Ring({
  value,
  size = 120,
  stroke = 10,
  color = Colors.recovery,
  trackColor = Colors.hairline,
  duration = 900,
  delay = 0,
  children,
}: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(Math.max(0, Math.min(1, value)), {
      duration,
      easing: Easing.bezier(0.2, 0.7, 0.2, 1),
    });
  }, [value, duration]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: c * (1 - progress.value),
  }));

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute" }}>
        <G rotation={-90} originX={size / 2} originY={size / 2}>
          <Circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={c}
            animatedProps={animatedProps}
          />
        </G>
      </Svg>
      {children}
    </View>
  );
}
