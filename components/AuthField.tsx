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
        // Spread first so everything below wins. These are the field's own
        // contract — theme-consistent placeholder, the visible label, and an
        // error the screen reader can reach — and a caller must not be able to
        // silently replace them. Every other TextInput prop passes through.
        {...inputProps}
        className={clsx("auth-input", hasError && "auth-input-error")}
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.mutedForeground}
        accessibilityLabel={label}
        // React Native has no `aria-invalid`, so the error rides along as a
        // hint — otherwise a screen reader announces the field with no sign
        // that a visible error sits directly beneath it. Falls back to any
        // caller-supplied hint when there's no error to report.
        accessibilityHint={error ?? inputProps.accessibilityHint}
      />
      {error ? (
        <Text className="auth-error">{error}</Text>
      ) : helper ? (
        <Text className="auth-helper">{helper}</Text>
      ) : null}
    </View>
  );
}
