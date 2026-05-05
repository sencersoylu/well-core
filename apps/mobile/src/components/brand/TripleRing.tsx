import { useEffect } from "react";
import { View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import Animated, { useAnimatedProps, useSharedValue, withDelay, withTiming, Easing } from "react-native-reanimated";
import { Colors } from "../../theme/index";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  adherence: number; // 0..1, outer ring
  recovery: number;  // 0..1, middle ring
  vitality: number;  // 0..1, inner ring
  size?: number;
  stroke?: number;
  gap?: number;
};

function useRingProgress(value: number, delay: number, duration = 900) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(Math.max(0, Math.min(1, value)), { duration, easing: Easing.bezier(0.2, 0.7, 0.2, 1) }),
    );
  }, [value, delay, duration]);
  return progress;
}

export function TripleRing({
  adherence,
  recovery,
  vitality,
  size = 220,
  stroke = 10,
  gap = 4,
}: Props) {
  const r1 = (size - stroke) / 2;
  const r2 = r1 - stroke - gap;
  const r3 = r2 - stroke - gap;
  const c1 = 2 * Math.PI * r1;
  const c2 = 2 * Math.PI * r2;
  const c3 = 2 * Math.PI * r3;

  const aProgress = useRingProgress(adherence, 100);
  const rProgress = useRingProgress(recovery, 200);
  const vProgress = useRingProgress(vitality, 300);

  const aProps = useAnimatedProps(() => ({ strokeDashoffset: c1 * (1 - aProgress.value) }));
  const rProps = useAnimatedProps(() => ({ strokeDashoffset: c2 * (1 - rProgress.value) }));
  const vProps = useAnimatedProps(() => ({ strokeDashoffset: c3 * (1 - vProgress.value) }));

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <G rotation={-90} originX={size / 2} originY={size / 2}>
          {/* Tracks */}
          <Circle cx={size / 2} cy={size / 2} r={r1} fill="none" stroke={Colors.hairline} strokeWidth={stroke} />
          <Circle cx={size / 2} cy={size / 2} r={r2} fill="none" stroke={Colors.hairline} strokeWidth={stroke} />
          <Circle cx={size / 2} cy={size / 2} r={r3} fill="none" stroke={Colors.hairline} strokeWidth={stroke} />
          {/* Adherence — outer */}
          <AnimatedCircle
            cx={size / 2} cy={size / 2} r={r1}
            fill="none" stroke={Colors.adherence} strokeWidth={stroke}
            strokeLinecap="round" strokeDasharray={c1} animatedProps={aProps}
          />
          {/* Recovery — middle */}
          <AnimatedCircle
            cx={size / 2} cy={size / 2} r={r2}
            fill="none" stroke={Colors.recovery} strokeWidth={stroke}
            strokeLinecap="round" strokeDasharray={c2} animatedProps={rProps}
          />
          {/* Vitality — inner */}
          <AnimatedCircle
            cx={size / 2} cy={size / 2} r={r3}
            fill="none" stroke={Colors.vitality} strokeWidth={stroke}
            strokeLinecap="round" strokeDasharray={c3} animatedProps={vProps}
          />
        </G>
      </Svg>
    </View>
  );
}
