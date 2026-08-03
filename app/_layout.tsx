import "@/global.css";
import { ClerkProvider, useAuth } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";

/**
 * Claims control of the native splash screen.
 *
 * expo-router auto-hides it once the navigator reports ready, which would land
 * mid-startup while Clerk is still rehydrating. Calling this makes the explicit
 * `hideAsync()` in `AppShell` the only dismissal point. It sits at module scope
 * in the root layout so it runs before any route module renders.
 */
SplashScreen.preventAutoHideAsync().catch(() => {
  // Best-effort. If the native module is unavailable or the splash is already
  // gone, the app should still boot — swallowing here beats an unhandled
  // rejection over a screen the user has stopped looking at.
});

/**
 * Fails at startup rather than letting Clerk boot with an undefined key and
 * surface as a confusing network error on the first sign-in attempt.
 */
const readPublishableKey = (): string => {
  const key = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!key) {
    throw new Error(
      "Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY. Add it to your .env file."
    );
  }

  return key;
};

const publishableKey = readPublishableKey();

export default function RootLayout() {
  // ClerkProvider is deliberately outside the readiness gate. It renders its
  // children immediately, so Clerk's session rehydration from SecureStore runs
  // in parallel with font loading rather than starting only after fonts finish.
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <AppShell />
    </ClerkProvider>
  );
}

function AppShell() {
  const [fontsLoaded, fontError] = useFonts({
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
  });
  const { isLoaded: isAuthLoaded } = useAuth();

  // A font failure resolves as ready on purpose. `fontsLoaded` never flips true
  // in that case, and holding the splash forever is a worse outcome than
  // rendering with the system typeface.
  const isReady = (fontsLoaded || Boolean(fontError)) && isAuthLoaded;

  useEffect(() => {
    if (isReady) {
      // Same reasoning as the prevent call above: a failure to dismiss must not
      // surface as an unhandled rejection.
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isReady]);

  useEffect(() => {
    if (fontError && typeof __DEV__ !== "undefined" && __DEV__) {
      console.warn("Fonts failed to load; falling back to system.", fontError);
    }
  }, [fontError]);

  // Stays behind the splash rather than dismissing early. The (tabs) and (auth)
  // layouts both render null until auth resolves, so hiding on fonts alone would
  // expose a blank frame between splash teardown and first meaningful paint.
  if (!isReady) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
