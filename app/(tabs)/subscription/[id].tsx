import { Link, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function SubscriptionDetails() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <View>
      <Text>Subscription Details: {id}</Text>
      <Link href="/subscription">Go back</Link>
    </View>
  );
}
