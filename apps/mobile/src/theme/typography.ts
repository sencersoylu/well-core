export const FontFamily = {
  serif: "Newsreader_400Regular",
  serifItalic: "Newsreader_400Regular_Italic",
  serifMedium: "Newsreader_500Medium",
  serifSemibold: "Newsreader_600SemiBold",
  sans: "Inter_400Regular",
  sansMedium: "Inter_500Medium",
  sansSemibold: "Inter_600SemiBold",
  sansBold: "Inter_700Bold",
} as const;

export const TextStyles = {
  display: {
    fontFamily: FontFamily.serif,
    fontSize: 56,
    letterSpacing: -2,
    lineHeight: 60,
  },
  h1: {
    fontFamily: FontFamily.serif,
    fontSize: 36,
    letterSpacing: -0.7,
    lineHeight: 38,
  },
  h2: {
    fontFamily: FontFamily.serif,
    fontSize: 26,
    letterSpacing: -0.4,
    lineHeight: 29,
  },
  h3: {
    fontFamily: FontFamily.sansSemibold,
    fontSize: 15,
    letterSpacing: -0.075,
    lineHeight: 20,
  },
  body: {
    fontFamily: FontFamily.sans,
    fontSize: 14,
    lineHeight: 21,
  },
  caption: {
    fontFamily: FontFamily.sans,
    fontSize: 12,
    lineHeight: 17,
  },
  eyebrow: {
    fontFamily: FontFamily.sansMedium,
    fontSize: 11,
    letterSpacing: 1.76,
    textTransform: "uppercase" as const,
  },
  wordmark: {
    fontFamily: FontFamily.serifItalic,
    fontSize: 22,
    letterSpacing: -0.44,
  },
} as const;

export type TextStyleToken = keyof typeof TextStyles;
