import PostHog from "posthog-react-native";

const projectToken = process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST;
const isConfigured = Boolean(projectToken && host);

if (!isConfigured && typeof __DEV__ !== "undefined" && __DEV__) {
  console.error(
    "EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN variable required by PostHog is missing or un-configured, this causes events to be silently missed. This error stops appearing once EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN is configured"
  );
}

export const posthog = isConfigured
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
