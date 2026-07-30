import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function SignUp() {
  return (
    <View>
      <Text>SignUp</Text>
      <Link
        href="/sign-in"
        className="text-lg bg-primary text-white rounded-2xl mt-4 px-4 py-2"
      >
        Sign In
      </Link>
    </View>
  );
}
