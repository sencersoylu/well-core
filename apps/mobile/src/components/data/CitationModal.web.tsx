import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Colors, Radius, Spacing, TextStyles } from "../../theme/index";
import { useCitation } from "./CitationProvider";

export function CitationModal() {
  const { current, close } = useCitation();
  if (!current) return null;

  const doi = current.source.doi;
  const pmid = current.source.pmid;
  const url = doi
    ? `https://doi.org/${doi}`
    : pmid
      ? `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`
      : current.source.url;

  return (
    <Modal transparent visible animationType="fade" onRequestClose={close}>
      <Pressable style={styles.scrim} onPress={close}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <ScrollView contentContainerStyle={styles.content}>
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
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: Colors.bgElev,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: "70%",
  },
  content: { padding: Spacing.lg, gap: Spacing.md },
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
