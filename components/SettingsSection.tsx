import clsx from "clsx";
import { Children } from "react";
import { Text, View } from "react-native";

/**
 * Groups rows into one bordered card under a section label.
 *
 * Dividers are derived from child position rather than passed in per row —
 * NativeWind can't express `:not(:first-child)`, and threading an `isFirst` prop
 * through every call site is the kind of bookkeeping that goes stale the moment
 * a row is reordered.
 */
export default function SettingsSection({
  title,
  children,
}: SettingsSectionProps) {
  const rows = Children.toArray(children);

  return (
    <View className="settings-section">
      <Text className="settings-section-title">{title}</Text>
      <View className="settings-card">
        {rows.map((row, index) => (
          <View
            key={index}
            className={clsx(index > 0 && "settings-row-divider")}
          >
            {row}
          </View>
        ))}
      </View>
    </View>
  );
}
