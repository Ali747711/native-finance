import CategoryChips from "@/components/CategoryChips";
import SearchField from "@/components/SearchField";
import SubscriptionCard from "@/components/SubscriptionCard";
import { useSubscriptions } from "@/lib/subscription-store";
import {
  ALL_CATEGORIES,
  filterSubscriptions,
  listCategories,
} from "@/lib/subscriptions";
import { styled } from "nativewind";
import { useMemo, useState } from "react";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView as RNNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNNSafeAreaView);

const countLabel = (count: number): string =>
  `${count} subscription${count === 1 ? "" : "s"}`;

export default function Subscription() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORIES);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { subscriptions } = useSubscriptions();

  // Both derive from `subscriptions`, so a newly created one shows up here and
  // its category joins the chip row without a reload.
  const categories = useMemo(() => listCategories(subscriptions), [subscriptions]);
  const results = useMemo(
    () => filterSubscriptions(subscriptions, query, activeCategory),
    [subscriptions, query, activeCategory]
  );

  const isFiltered =
    query.trim().length > 0 || activeCategory !== ALL_CATEGORIES;

  return (
    <SafeAreaView className="subs-screen" edges={["top"]}>
      {/*
        Search and chips sit outside the FlatList on purpose. Passing them via
        `ListHeaderComponent={() => ...}` hands React a new component type on
        every render, which remounts the TextInput and drops focus after each
        keystroke. Keeping them fixed also leaves search reachable mid-scroll.
      */}
      <View className="subs-header">
        <Text className="subs-heading">Subscriptions</Text>

        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder="Search by name, plan or category"
          accessibilityLabel="Search subscriptions"
        />

        <CategoryChips
          categories={categories}
          activeCategory={activeCategory}
          onSelect={setActiveCategory}
        />
      </View>

      <Text className="subs-count">
        {isFiltered
          ? `${results.length} of ${countLabel(subscriptions.length)}`
          : countLabel(subscriptions.length)}
      </Text>

      <FlatList
        className="subs-list"
        contentContainerClassName="subs-list-content"
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedId === item.id}
            onPress={() =>
              setExpandedId((current) => (current === item.id ? null : item.id))
            }
          />
        )}
        ItemSeparatorComponent={() => <View className="h-4" />}
        // Without this the card rows don't re-render when only `expandedId`
        // changes, since the row data objects are referentially identical.
        extraData={expandedId}
        // Lets a card be tapped directly while the keyboard is open, instead of
        // the first tap only dismissing it.
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="subs-empty">
            <Text className="subs-empty-title">
              {isFiltered ? "No matches" : "Nothing here yet"}
            </Text>
            <Text className="subs-empty-copy">
              {isFiltered
                ? "Try a different search, or clear the filters to see everything."
                : "Subscriptions you add will show up here."}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
