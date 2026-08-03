import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function AuthFooterLink({
  copy,
  actionLabel,
  href,
}: AuthFooterLinkProps) {
  return (
    <View className="auth-link-row">
      <Text className="auth-link-copy">{copy}</Text>
      <Link href={href} className="auth-link" replace>
        {actionLabel}
      </Link>
    </View>
  );
}
