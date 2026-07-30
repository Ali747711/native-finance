import { styled } from "nativewind";
import { Text } from "react-native";
import { SafeAreaView as RNNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNNSafeAreaView);
export default function Subscription() {
  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
      <Text>Subscription</Text>
    </SafeAreaView>
  );
}
