import { Pressable, Text, type TextStyle, type StyleProp } from "react-native";
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
          {index !== undefined ? ` ${index}` : " [c]"}
        </Text>
      </Pressable>
    </Text>
  );
}
