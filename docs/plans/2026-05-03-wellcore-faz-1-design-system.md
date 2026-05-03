# Wellcore Faz 1 — Design System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the Wellcore brand primitives, v2 research-driven components, citations data layer, and real Atrium-branded app assets — proven via a dev-only showcase route that renders every primitive in one place.

**Architecture:** Pure-logic primitives (citations data, evidence-dot mapping) live in `packages/shared` with vitest tests. React Native components live in `apps/mobile/src/components/` organized by domain (`brand/`, `data/`, `onboarding/`). Reanimated 4 drives ring fills. Real Atrium assets generated from a single SVG source via a Bun-based `sharp` pipeline, replacing the Faz 0 1×1 placeholders. A dev-only `/design-system` Expo Router route renders every primitive — visual regression validation. No new RN test framework added in this phase; component verification is via the showcase route on simulator.

**Tech Stack:** All Faz 0 deps + `sharp` (Bun-side SVG→PNG) + `@gorhom/bottom-sheet` (citation modal) + Reanimated 4 worklets + react-native-svg (already present). Citations validated with Zod (already present in shared).

**Definition of done:**
- All 13 primitives render correctly on iOS simulator at `/design-system` route.
- `pnpm typecheck` passes across all 3 workspaces.
- `pnpm --filter @wellcore/shared test` passes (citations schema + evidence-dot tests).
- `apps/mobile/assets/icon.png` is the real Atrium mark (not the 1×1 placeholder).
- TripleRing animates fills smoothly on mount (Adherence amber, Recovery sage, Vitality terracotta).
- Citation modal opens from any `<CitedText>` superscript, shows DOI + plain-language summary + "what the study did NOT show" block.
- One commit per task. Final commit on a `faz-1` branch ready for review.

**Pre-flight:** Branch `main` is checked out. Faz 0 has been merged. No uncommitted changes. iOS simulator available (Xcode installed).

```bash
cd /Users/sencersoylu/Projects/wellcore
git checkout main && git pull
git checkout -b faz-1
```

---

## Task 1: Theme extensions — gradient helper + design system showcase route stub

**Files:**
- Modify: `apps/mobile/src/theme/colors.ts` — add `RingColors` and `Disclaimer` palettes used in v2 components
- Create: `apps/mobile/src/theme/index.ts` — already exists; ensure new exports added
- Create: `apps/mobile/app/design-system.tsx` — placeholder route that proves the file is wired

**Step 1: Modify `apps/mobile/src/theme/colors.ts` — append new palette blocks at the end of the `Colors` object before `as const`**

Inside the `Colors` object, before the closing `} as const;`, add:

```typescript
  // Disclaimer / advisory palette (used in FireSafetySlide, CrisisResources)
  disclaimerBg: "#fdf3e7",
  disclaimerText: "#7a3e0a",
  disclaimerBorder: "rgba(122, 62, 10, 0.18)",

  // Crisis / red-flag palette
  crisisBg: "#fbe9e6",
  crisisText: "#8a2418",
  crisisBorder: "rgba(138, 36, 24, 0.22)",
```

Then below `Gradients`, append a new export at the bottom of the file:

```typescript
export const RingColors = {
  adherence: { fill: Colors.adherence, track: Colors.hairline },
  recovery:  { fill: Colors.recovery,  track: Colors.hairline },
  vitality:  { fill: Colors.vitality,  track: Colors.hairline },
} as const;

export type RingKind = keyof typeof RingColors;
```

**Step 2: Update `apps/mobile/src/theme/index.ts`**

Replace existing exports with:

```typescript
export { Colors, Gradients, RingColors } from "./colors.js";
export type { RingKind } from "./colors.js";
export { FontFamily, TextStyles } from "./typography.js";
export { Spacing, Radius, Shadows } from "./spacing.js";
```

**Step 3: Create `apps/mobile/app/design-system.tsx`**

```tsx
import { ScrollView, Text, View, StyleSheet } from "react-native";
import { Colors, Spacing, TextStyles } from "../src/theme/index.js";

export default function DesignSystem() {
  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Design system</Text>
      <Text style={styles.subtitle}>Wellcore primitives showcase</Text>
      <Text style={styles.note}>Sections will be added by Faz 1 tasks.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingTop: Spacing.screenTop, gap: Spacing.lg },
  title: { ...TextStyles.h1, color: Colors.ink },
  subtitle: { ...TextStyles.body, color: Colors.ink3 },
  note: { ...TextStyles.caption, color: Colors.ink4 },
});
```

**Step 4: Typecheck + commit**

```bash
pnpm --filter @wellcore/mobile typecheck
git add apps/mobile/src/theme apps/mobile/app/design-system.tsx
git commit -m "feat(mobile): theme extensions + design-system route stub"
```

Expected: typecheck silent, commit succeeds.

---

## Task 2: Atrium SVG source + PNG generation script (`sharp`-based)

**Files:**
- Create: `apps/mobile/assets/atrium/atrium-mark.svg` — single source of truth for the logo mark
- Create: `apps/mobile/assets/atrium/atrium-icon.svg` — full app icon (mark on warm gradient bg)
- Create: `tools/gen-assets.ts` — Bun-runnable generator
- Modify: `package.json` (root) — add `gen:assets` script and `sharp` devDep

**Step 1: Add `sharp` to root `package.json`**

Modify `devDependencies` to include `"sharp": "^0.33.5"` and add a script:

```json
"gen:assets": "bun run tools/gen-assets.ts"
```

Run `pnpm install` from repo root.

**Step 2: Create `apps/mobile/assets/atrium/atrium-mark.svg`**

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320">
  <circle cx="160" cy="160" r="159" fill="none" stroke="#1a1a1a" stroke-width="2"/>
  <circle cx="160" cy="160" r="119" fill="none" stroke="#1a1a1a" stroke-width="2" opacity="0.45"/>
</svg>
```

**Step 3: Create `apps/mobile/assets/atrium/atrium-icon.svg`**

Same mark on a peach→blush→sky radial gradient — the iOS app icon source.

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="80%">
      <stop offset="0%" stop-color="#f4d6c0"/>
      <stop offset="55%" stop-color="#e9c8d5"/>
      <stop offset="100%" stop-color="#c8d8e4"/>
    </radialGradient>
  </defs>
  <rect width="1024" height="1024" fill="url(#bg)"/>
  <circle cx="512" cy="512" r="320" fill="none" stroke="#1a1a1a" stroke-width="6"/>
  <circle cx="512" cy="512" r="240" fill="none" stroke="#1a1a1a" stroke-width="6" opacity="0.45"/>
</svg>
```

**Step 4: Create `tools/gen-assets.ts`**

```typescript
import sharp from "sharp";
import { mkdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dir, "..");
const SRC = join(ROOT, "apps/mobile/assets/atrium");
const OUT = join(ROOT, "apps/mobile/assets");

const targets = [
  { src: "atrium-icon.svg", out: "icon.png", size: 1024 },
  { src: "atrium-icon.svg", out: "adaptive-icon.png", size: 1024 },
  { src: "atrium-icon.svg", out: "splash-icon.png", size: 400, padBg: "#f6f4ef" },
  { src: "atrium-mark.svg", out: "favicon.png", size: 64 },
];

mkdirSync(OUT, { recursive: true });

for (const t of targets) {
  const buf = readFileSync(join(SRC, t.src));
  let img = sharp(buf, { density: 384 }).resize(t.size, t.size, { fit: "contain", background: t.padBg ?? { r: 0, g: 0, b: 0, alpha: 0 } });
  await img.png().toFile(join(OUT, t.out));
  console.log(`→ ${t.out} (${t.size}×${t.size})`);
}

console.log("done");
```

**Step 5: Run the generator + verify**

```bash
pnpm gen:assets
ls -la apps/mobile/assets/*.png
```

Expected: 4 PNGs in `apps/mobile/assets/`, each substantially larger than the 68-byte placeholders. Verify by opening one (e.g. `open apps/mobile/assets/icon.png`).

**Step 6: Commit**

```bash
git add apps/mobile/assets tools package.json pnpm-lock.yaml
git commit -m "feat(mobile): real Atrium app icons generated from SVG via sharp"
```

---

## Task 3: WellcoreMark variants + clear-space helper

**Files:**
- Modify: `apps/mobile/src/components/WellcoreMark.tsx` — extend the existing primitive

**Step 1: Replace `apps/mobile/src/components/WellcoreMark.tsx` with**

```tsx
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
```

**Step 2: Add WellcoreMark section to design-system route**

Modify `apps/mobile/app/design-system.tsx` — add after the existing `<Text style={styles.note}>` element:

```tsx
import { WellcoreMark } from "../src/components/WellcoreMark.js";

// ... inside ScrollView, after the note:
<Section title="Mark — Atrium logo">
  <View style={styles.row}>
    <WellcoreMark size="xs" />
    <WellcoreMark size="sm" />
    <WellcoreMark size="md" />
    <WellcoreMark size="lg" />
    <WellcoreMark size="xl" />
  </View>
</Section>
```

Add a small reusable `<Section>` component at the bottom of the file (still inside the same module):

```tsx
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: Spacing.sm }}>
      <Text style={{ ...TextStyles.eyebrow, color: Colors.ink3 }}>{title}</Text>
      {children}
    </View>
  );
}
```

Add to `styles`:

```typescript
row: { flexDirection: "row", alignItems: "center", gap: Spacing.md, flexWrap: "wrap" },
```

**Step 3: Typecheck + commit**

```bash
pnpm --filter @wellcore/mobile typecheck
git add apps/mobile/src/components/WellcoreMark.tsx apps/mobile/app/design-system.tsx
git commit -m "feat(mobile): WellcoreMark size variants + clear-space helper"
```

---

## Task 4: WellcoreWordmark composite

**Files:**
- Create: `apps/mobile/src/components/brand/WellcoreWordmark.tsx`
- Modify: `apps/mobile/app/design-system.tsx` — add a "Wordmark" section

**Step 1: Create `apps/mobile/src/components/brand/WellcoreWordmark.tsx`**

```tsx
import { View, Text, StyleSheet } from "react-native";
import { WellcoreMark, type MarkSize } from "../WellcoreMark.js";
import { Colors, FontFamily } from "../../theme/index.js";

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
```

**Step 2: Add showcase section**

In `apps/mobile/app/design-system.tsx`, add an import and a section after the Mark section:

```tsx
import { WellcoreWordmark } from "../src/components/brand/WellcoreWordmark.js";

// ...
<Section title="Wordmark">
  <WellcoreWordmark size="sm" />
  <WellcoreWordmark size="md" />
  <WellcoreWordmark size="lg" />
  <WellcoreWordmark size="md" italic={false} />
  <WellcoreWordmark size="md" showMark={false} />
</Section>
```

**Step 3: Typecheck + commit**

```bash
pnpm --filter @wellcore/mobile typecheck
git add apps/mobile/src/components/brand apps/mobile/app/design-system.tsx
git commit -m "feat(mobile): WellcoreWordmark composite (mark + italic wordmark)"
```

---

## Task 5: Animated Ring primitive (Reanimated 4)

**Files:**
- Create: `apps/mobile/src/components/brand/Ring.tsx`
- Modify: `apps/mobile/app/design-system.tsx`

**Step 1: Create `apps/mobile/src/components/brand/Ring.tsx`**

```tsx
import { useEffect } from "react";
import { View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import Animated, { useAnimatedProps, useSharedValue, withTiming, Easing } from "react-native-reanimated";
import { Colors } from "../../theme/index.js";

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
  /** Stagger before animation begins, in ms */
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
```

**Note on `delay`:** the parameter is currently unused — it's reserved for the TripleRing composite which staggers its three rings. Leaving the prop available now keeps the API forward-compatible.

**Step 2: Add showcase**

In `design-system.tsx`:

```tsx
import { Ring } from "../src/components/brand/Ring.js";

<Section title="Ring (single, animated)">
  <View style={styles.row}>
    <Ring value={0.78} color={Colors.recovery}>
      <Text style={{ ...TextStyles.h2, color: Colors.ink }}>78</Text>
    </Ring>
    <Ring value={0.42} color={Colors.adherence} size={96} stroke={8} />
    <Ring value={0.62} color={Colors.vitality} size={80} stroke={6} />
  </View>
</Section>
```

**Step 3: Typecheck + commit**

```bash
pnpm --filter @wellcore/mobile typecheck
git add apps/mobile/src/components/brand/Ring.tsx apps/mobile/app/design-system.tsx
git commit -m "feat(mobile): animated Ring primitive (Reanimated 4)"
```

---

## Task 6: TripleRing composite (Adherence / Recovery / Vitality)

**Files:**
- Create: `apps/mobile/src/components/brand/TripleRing.tsx`
- Modify: `apps/mobile/app/design-system.tsx`

**Step 1: Create `apps/mobile/src/components/brand/TripleRing.tsx`**

```tsx
import { useEffect } from "react";
import { View } from "react-native";
import Svg, { Circle, G } from "react-native-svg";
import Animated, { useAnimatedProps, useSharedValue, withDelay, withTiming, Easing } from "react-native-reanimated";
import { Colors } from "../../theme/index.js";

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
```

**Step 2: Add showcase**

```tsx
import { TripleRing } from "../src/components/brand/TripleRing.js";

<Section title="TripleRing — Adherence / Recovery / Vitality">
  <TripleRing adherence={0.84} recovery={0.62} vitality={0.71} />
</Section>
```

**Step 3: Typecheck + commit**

```bash
pnpm --filter @wellcore/mobile typecheck
git add apps/mobile/src/components/brand/TripleRing.tsx apps/mobile/app/design-system.tsx
git commit -m "feat(mobile): TripleRing composite with staggered animation"
```

---

## Task 7: HeroGradient component

**Files:**
- Create: `apps/mobile/src/components/brand/HeroGradient.tsx`
- Modify: `apps/mobile/app/design-system.tsx`

**Step 1: Create `apps/mobile/src/components/brand/HeroGradient.tsx`**

```tsx
import { View, type StyleProp, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Gradients } from "../../theme/index.js";

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
        style={{ position: "absolute", inset: 0 }}
      />
      <LinearGradient
        colors={[colors[1], "transparent"]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ position: "absolute", inset: 0, opacity: 0.85 }}
      />
      <LinearGradient
        colors={["transparent", colors[colors.length - 1]]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: "absolute", inset: 0, opacity: 0.7 }}
      />
      {children}
    </View>
  );
}
```

**Note:** `style.inset: 0` is supported in RN 0.83+ (Yoga 2 era). If the build complains, replace with `top: 0, left: 0, right: 0, bottom: 0`.

**Step 2: Add showcase**

```tsx
import { HeroGradient } from "../src/components/brand/HeroGradient.js";

<Section title="HeroGradient">
  <HeroGradient style={{ height: 140, borderRadius: 24 }}>
    <View style={{ flex: 1 }} />
  </HeroGradient>
  <HeroGradient bloom style={{ height: 180, borderRadius: 24 }}>
    <View style={{ flex: 1 }} />
  </HeroGradient>
</Section>
```

**Step 3: Typecheck + commit**

```bash
pnpm --filter @wellcore/mobile typecheck
git add apps/mobile/src/components/brand/HeroGradient.tsx apps/mobile/app/design-system.tsx
git commit -m "feat(mobile): HeroGradient component (linear + bloom variants)"
```

---

## Task 8: Icon set (13 line icons)

**Files:**
- Create: `apps/mobile/src/components/icons/index.tsx` — single-file icon library

**Step 1: Create `apps/mobile/src/components/icons/index.tsx`**

```tsx
import Svg, { Circle, Path, Rect, type SvgProps } from "react-native-svg";

type IconProps = {
  size?: number;
  color?: string;
} & Omit<SvgProps, "width" | "height">;

const STROKE: Pick<SvgProps, "fill" | "strokeLinecap" | "strokeLinejoin"> = {
  fill: "none",
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

const w = 1.5; // stroke width

function S({ size = 22, color = "currentColor", children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" stroke={color} strokeWidth={w} {...STROKE} {...rest}>
      {children}
    </Svg>
  );
}

export const IconHome = (p: IconProps) => <S {...p}><Path d="M3 11.5 12 4l9 7.5"/><Path d="M5 10v9.5h14V10"/></S>;
export const IconJournal = (p: IconProps) => <S {...p}><Path d="M6 4h11a2 2 0 0 1 2 2v14H8a2 2 0 0 1-2-2V4z"/><Path d="M6 4v16"/><Path d="M10 9h6M10 13h4"/></S>;
export const IconPlus = (p: IconProps) => <S {...p}><Path d="M12 5v14M5 12h14"/></S>;
export const IconChart = (p: IconProps) => <S {...p}><Path d="M4 19V5"/><Path d="M9 19v-8"/><Path d="M14 19v-5"/><Path d="M19 19V9"/></S>;
export const IconUser = (p: IconProps) => <S {...p}><Circle cx="12" cy="8" r="3.5"/><Path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5"/></S>;

export const IconPlay = ({ size = 18, color = "currentColor", ...r }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" {...r}><Path d="M7 5v14l12-7z" fill={color} /></Svg>
);
export const IconPause = ({ size = 18, color = "currentColor", ...r }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" {...r}><Rect x="6" y="5" width="4" height="14" rx="1" fill={color}/><Rect x="14" y="5" width="4" height="14" rx="1" fill={color}/></Svg>
);

export const IconArrowRight = (p: IconProps) => <S {...p}><Path d="M5 12h14M13 6l6 6-6 6"/></S>;
export const IconClose = (p: IconProps) => <S {...p}><Path d="M6 6l12 12M18 6 6 18"/></S>;
export const IconCheck = (p: IconProps) => <S {...p}><Path d="M5 12.5 10 17 19 7"/></S>;
export const IconBell = (p: IconProps) => <S {...p}><Path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5L6 16z"/><Path d="M10 20a2 2 0 0 0 4 0"/></S>;
export const IconEar = (p: IconProps) => <S {...p}><Path d="M8 18c-2 0-3-2-3-4 0-1.5.5-3 .5-5C5.5 5 8.5 3 12 3s6 2 6 6c0 2-1 3-2.5 4S13 14.5 13 16s-1 3-3 3"/></S>;
export const IconSparkle = (p: IconProps) => <S {...p}><Path d="M12 4v6m0 4v6m-8-8h6m4 0h6"/></S>;
```

**Step 2: Add showcase**

```tsx
import * as Icons from "../src/components/icons/index.js";

<Section title="Icons">
  <View style={styles.row}>
    {Object.entries(Icons).map(([name, Icon]) => (
      <View key={name} style={{ alignItems: "center", gap: 4, width: 64 }}>
        <Icon size={22} color={Colors.ink} />
        <Text style={{ ...TextStyles.caption, color: Colors.ink3, fontSize: 10 }}>{name.replace("Icon", "")}</Text>
      </View>
    ))}
  </View>
</Section>
```

**Step 3: Typecheck + commit**

```bash
pnpm --filter @wellcore/mobile typecheck
git add apps/mobile/src/components/icons apps/mobile/app/design-system.tsx
git commit -m "feat(mobile): 13 line-style icons matching Wellcore design"
```

---

## Task 9: Citations data layer in shared package (TDD)

**Files:**
- Create: `packages/shared/src/citations.ts`
- Create: `packages/shared/src/citations.json`
- Create: `packages/shared/src/__tests__/citations.test.ts`
- Modify: `packages/shared/package.json` — add `vitest` devDep + scripts; add `./citations` export
- Modify: `packages/shared/src/index.ts` — re-export Citation types for convenience

**Step 1: Add deps + scripts to `packages/shared/package.json`**

`devDependencies` add:
```json
"vitest": "^2.1.0"
```

`scripts` add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

`exports` add a third entry: `"./citations": "./src/citations.ts"`.

Run `pnpm install` from repo root.

**Step 2: Write the failing test — `packages/shared/src/__tests__/citations.test.ts`**

```typescript
import { describe, expect, it } from "vitest";
import { citations, getCitation, CitationSchema } from "../citations.js";

describe("citations data layer", () => {
  it("validates every citation against CitationSchema", () => {
    for (const [tag, citation] of Object.entries(citations)) {
      const result = CitationSchema.safeParse(citation);
      expect(result.success, `citation "${tag}" failed: ${JSON.stringify(result.error?.issues ?? "")}`).toBe(true);
    }
  });

  it("looks up a known citation by tag", () => {
    const c = getCitation("hbo-plasma-1500");
    expect(c).toBeDefined();
    expect(c?.source.year).toBeGreaterThan(1900);
  });

  it("returns undefined for unknown tag", () => {
    expect(getCitation("nonexistent-citation-tag-xyz")).toBeUndefined();
  });
});
```

**Step 3: Run test — verify fail**

```bash
pnpm --filter @wellcore/shared test
```

Expected: FAIL with module not found for `../citations.js`.

**Step 4: Create `packages/shared/src/citations.json` (seed data — minimal v1 set)**

```json
{
  "hbo-plasma-1500": {
    "title": "HBOT increases plasma-dissolved oxygen",
    "phrasing_en": "At 2.4 ATA breathing 100% oxygen, plasma-dissolved oxygen rises ~17-fold over normal air; at 1.3 ATA breathing ambient air the rise is ~1.4-fold.",
    "what_it_does_not_show": "Plasma O₂ increase does not by itself imply clinical benefit at any pressure.",
    "source": {
      "authors": "Mathieu D. (ed.)",
      "year": 2006,
      "journal": "Handbook on Hyperbaric Medicine",
      "doi": "10.1007/1-4020-4448-8"
    }
  },
  "hbo-cd34-thom-2006": {
    "title": "Stem cell mobilization (CD34+) ~8-fold after 20 sessions at 2.0 ATA",
    "phrasing_en": "Adults completing 20 sessions of HBOT at 2.0 ATA showed an ~8× increase in circulating CD34+ stem cells (Thom 2006).",
    "what_it_does_not_show": "The study used 2.0 ATA hard chambers; effects at 1.3 ATA mild chambers are not established.",
    "source": {
      "authors": "Thom SR, et al.",
      "year": 2006,
      "journal": "Am J Physiol Heart Circ Physiol",
      "doi": "10.1152/ajpheart.00888.2005"
    }
  },
  "long-covid-zilberman-2022": {
    "title": "HBOT improves cognitive and physical symptoms in post-COVID-19 condition",
    "phrasing_en": "In a sham-controlled RCT, 40 sessions at 2.0 ATA improved cognition, fatigue, and quality of life vs. sham (Zilberman-Itskovich 2022).",
    "what_it_does_not_show": "Pressure was 2.0 ATA — efficacy at 1.3 ATA mild chambers is not established. Symptoms returned partially in some participants over follow-up.",
    "source": {
      "authors": "Zilberman-Itskovich S, et al.",
      "year": 2022,
      "journal": "Scientific Reports",
      "doi": "10.1038/s41598-022-15565-0"
    }
  }
}
```

**Step 5: Implement `packages/shared/src/citations.ts`**

```typescript
import { z } from "zod";
import data from "./citations.json" with { type: "json" };

export const CitationSchema = z.object({
  title: z.string().min(1),
  phrasing_en: z.string().min(1),
  what_it_does_not_show: z.string().min(1),
  source: z.object({
    authors: z.string().min(1),
    year: z.number().int().min(1900).max(2100),
    journal: z.string().min(1),
    doi: z.string().min(1).optional(),
    pmid: z.string().min(1).optional(),
    url: z.string().url().optional(),
  }),
});

export type Citation = z.infer<typeof CitationSchema>;
export type CitationTag = keyof typeof data;

export const citations: Record<string, Citation> = data as Record<string, Citation>;

export function getCitation(tag: string): Citation | undefined {
  return citations[tag];
}
```

**Step 6: Re-run test — verify pass**

```bash
pnpm --filter @wellcore/shared test
```

Expected: 3 tests passing.

**Step 7: Update `packages/shared/src/index.ts`**

Append:

```typescript
export type { Citation, CitationTag } from "./citations.js";
```

**Step 8: Commit**

```bash
git add packages/shared apps/mobile pnpm-lock.yaml
git commit -m "feat(shared): citations data layer with zod validation (3 vitest tests)"
```

---

## Task 10: CitedText + CitationModal (bottom sheet)

**Files:**
- Modify: `apps/mobile/package.json` — add `@gorhom/bottom-sheet` (peer-compatible with Reanimated 4)
- Create: `apps/mobile/src/components/data/CitedText.tsx`
- Create: `apps/mobile/src/components/data/CitationModal.tsx`
- Create: `apps/mobile/src/components/data/CitationProvider.tsx` — global modal host
- Modify: `apps/mobile/app/_layout.tsx` — wrap with `<CitationProvider>`
- Modify: `apps/mobile/app/design-system.tsx` — add showcase

**Step 1: Add dep**

In `apps/mobile/package.json` `dependencies`:
```json
"@gorhom/bottom-sheet": "^5.0.0"
```

Run `pnpm install`. If `^5.0.0` doesn't resolve, downshift to the latest published `5.x` (the v5 line is the one that supports Reanimated 4 + New Arch).

**Step 2: Create `apps/mobile/src/components/data/CitationProvider.tsx`**

```tsx
import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import type { Citation } from "@wellcore/shared/citations";

type CitationContextValue = {
  open: (citation: Citation) => void;
  close: () => void;
  current: Citation | null;
};

const CitationContext = createContext<CitationContextValue | null>(null);

export function CitationProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<Citation | null>(null);

  const value = useMemo<CitationContextValue>(() => ({
    open: (c) => setCurrent(c),
    close: () => setCurrent(null),
    current,
  }), [current]);

  return <CitationContext.Provider value={value}>{children}</CitationContext.Provider>;
}

export function useCitation() {
  const ctx = useContext(CitationContext);
  if (!ctx) throw new Error("useCitation must be used inside <CitationProvider>");
  return ctx;
}
```

**Step 3: Create `apps/mobile/src/components/data/CitationModal.tsx`**

```tsx
import { useEffect, useRef } from "react";
import { Linking, Text, View, StyleSheet, Pressable } from "react-native";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { Colors, Spacing, TextStyles, Radius } from "../../theme/index.js";
import { useCitation } from "./CitationProvider.js";

export function CitationModal() {
  const { current, close } = useCitation();
  const sheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    if (current) sheetRef.current?.expand();
    else sheetRef.current?.close();
  }, [current]);

  if (!current) {
    // Render the sheet as closed; expanding requires the component to exist.
    return (
      <BottomSheet ref={sheetRef} index={-1} snapPoints={["55%"]} enablePanDownToClose>
        <BottomSheetView style={styles.sheet} />
      </BottomSheet>
    );
  }

  const doi = current.source.doi;
  const pmid = current.source.pmid;
  const url = doi ? `https://doi.org/${doi}` : pmid ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` : current.source.url;

  return (
    <BottomSheet ref={sheetRef} snapPoints={["60%"]} enablePanDownToClose onClose={close}>
      <BottomSheetView style={styles.sheet}>
        <Text style={styles.eyebrow}>Citation</Text>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.body}>{current.phrasing_en}</Text>

        <View style={styles.cautionBlock}>
          <Text style={styles.cautionLabel}>What this study does not show</Text>
          <Text style={styles.cautionBody}>{current.what_it_does_not_show}</Text>
        </View>

        <View style={styles.sourceBlock}>
          <Text style={styles.sourceText}>
            {current.source.authors} ({current.source.year}). {current.source.journal}
            {doi ? ` · doi:${doi}` : pmid ? ` · pmid:${pmid}` : ""}
          </Text>
          {url && (
            <Pressable onPress={() => Linking.openURL(url)}>
              <Text style={styles.link}>Open source ↗</Text>
            </Pressable>
          )}
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: { padding: Spacing.lg, gap: Spacing.md, backgroundColor: Colors.bgElev },
  eyebrow: { ...TextStyles.eyebrow, color: Colors.ink3 },
  title: { ...TextStyles.h2, color: Colors.ink },
  body: { ...TextStyles.body, color: Colors.ink2 },
  cautionBlock: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.disclaimerBg,
    borderWidth: 1,
    borderColor: Colors.disclaimerBorder,
    gap: 6,
  },
  cautionLabel: { ...TextStyles.eyebrow, color: Colors.disclaimerText },
  cautionBody: { ...TextStyles.body, color: Colors.disclaimerText },
  sourceBlock: { gap: 4, marginTop: Spacing.sm },
  sourceText: { ...TextStyles.caption, color: Colors.ink3 },
  link: { ...TextStyles.caption, color: Colors.recovery, textDecorationLine: "underline" },
});
```

**Step 4: Create `apps/mobile/src/components/data/CitedText.tsx`**

```tsx
import { Pressable, Text, View, type TextStyle, type StyleProp } from "react-native";
import { getCitation, type CitationTag } from "@wellcore/shared/citations";
import { Colors, TextStyles } from "../../theme/index.js";
import { useCitation } from "./CitationProvider.js";

type Props = {
  /** Inline content (the prose that the citation backs up) */
  children: React.ReactNode;
  /** Citation tag from packages/shared/src/citations.json */
  source: CitationTag | string;
  /** Number to render in superscript. If omitted, a small bracket icon is used. */
  index?: number;
  style?: StyleProp<TextStyle>;
};

export function CitedText({ children, source, index, style }: Props) {
  const { open } = useCitation();
  const citation = getCitation(source as string);

  const onPress = () => {
    if (citation) open(citation);
  };

  return (
    <Text style={style}>
      {children}
      <Pressable onPress={onPress} accessibilityLabel={`Open citation ${citation?.title ?? source}`}>
        <Text style={{ ...TextStyles.caption, color: Colors.recovery, fontSize: 10, fontWeight: "600" }}>
          {index !== undefined ? ` ${index}` : " [c]"}
        </Text>
      </Pressable>
    </Text>
  );
}
```

**Step 5: Wire provider + modal at the root — modify `apps/mobile/app/_layout.tsx`**

Replace existing layout body. New version:

```tsx
import "../src/i18n/index.js";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { wellcoreFontMap } from "../src/theme/fonts.js";
import { CitationProvider } from "../src/components/data/CitationProvider.js";
import { CitationModal } from "../src/components/data/CitationModal.js";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [loaded, error] = useFonts(wellcoreFontMap);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CitationProvider>
        <Stack screenOptions={{ headerShown: false }} />
        <CitationModal />
      </CitationProvider>
    </GestureHandlerRootView>
  );
}
```

**Step 6: Showcase in `design-system.tsx`**

```tsx
import { CitedText } from "../src/components/data/CitedText.js";

<Section title="CitedText">
  <View style={{ paddingHorizontal: Spacing.md }}>
    <Text style={{ ...TextStyles.body, color: Colors.ink2 }}>
      <CitedText source="hbo-cd34-thom-2006" index={1}>
        HBOT users in clinical studies show roughly an eightfold increase in circulating stem cells
      </CitedText>
      .
    </Text>
  </View>
</Section>
```

**Step 7: Typecheck + commit**

```bash
pnpm --filter @wellcore/mobile typecheck
git add apps/mobile pnpm-lock.yaml
git commit -m "feat(mobile): CitedText with bottom-sheet citation modal"
```

---

## Task 11: EvidenceDot indicator (TDD)

**Files:**
- Create: `packages/shared/src/evidence.ts` — pure mapping function (testable)
- Create: `packages/shared/src/__tests__/evidence.test.ts`
- Modify: `packages/shared/package.json` — add `./evidence` export
- Create: `apps/mobile/src/components/data/EvidenceDot.tsx`

**Step 1: Add export**

`packages/shared/package.json` `exports`:
```json
"./evidence": "./src/evidence.ts"
```

**Step 2: Write the failing test — `packages/shared/src/__tests__/evidence.test.ts`**

```typescript
import { describe, expect, it } from "vitest";
import { evidenceLevelToDots, type EvidenceLevel } from "../evidence.js";

describe("evidenceLevelToDots", () => {
  it("maps strong to 3 filled", () => {
    expect(evidenceLevelToDots("strong")).toEqual({ filled: 3, total: 3 });
  });
  it("maps moderate to 2 filled", () => {
    expect(evidenceLevelToDots("moderate")).toEqual({ filled: 2, total: 3 });
  });
  it("maps weak to 1 filled", () => {
    expect(evidenceLevelToDots("weak")).toEqual({ filled: 1, total: 3 });
  });
  it("maps absent to 0 filled", () => {
    expect(evidenceLevelToDots("absent")).toEqual({ filled: 0, total: 3 });
  });
});
```

**Step 3: Run — fail**

```bash
pnpm --filter @wellcore/shared test
```

Expected: 4 new tests fail (cannot resolve `../evidence.js`).

**Step 4: Implement `packages/shared/src/evidence.ts`**

```typescript
export type EvidenceLevel = "strong" | "moderate" | "weak" | "absent";

export function evidenceLevelToDots(level: EvidenceLevel): { filled: number; total: number } {
  const map: Record<EvidenceLevel, number> = { strong: 3, moderate: 2, weak: 1, absent: 0 };
  return { filled: map[level], total: 3 };
}
```

**Step 5: Re-run — pass**

```bash
pnpm --filter @wellcore/shared test
```

Expected: all 7 tests passing (3 from Task 9 + 4 new).

**Step 6: Create `apps/mobile/src/components/data/EvidenceDot.tsx`**

```tsx
import { View, type StyleProp, type ViewStyle } from "react-native";
import { evidenceLevelToDots, type EvidenceLevel } from "@wellcore/shared/evidence";
import { Colors } from "../../theme/index.js";

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
            width: size, height: size, borderRadius: size / 2,
            backgroundColor: i < filled ? filledColor : emptyColor,
          }}
        />
      ))}
    </View>
  );
}
```

**Step 7: Showcase + commit**

In `design-system.tsx`:

```tsx
import { EvidenceDot } from "../src/components/data/EvidenceDot.js";

<Section title="EvidenceDot">
  <View style={styles.row}>
    <View style={{ alignItems: "center", gap: 4 }}><EvidenceDot level="strong" /><Text style={styles.captionLabel}>strong</Text></View>
    <View style={{ alignItems: "center", gap: 4 }}><EvidenceDot level="moderate" /><Text style={styles.captionLabel}>moderate</Text></View>
    <View style={{ alignItems: "center", gap: 4 }}><EvidenceDot level="weak" /><Text style={styles.captionLabel}>weak</Text></View>
    <View style={{ alignItems: "center", gap: 4 }}><EvidenceDot level="absent" /><Text style={styles.captionLabel}>absent</Text></View>
  </View>
</Section>
```

Add to `styles`:
```typescript
captionLabel: { ...TextStyles.caption, color: Colors.ink3, fontSize: 10 },
```

```bash
pnpm --filter @wellcore/mobile typecheck
git add packages/shared apps/mobile
git commit -m "feat: EvidenceDot indicator + shared evidence-level mapping (4 vitest tests)"
```

---

## Task 12: ChamberTypeSelector

**Files:**
- Create: `apps/mobile/src/components/onboarding/ChamberTypeSelector.tsx`
- Modify: `apps/mobile/app/design-system.tsx`

**Step 1: Create `apps/mobile/src/components/onboarding/ChamberTypeSelector.tsx`**

```tsx
import { Pressable, Text, View, StyleSheet } from "react-native";
import { Colors, Spacing, TextStyles, Radius } from "../../theme/index.js";

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
```

**Step 2: Showcase**

```tsx
import { useState } from "react";
import { ChamberTypeSelector, type ChamberType } from "../src/components/onboarding/ChamberTypeSelector.js";

// Inside DesignSystem(), with the existing imports:
const [chamber, setChamber] = useState<ChamberType | null>(null);

<Section title="ChamberTypeSelector">
  <ChamberTypeSelector value={chamber} onChange={setChamber} />
</Section>
```

**Step 3: Typecheck + commit**

```bash
pnpm --filter @wellcore/mobile typecheck
git add apps/mobile
git commit -m "feat(mobile): ChamberTypeSelector for onboarding step"
```

---

## Task 13: FireSafetySlide (FDA Aug 2025 mandatory content)

**Files:**
- Create: `apps/mobile/src/components/onboarding/FireSafetySlide.tsx`
- Modify: `apps/mobile/app/design-system.tsx`

**Step 1: Create `apps/mobile/src/components/onboarding/FireSafetySlide.tsx`**

```tsx
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Colors, Spacing, TextStyles, Radius } from "../../theme/index.js";
import { IconCheck } from "../icons/index.js";

const RULES: { title: string; body: string }[] = [
  { title: "100% cotton clothing only", body: "No synthetic fabrics, no nylon, no polyester. Static buildup is the leading fire risk inside oxygen-rich chambers." },
  { title: "No cosmetics, lotions, or hair products", body: "Skin/hair products may be flammable in pressurized oxygen. Wash off before each session." },
  { title: "No electronics inside", body: "Phones, tablets, watches, and battery-powered devices stay outside. Loose batteries are an ignition source." },
  { title: "Hydrate beforehand", body: "Dehydration increases fatigue and ear-equalization difficulty. Drink water 30 minutes prior." },
  { title: "Dissipate static before entry", body: "Touch a grounded metal surface immediately before stepping in." },
  { title: "Adequate ventilation", body: "Run the chamber in a well-ventilated room, away from heat sources, candles, or open flame." },
];

type Props = {
  onAcknowledge?: () => void;
};

export function FireSafetySlide({ onAcknowledge }: Props) {
  return (
    <View style={styles.root}>
      <View style={styles.banner}>
        <Text style={styles.bannerLabel}>Important · Required reading</Text>
        <Text style={styles.bannerTitle}>Fire safety in oxygen-rich environments</Text>
        <Text style={styles.bannerBody}>
          Hyperbaric chambers are oxygen-enriched environments. The following rules are required by safety guidance from the FDA (August 2025) and follow chamber-manufacturer manuals. Acknowledge before continuing.
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ gap: Spacing.md, paddingVertical: Spacing.md }}>
        {RULES.map((r) => (
          <View key={r.title} style={styles.rule}>
            <View style={styles.ruleIcon}><IconCheck size={16} color={Colors.disclaimerText} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.ruleTitle}>{r.title}</Text>
              <Text style={styles.ruleBody}>{r.body}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.md, flex: 1 },
  banner: {
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    backgroundColor: Colors.disclaimerBg,
    borderWidth: 1,
    borderColor: Colors.disclaimerBorder,
    gap: Spacing.sm,
  },
  bannerLabel: { ...TextStyles.eyebrow, color: Colors.disclaimerText },
  bannerTitle: { ...TextStyles.h2, color: Colors.disclaimerText },
  bannerBody: { ...TextStyles.body, color: Colors.disclaimerText },
  rule: { flexDirection: "row", gap: Spacing.md, alignItems: "flex-start" },
  ruleIcon: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.disclaimerBg, alignItems: "center", justifyContent: "center" },
  ruleTitle: { ...TextStyles.h3, color: Colors.ink },
  ruleBody: { ...TextStyles.body, color: Colors.ink2, marginTop: 2 },
});
```

**Note:** the `onAcknowledge` prop is currently unused — it's reserved for the wired-up onboarding flow in Faz 3 (the actual screen will render an acknowledgment button below this slide). Keep the prop in the API now to avoid a breaking change later.

**Step 2: Showcase**

```tsx
import { FireSafetySlide } from "../src/components/onboarding/FireSafetySlide.js";

<Section title="FireSafetySlide">
  <View style={{ height: 520, borderRadius: Radius.xl, overflow: "hidden" }}>
    <FireSafetySlide />
  </View>
</Section>
```

**Step 3: Typecheck + commit**

```bash
pnpm --filter @wellcore/mobile typecheck
git add apps/mobile
git commit -m "feat(mobile): FireSafetySlide (mandatory FDA Aug 2025 content)"
```

---

## Task 14: CrisisResourcesScreen (US 988 + TR 182)

**Files:**
- Create: `apps/mobile/src/components/onboarding/CrisisResourcesScreen.tsx`
- Modify: `apps/mobile/app/design-system.tsx`

**Step 1: Create `apps/mobile/src/components/onboarding/CrisisResourcesScreen.tsx`**

```tsx
import { Linking, Pressable, Text, View, StyleSheet } from "react-native";
import { Colors, Spacing, TextStyles, Radius } from "../../theme/index.js";

type Resource = {
  region: string;
  name: string;
  phone: string;
  text?: string;
};

const RESOURCES: Resource[] = [
  { region: "United States", name: "988 Suicide & Crisis Lifeline", phone: "988", text: "Text \"HELLO\" to 741741" },
  { region: "United States", name: "Crisis Text Line", phone: "", text: "Text HOME to 741741" },
  { region: "Türkiye", name: "İntihar Önleme Hattı", phone: "182" },
  { region: "Türkiye", name: "Acil Yardım", phone: "112" },
];

export function CrisisResourcesScreen() {
  return (
    <View style={styles.root}>
      <View style={styles.banner}>
        <Text style={styles.bannerLabel}>You are not alone</Text>
        <Text style={styles.bannerTitle}>If you are in crisis, reach out now.</Text>
        <Text style={styles.bannerBody}>
          Wellcore is a wellness companion — it cannot help in a mental-health emergency. The resources below connect you with trained counselors, free of charge, anytime.
        </Text>
      </View>

      <View style={{ gap: Spacing.sm }}>
        {RESOURCES.map((r) => (
          <View key={`${r.region}-${r.name}`} style={styles.card}>
            <Text style={styles.region}>{r.region}</Text>
            <Text style={styles.name}>{r.name}</Text>
            <View style={styles.actions}>
              {r.phone && (
                <Pressable onPress={() => Linking.openURL(`tel:${r.phone}`)} style={styles.action}>
                  <Text style={styles.actionText}>Call {r.phone}</Text>
                </Pressable>
              )}
              {r.text && (
                <Text style={styles.note}>{r.text}</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: Spacing.md },
  banner: {
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    backgroundColor: Colors.crisisBg,
    borderWidth: 1,
    borderColor: Colors.crisisBorder,
    gap: Spacing.sm,
  },
  bannerLabel: { ...TextStyles.eyebrow, color: Colors.crisisText },
  bannerTitle: { ...TextStyles.h2, color: Colors.crisisText },
  bannerBody: { ...TextStyles.body, color: Colors.crisisText },
  card: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.bgElev,
    borderWidth: 1,
    borderColor: Colors.hairline,
    gap: 4,
  },
  region: { ...TextStyles.eyebrow, color: Colors.ink3 },
  name: { ...TextStyles.h3, color: Colors.ink },
  actions: { flexDirection: "row", gap: Spacing.md, marginTop: Spacing.sm, alignItems: "center" },
  action: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.pill,
    backgroundColor: Colors.crisisText,
  },
  actionText: { ...TextStyles.button, color: Colors.bg } as never, // TextStyles.button keys may need extension; ts may need TextStyles fallback to body
  note: { ...TextStyles.caption, color: Colors.ink3 },
});
```

**Note:** if `TextStyles.button` is not defined yet (the original Faz 0 typography didn't include a button variant), replace `...TextStyles.button` with `fontFamily: FontFamily.sansSemibold, fontSize: 14, letterSpacing: 0.5` and import `FontFamily` from theme.

**Step 2: Showcase**

```tsx
import { CrisisResourcesScreen } from "../src/components/onboarding/CrisisResourcesScreen.js";

<Section title="CrisisResourcesScreen">
  <CrisisResourcesScreen />
</Section>
```

**Step 3: Typecheck + commit**

```bash
pnpm --filter @wellcore/mobile typecheck
git add apps/mobile
git commit -m "feat(mobile): CrisisResourcesScreen (US 988 + TR 182)"
```

---

## Task 15: Final sweep + simulator validation + PR

**Step 1: Full happy path from clean state**

```bash
cd /Users/sencersoylu/Projects/wellcore
pnpm clean
pnpm install
docker compose -f ops/docker-compose.yml up -d
pnpm typecheck
pnpm --filter @wellcore/shared test
pnpm --filter @wellcore/api test
```

Expected:
- typecheck passes for all 3 workspaces
- shared: 7 tests passing (3 citations + 4 evidence)
- api: 1 test passing (/health)

**Step 2: Run on iOS simulator + visit `/design-system`**

```bash
cd apps/mobile && pnpm exec expo start --port 8090
```

Press `i` to launch the iOS simulator. Once the dev splash loads, navigate to the design-system route either:
- via browser at `http://localhost:8090/design-system` (web mode), OR
- by typing `wellcore://design-system` in the simulator's deep-link, OR
- by temporarily editing `apps/mobile/app/index.tsx` to `import { Link } from "expo-router"` and adding a `<Link href="/design-system">Design system</Link>` button at the bottom (don't commit this).

Verify:
- Atrium mark renders at all 5 sizes (xs..xl).
- Wordmark variants render (italic / non-italic / mark hidden).
- Single Ring fills smoothly (78%, 42%, 62%).
- TripleRing animates with staggered fills (Adherence amber outer, Recovery sage middle, Vitality terracotta inner).
- HeroGradient renders both linear and bloom variants.
- Icon set (13 icons) renders cleanly.
- CitedText opens citation modal — DOI block, "what this study does not show" caution, source attribution.
- EvidenceDot renders 4 levels.
- ChamberTypeSelector toggles cleanly between 3 options.
- FireSafetySlide renders with disclaimer banner + 6 rules.
- CrisisResourcesScreen renders with banner + 4 resources.

If any item fails on simulator, fix before continuing.

**Step 3: Update root README**

Append a "Design system" section to `README.md`:

```markdown
## Design system showcase

Visit \`/design-system\` in the running app to view all primitives.

\`\`\`bash
pnpm exec --filter @wellcore/mobile expo start --port 8090
# then navigate to /design-system
\`\`\`
```

Commit:

```bash
git add README.md
git commit -m "docs: design-system route note in README"
```

**Step 4: Push + open PR**

```bash
git push -u origin faz-1
gh pr create --base main --head faz-1 --title "Faz 1: Wellcore design system" --body "$(cat <<'EOF'
## Summary

Wellcore Faz 1 — design system primitives, v2 research-driven components, and asset pipeline.

- Brand: WellcoreMark size variants, WellcoreWordmark composite, animated Ring, TripleRing, HeroGradient
- v2 components: CitedText with bottom-sheet citation modal, EvidenceDot indicator, ChamberTypeSelector, FireSafetySlide, CrisisResourcesScreen
- Citations data layer in @wellcore/shared with Zod validation (3 vitest tests)
- Evidence-level mapping in @wellcore/shared (4 vitest tests)
- 13-icon line set (custom SVG paths)
- Real Atrium app icons generated from SVG via sharp (replaces 1×1 placeholders)
- Dev-only \`/design-system\` route renders every primitive

## Test plan
- [x] \`pnpm typecheck\` all 3 workspaces
- [x] \`pnpm --filter @wellcore/shared test\` 7 passing
- [x] \`pnpm --filter @wellcore/api test\` 1 passing
- [x] Real assets generated (\`pnpm gen:assets\`)
- [x] \`/design-system\` route renders all primitives on iOS simulator

## Next phase
Faz 2 — Backend core: Drizzle schemas, better-auth (Apple web OAuth), endpoints, MinIO presigned URLs, structured wellness_checkins, consent_events, suicidality_screens, subscription tables, citations static endpoint.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Done — handoff to Faz 2

After this branch merges, proceed to **Faz 2 — Backend core**. Plan file:
`docs/plans/2026-XX-XX-wellcore-faz-2-backend-core.md` (to be authored after Faz 1 ships).
