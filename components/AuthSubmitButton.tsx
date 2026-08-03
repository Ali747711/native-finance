import { colors } from "@/constants/theme";
import clsx from "clsx";
import { ActivityIndicator, Pressable, Text } from "react-native";

export default function AuthSubmitButton({
  label,
  onPress,
  loading = false,
  disabled = false,
}: AuthSubmitButtonProps) {
  const isBlocked = loading || disabled;

  return (
    <Pressable
      className={clsx("auth-button", isBlocked && "auth-button-disabled")}
      onPress={onPress}
      disabled={isBlocked}
      accessibilityRole="button"
      accessibilityState={{ disabled: isBlocked, busy: loading }}
    >
      {loading ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <Text className="auth-button-text">{label}</Text>
      )}
    </Pressable>
  );
}
