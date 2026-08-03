import clsx from "clsx";
import { Pressable, Text, View } from "react-native";

export default function CategoryChips({
  categories,
  activeCategory,
  onSelect,
}: CategoryChipsProps) {
  return (
    <View className="category-scroll">
      {categories.map((category) => {
        const isActive = category === activeCategory;

        return (
          <Pressable
            key={category}
            className={clsx("category-chip", isActive && "category-chip-active")}
            onPress={() => onSelect(category)}
            accessibilityRole="button"
            accessibilityLabel={`Filter by ${category}`}
            accessibilityState={{ selected: isActive }}
          >
            <Text
              className={clsx(
                "category-chip-text",
                isActive && "category-chip-text-active"
              )}
            >
              {category}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
