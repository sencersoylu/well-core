import { View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Gradients } from "../../theme/index";

type Variant = "hero" | "paperBloom";

type Props = {
  variant?: Variant;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
  /**
   * When true, renders three radial-ish gradient layers (Bevel-style soft bloom).
   * Default false renders a single linear gradient — cheaper and good enough for non-hero surfaces.
   */
  bloom?: boolean;
};

export function HeroGradient({ variant = "hero", style, children, bloom = false }: Props) {
  const colors = Gradients[variant];

  if (!bloom) {
    return (
      <LinearGradient colors={[...colors]} style={style}>
        {children}
      </LinearGradient>
    );
  }

  // Bloom: three stacked gradients to mimic the radial peach/blush/sky bloom.
  // expo-linear-gradient doesn't do radial natively; this approximates with offset linears.
  return (
    <View style={[{ overflow: "hidden" }, style]}>
      <LinearGradient
        colors={[colors[0], "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <LinearGradient
        colors={[colors[1] ?? colors[0], "transparent"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.85 }}
      />
      <LinearGradient
        colors={["transparent", colors[colors.length - 1] ?? colors[0]]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, opacity: 0.7 }}
      />
      {children}
    </View>
  );
}
