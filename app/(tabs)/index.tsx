import { Link } from "expo-router";
import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNNSafeAreaView);
export default function Home() {
  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
      <Text className="text-5xl font-sans-extrabold text-primary">Home</Text>
      <Link
        href="/onboarding"
        className="mt-4 font-sans-bold text-lg  rounded-2xl bg-primary text-white px-4 py-2"
      >
        Go to onboarding
      </Link>
      <Link
        href="/sign-up"
        className="mt-4 font-sans-bold text-lg  rounded-2xl bg-primary text-white px-4 py-2"
      >
        Sign Up
      </Link>
      <Link
        href="/sign-in"
        className="mt-4 font-sans-bold text-lg  rounded-2xl bg-primary text-white px-4 py-2"
      >
        Sign In
      </Link>
    </SafeAreaView>
  );
}
