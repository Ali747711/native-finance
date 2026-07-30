import { Link } from "expo-router";
import { Text, View } from "react-native";
export default function SignIn() {
  return (
    <View>
      <Text>sign-in</Text>
      <Link
        href="/sign-up"
        className="text-lg bg-primary text-white rounded-2xl mt-4 px-4 py-2"
      >
        Sign Up
      </Link>
    </View>
  );
}
