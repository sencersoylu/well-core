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
