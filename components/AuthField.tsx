import { colors } from "@/constants/theme";
import clsx from "clsx";
import { Text, TextInput, View } from "react-native";

export default function AuthField({
  label,
  value,
  onChangeText,
  error,
  helper,
  ...inputProps
}: AuthFieldProps) {
  const hasError = Boolean(error);

  return (
    <View className="auth-field">
      <Text className="auth-label">{label}</Text>
      <TextInput
        className={clsx("auth-input", hasError && "auth-input-error")}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.mutedForeground}
        accessibilityLabel={label}
        // React Native has no `aria-invalid`, so the error rides along as a
        // hint — otherwise a screen reader announces the field with no sign
        // that a visible error sits directly beneath it.
        accessibilityHint={error ?? inputProps.accessibilityHint}
        {...inputProps}
      />
      {error ? (
        <Text className="auth-error">{error}</Text>
      ) : helper ? (
        <Text className="auth-helper">{helper}</Text>
      ) : null}
    </View>
  );
}
