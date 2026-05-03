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
        <BottomSheetView style={styles.sheet}>
          <View />
        </BottomSheetView>
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
