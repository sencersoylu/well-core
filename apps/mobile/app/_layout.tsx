import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { wellcoreFontMap } from "../src/theme/fonts.js";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [loaded, error] = useFonts(wellcoreFontMap);

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return <Stack screenOptions={{ headerShown: false }} />;
}
