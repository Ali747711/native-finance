import PostHog from "posthog-react-native";

const projectToken = process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST;

// Narrowed inline rather than via a `Boolean(...)` const. TypeScript doesn't
// carry a boolean's implications back to the values it was derived from, so the
// previous `isConfigured` guard left both of these as `string | undefined` at the
// constructor call.
const isConfigured = projectToken !== undefined && host !== undefined;

if (!isConfigured && typeof __DEV__ !== "undefined" && __DEV__) {
  console.error(
    "EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN is configured"
  );
}

export const posthog =
  projectToken && host
    ? new PostHog(projectToken, {
        host,
        captureAppLifecycleEvents: true,
        preloadFeatureFlags: true,
        errorTracking: {
          autocapture: {
            uncaughtExceptions: true,
            unhandledRejections: true,
          },
        },
      })
    : null;
