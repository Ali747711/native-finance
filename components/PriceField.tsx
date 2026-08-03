import { colors } from "@/constants/theme";
import clsx from "clsx";
import { Text, TextInput, View } from "react-native";

/**
 * Amount input with the currency symbol rendered inside the box.
 *
 * Deliberately not `AuthField` with a "$" placeholder: a placeholder disappears
 * the moment the user types, exactly when they need confirmation of the unit.
 * The classes mirror `auth-input` so the box is visually identical to every
 * other field in the app.
 */
export default function PriceField({
  label,
  value,
  onChangeText,
  error,
  onSubmitEditing,
}: PriceFieldProps) {
  const hasError = Boolean(error);

  return (
    <View className="auth-field">
      <Text className="auth-label">{label}</Text>

      <View className={clsx("price-input-row", hasError && "auth-input-error")}>
        <Text className="price-prefix">$</Text>
        <TextInput
          className="price-input"
          value={value}
          onChangeText={onChangeText}
          placeholder="0.00"
          placeholderTextColor={colors.mutedForeground}
          keyboardType="decimal-pad"
          returnKeyType="done"
          onSubmitEditing={onSubmitEditing}
          accessibilityLabel={label}
          accessibilityHint={error}
        />
      </View>

      {error ? <Text className="auth-error">{error}</Text> : null}
    </View>
  );
}
