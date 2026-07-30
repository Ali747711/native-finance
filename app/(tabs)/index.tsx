import { Link } from "expo-router";
import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNNSafeAreaView);
export default function Home() {
  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
      <Text className="text-xl font-bold text-success">
        Welcome to Nativewind!
      </Text>
      <Link
        href="/onboarding"
        className="mt-4 text-lg  rounded-2xl bg-primary text-white px-4 py-2"
      >
        Go to onboarding
      </Link>
      <Link
        href="/sign-up"
        className="mt-4 text-lg  rounded-2xl bg-primary text-white px-4 py-2"
      >
        Sign Up
      </Link>
      <Link
        href="/sign-in"
        className="mt-4 text-lg  rounded-2xl bg-primary text-white px-4 py-2"
      >
        Sign In
      </Link>

      <Link href="/subscription/spotify">Spotify Subscription</Link>
      <Link
        href={{ pathname: "/subscription/[id]", params: { id: "netflix" } }}
      >
        Netflix Subscription
      </Link>
    </SafeAreaView>
  );
}
