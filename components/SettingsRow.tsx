import { colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import clsx from "clsx";
import { Pressable, Text, View } from "react-native";

export default function SettingsRow({
  icon,
  label,
  value,
  soon = false,
  onPress,
}: SettingsRowProps) {
  const isInteractive = Boolean(onPress) && !soon;

  const body = (
    <>
      <View className="settings-row-icon">
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>

      <View className="settings-row-copy">
        <Text className="settings-row-label">{label}</Text>
        {value ? (
          <Text className="settings-row-value" numberOfLines={1}>
            {value}
          </Text>
        ) : null}
      </View>

      {soon ? (
        <View className="settings-soon">
          <Text className="settings-soon-text">Soon</Text>
        </View>
      ) : isInteractive ? (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={colors.mutedForeground}
        />
      ) : null}
    </>
  );

  // A plain View when there's nothing to tap, so read-only rows don't advertise
  // a press target to touch or to screen readers.
  if (!isInteractive) {
    return (
      <View className={clsx("settings-row", soon && "settings-row-muted")}>
        {body}
      </View>
    );
  }

  return (
    <Pressable
      className="settings-row"
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={`Opens ${label.toLowerCase()} settings`}
    >
      {body}
    </Pressable>
  );
}
