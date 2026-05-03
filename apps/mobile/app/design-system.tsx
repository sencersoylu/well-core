import { ScrollView, Text, View, StyleSheet } from "react-native";
import { useState } from "react";
import type { ReactNode } from "react";
import { Colors, Spacing, TextStyles, Radius } from "../src/theme/index.js";
import { WellcoreMark } from "../src/components/WellcoreMark.js";
import { WellcoreWordmark } from "../src/components/brand/WellcoreWordmark.js";
import { Ring } from "../src/components/brand/Ring.js";
import { TripleRing } from "../src/components/brand/TripleRing.js";
import { HeroGradient } from "../src/components/brand/HeroGradient.js";
import * as Icons from "../src/components/icons/index.js";
import { CitedText } from "../src/components/data/CitedText.js";
import { EvidenceDot } from "../src/components/data/EvidenceDot.js";
import { ChamberTypeSelector, type ChamberType } from "../src/components/onboarding/ChamberTypeSelector.js";
import { FireSafetySlide } from "../src/components/onboarding/FireSafetySlide.js";
import { CrisisResourcesScreen } from "../src/components/onboarding/CrisisResourcesScreen.js";

export default function DesignSystem() {
  const [chamber, setChamber] = useState<ChamberType | null>(null);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Design system</Text>
      <Text style={styles.subtitle}>Wellcore primitives showcase</Text>

      <Section title="Mark — Atrium logo">
        <View style={styles.row}>
          <WellcoreMark size="xs" />
          <WellcoreMark size="sm" />
          <WellcoreMark size="md" />
          <WellcoreMark size="lg" />
          <WellcoreMark size="xl" />
        </View>
      </Section>

      <Section title="Wordmark">
        <WellcoreWordmark size="sm" />
        <WellcoreWordmark size="md" />
        <WellcoreWordmark size="lg" />
        <WellcoreWordmark size="md" italic={false} />
        <WellcoreWordmark size="md" showMark={false} />
      </Section>

      <Section title="Ring (single, animated)">
        <View style={styles.row}>
          <Ring value={0.78} color={Colors.recovery}>
            <Text style={{ ...TextStyles.h2, color: Colors.ink }}>78</Text>
          </Ring>
          <Ring value={0.42} color={Colors.adherence} size={96} stroke={8} />
          <Ring value={0.62} color={Colors.vitality} size={80} stroke={6} />
        </View>
      </Section>

      <Section title="TripleRing — Adherence / Recovery / Vitality">
        <TripleRing adherence={0.84} recovery={0.62} vitality={0.71} />
      </Section>

      <Section title="HeroGradient">
        <HeroGradient style={{ height: 140, borderRadius: 24 }}>
          <View style={{ flex: 1 }} />
        </HeroGradient>
        <HeroGradient bloom style={{ height: 180, borderRadius: 24 }}>
          <View style={{ flex: 1 }} />
        </HeroGradient>
      </Section>

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

      <Section title="EvidenceDot">
        <View style={styles.row}>
          <View style={{ alignItems: "center", gap: 4 }}>
            <EvidenceDot level="strong" />
            <Text style={styles.captionLabel}>strong</Text>
          </View>
          <View style={{ alignItems: "center", gap: 4 }}>
            <EvidenceDot level="moderate" />
            <Text style={styles.captionLabel}>moderate</Text>
          </View>
          <View style={{ alignItems: "center", gap: 4 }}>
            <EvidenceDot level="weak" />
            <Text style={styles.captionLabel}>weak</Text>
          </View>
          <View style={{ alignItems: "center", gap: 4 }}>
            <EvidenceDot level="absent" />
            <Text style={styles.captionLabel}>absent</Text>
          </View>
        </View>
      </Section>

      <Section title="ChamberTypeSelector">
        <ChamberTypeSelector value={chamber} onChange={setChamber} />
      </Section>

      <Section title="FireSafetySlide">
        <View style={{ height: 520, borderRadius: Radius.xl, overflow: "hidden" }}>
          <FireSafetySlide />
        </View>
      </Section>

      <Section title="CrisisResourcesScreen">
        <CrisisResourcesScreen />
      </Section>
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: Spacing.sm }}>
      <Text style={{ ...TextStyles.eyebrow, color: Colors.ink3 }}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: Spacing.lg, paddingTop: Spacing.screenTop, gap: Spacing.lg },
  title: { ...TextStyles.h1, color: Colors.ink },
  subtitle: { ...TextStyles.body, color: Colors.ink3 },
  row: { flexDirection: "row", alignItems: "center", gap: Spacing.md, flexWrap: "wrap" },
  captionLabel: { ...TextStyles.caption, color: Colors.ink3, fontSize: 10 },
});
