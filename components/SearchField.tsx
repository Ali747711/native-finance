import { colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, TextInput, View } from "react-native";

export default function SearchField({
  value,
  onChangeText,
  placeholder = "Search",
  accessibilityLabel,
}: SearchFieldProps) {
  return (
    <View className="search-field">
      <Ionicons name="search" size={18} color={colors.mutedForeground} />

      <TextInput
        className="search-input"
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.mutedForeground}
        accessibilityLabel={accessibilityLabel}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        // `never` keeps the OS clear button from doubling up with ours on iOS.
        clearButtonMode="never"
      />

      {value.length > 0 ? (
        <Pressable
          className="search-clear"
          onPress={() => onChangeText("")}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          // The glyph is small; widen the touch target to a usable size.
          hitSlop={8}
        >
          <Ionicons name="close" size={14} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}
