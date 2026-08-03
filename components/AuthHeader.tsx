import { Text, View } from "react-native";

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <View className="auth-brand-block">
      <View className="auth-logo-wrap">
        <View className="auth-logo-mark">
          <Text className="auth-logo-mark-text">R</Text>
        </View>
        <View>
          <Text className="auth-wordmark">Recurly</Text>
          {/* `.auth-wordmark-sub` applies `uppercase`, so this renders as
              "SMART BILLING" to match the design. */}
          <Text className="auth-wordmark-sub">Smart billing</Text>
        </View>
      </View>
      <Text className="auth-title">{title}</Text>
      <Text className="auth-subtitle">{subtitle}</Text>
    </View>
  );
}
