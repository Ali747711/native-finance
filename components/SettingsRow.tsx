import { colors } from "@/constants/theme";
import Ionicons from "@expo/vector-icons/Ionicons";
import clsx from "clsx";
import { Text, View } from "react-native";

export default function SettingsRow({
  icon,
  label,
  value,
  soon = false,
}: SettingsRowProps) {
  return (
    <View className={clsx("settings-row", soon && "settings-row-muted")}>
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
      ) : null}
    </View>
  );
}
