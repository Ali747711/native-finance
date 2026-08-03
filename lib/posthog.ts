import PostHog from "posthog-react-native";

const projectToken = process.env.EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN;
const host = process.env.EXPO_PUBLIC_POSTHOG_HOST;

// Truthiness, not `!== undefined`. An empty string is what a declared-but-blank
// `.env` entry produces, and it must count as unconfigured — otherwise the client
// below stays null while this warning is suppressed, which is the worst pairing:
// analytics silently off and nothing said about it.
const isConfigured = Boolean(projectToken && host);

if (!isConfigured && typeof __DEV__ !== "undefined" && __DEV__) {
  console.error(
    "PostHog is disabled: EXPO_PUBLIC_POSTHOG_PROJECT_TOKEN and EXPO_PUBLIC_POSTHOG_HOST must both be set to non-empty values. Events are being silently dropped until both are configured in your .env file."
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
