import { useAuth } from "@clerk/expo";
import { Redirect, Stack } from "expo-router";

export default function AuthLayout() {
  const { isLoaded, isSignedIn } = useAuth();

  // Render nothing rather than the form while Clerk rehydrates the session from
  // secure storage — otherwise a returning user sees a flash of the sign-in
  // screen before being bounced to the app.
  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/" />;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
