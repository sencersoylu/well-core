import "../src/i18n";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { wellcoreFontMap } from "../src/theme/fonts";
import { CitationProvider } from "../src/components/data/CitationProvider";
import { CitationModal } from "../src/components/data/CitationModal";
import { QueryProvider } from "../src/query/QueryProvider";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [loaded, error] = useFonts(wellcoreFontMap);
  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => undefined);
  }, [loaded, error]);
  if (!loaded && !error) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryProvider>
        <CitationProvider>
          <Stack screenOptions={{ headerShown: false }} />
          <CitationModal />
        </CitationProvider>
      </QueryProvider>
    </GestureHandlerRootView>
  );
}
