import { type PropsWithChildren } from "react";
import { ScrollView, View, Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { Colors, Spacing, TextStyles } from "../../theme/index";
import { ProgressDots } from "./ProgressDots";

type Props = PropsWithChildren<{
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  showBack?: boolean;
  footer: React.ReactNode;
}>;

export function OnboardingShell({ step, totalSteps, title, subtitle, showBack = true, footer, children }: Props) {
  const router = useRouter();
  return (
    <View style={styles.root}>
      <View style={styles.header}>
        {showBack ? (
          <Pressable onPress={() => router.back()} accessibilityRole="button" hitSlop={12}>
            <Text style={styles.back}>{"‹"}</Text>
          </Pressable>
        ) : <View style={{ width: 24 }} />}
        <ProgressDots total={totalSteps} index={step - 1} />
        <View style={{ width: 24 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        <View style={{ height: Spacing.lg }} />
        {children}
      </ScrollView>
      <View style={styles.footer}>{footer}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingTop: Spacing.screenTop, paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm },
  back: { ...TextStyles.h1, color: Colors.ink, fontSize: 32, lineHeight: 32 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl },
  title: { ...TextStyles.h1, color: Colors.ink, marginTop: Spacing.md },
  subtitle: { ...TextStyles.body, color: Colors.ink3, marginTop: Spacing.sm },
  footer: { padding: Spacing.lg, gap: Spacing.sm, borderTopColor: Colors.hairline, borderTopWidth: StyleSheet.hairlineWidth, backgroundColor: Colors.bg },
});
