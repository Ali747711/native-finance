import CreateSubscriptionModal from "@/components/CreateSubscriptionModal";
import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import { HOME_BALANCE, UPCOMING_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import { useSubscriptions } from "@/lib/subscription-store";
import { resolveUserDisplayName } from "@/lib/user";
import { formatCurrency } from "@/lib/utils";
import { useUser } from "@clerk/expo";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { SafeAreaView as RNNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNNSafeAreaView);
export default function Home() {
  const { user } = useUser();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const { subscriptions, addSubscription } = useSubscriptions();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const displayName = resolveUserDisplayName(user);
  // Clerk always returns an `imageUrl` — a generated initials avatar when the
  // user hasn't uploaded one — so the bundled asset only covers the brief window
  // before the user resource resolves.
  const avatarSource = user?.imageUrl
    ? { uri: user.imageUrl }
    : images.avatar;

  return (
    <SafeAreaView className="flex-1 p-5 bg-background">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              {/*
                `shrink` + `numberOfLines` because real names are variable
                length, unlike the fixture they replaced — without them a long
                name pushes the add button off the right edge.
              */}
              <View className="home-user shrink">
                <Image source={avatarSource} className="home-avatar" />
                <Text className="home-user-name shrink" numberOfLines={1}>
                  {displayName}
                </Text>
              </View>
              <Pressable
                onPress={() => setIsCreateOpen(true)}
                accessibilityRole="button"
                accessibilityLabel="Add a subscription"
                hitSlop={8}
              >
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>

              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>

                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MMM D, YYYY")}
                </Text>
              </View>
            </View>

            <View className="mb-5">
              <ListHeading title="Upcoming" />
              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard {...item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No upcoming subscriptions
                  </Text>
                }
              />
            </View>
            <ListHeading title="Subscriptions" />
          </>
        )}
        data={subscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() =>
              setExpandedSubscriptionId((currentId) =>
                currentId === item.id ? null : item.id,
              )
            }
          />
        )}
        ItemSeparatorComponent={() => <View className="h-4" />}
        ListEmptyComponent={
          <Text className="home-empty-state">No subscriptions</Text>
        }
        extraData={expandedSubscriptionId}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-20"
      />

      <CreateSubscriptionModal
        visible={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={addSubscription}
      />
    </SafeAreaView>
  );
}
