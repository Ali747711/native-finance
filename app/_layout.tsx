import "@/global.css";
import { ClerkProvider, useAuth, useUser } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { PostHogProvider } from "posthog-react-native";
import { useEffect, useRef } from "react";
import { posthog } from "../lib/posthog";

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
  const { user } = useUser();
  const identifiedUserId = useRef<string | null>(null);

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

  useEffect(() => {
    if (!isAuthLoaded || !posthog) {
      return;
    }

    if (!user) {
      if (identifiedUserId.current) {
        // Clerk has ended the active session. Clear the persisted identity so a
        // later account cannot inherit this user's analytics state.
        posthog.reset();
        identifiedUserId.current = null;
      }
      return;
    }

    if (identifiedUserId.current === user.id) {
      return;
    }

    // Clerk's immutable resource ID is the stable distinct ID. Human-readable
    // fields remain person properties, never event properties.
    posthog.identify(user.id, {
      $set: {
        ...(user.primaryEmailAddress?.emailAddress
          ? { email: user.primaryEmailAddress.emailAddress }
          : {}),
        ...(user.fullName ? { name: user.fullName } : {}),
      },
    });
    identifiedUserId.current = user.id;
  }, [isAuthLoaded, user]);

  // Stays behind the splash rather than dismissing early. The (tabs) and (auth)
  // layouts both render null until auth resolves, so hiding on fonts alone would
  // expose a blank frame between splash teardown and first meaningful paint.
  if (!isReady) {
    return null;
  }

  const navigation = <Stack screenOptions={{ headerShown: false }} />;

  return posthog ? (
    <PostHogProvider client={posthog}>{navigation}</PostHogProvider>
  ) : (
    navigation
  );
}
