export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 40,
  "3xl": 48,
  "4xl": 64,
  screenH: 20,
  screenTop: 60,
  screenBottom: 100,
} as const;

export const Radius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  "2xl": 32,
  pill: 999,
} as const;

export const Shadows = {
  sm: {
    shadowColor: "#1a1a1a",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: "#1a1a1a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  lg: {
    shadowColor: "#1a1a1a",
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.10,
    shadowRadius: 48,
    elevation: 12,
  },
} as const;
