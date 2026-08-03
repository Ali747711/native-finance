import ChangePasswordSheet from "@/components/ChangePasswordSheet";
import EditProfileSheet from "@/components/EditProfileSheet";
import SettingsRow from "@/components/SettingsRow";
import SettingsSection from "@/components/SettingsSection";
import images from "@/constants/images";
import { colors } from "@/constants/theme";
import { resolveUserDisplayName } from "@/lib/user";
import { useAuth, useUser } from "@clerk/expo";
import Ionicons from "@expo/vector-icons/Ionicons";
import clsx from "clsx";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useState } from "react";
import { Alert, Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView as RNNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNNSafeAreaView);

export default function Settings() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [openSheet, setOpenSheet] = useState<"profile" | "password" | null>(
    null
  );

  const displayName = resolveUserDisplayName(user);
  const email = user?.primaryEmailAddress?.emailAddress;
  const isEmailVerified =
    user?.primaryEmailAddress?.verification?.status === "verified";
  const avatarSource = user?.imageUrl
    ? { uri: user.imageUrl }
    : images.avatar;
  const memberSince = user?.createdAt
    ? dayjs(user.createdAt).format("MMM D, YYYY")
    : undefined;

  const handleSignOut = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      await signOut();
      // Clearing the session flips `isSignedIn`, and the (tabs) guard redirects
      // to /sign-in on the next render — no manual navigation needed.
    } catch {
      Alert.alert("Sign out failed", "Please try again.");
      // Only reset on failure. On success this screen unmounts during the
      // redirect, and setting state on the way out would warn.
      setIsSigningOut(false);
    }
  };

  const confirmSignOut = () => {
    Alert.alert(
      "Sign out?",
      "You'll need to sign in again to get back to your subscriptions.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Sign out", style: "destructive", onPress: handleSignOut },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["top"]}>
      <ScrollView
        className="settings-scroll"
        contentContainerClassName="settings-content"
        showsVerticalScrollIndicator={false}
      >
        <Text className="settings-heading">Settings</Text>

        <View className="settings-profile-card">
          <Image source={avatarSource} className="settings-profile-avatar" />
          <View className="settings-profile-copy">
            <Text className="settings-profile-name" numberOfLines={1}>
              {displayName}
            </Text>
            {email ? (
              <Text className="settings-profile-email" numberOfLines={1}>
                {email}
              </Text>
            ) : null}
            <View
              className={clsx(
                "settings-badge",
                !isEmailVerified && "settings-badge-pending"
              )}
            >
              <Text
                className={clsx(
                  "settings-badge-text",
                  !isEmailVerified && "settings-badge-pending-text"
                )}
              >
                {isEmailVerified ? "Verified" : "Unverified"}
              </Text>
            </View>
          </View>
        </View>

        <SettingsSection title="Profile">
          <SettingsRow
            icon="person-outline"
            label="Name"
            value={user?.fullName ?? "Add your name"}
            onPress={() => setOpenSheet("profile")}
          />
          <SettingsRow
            icon="lock-closed-outline"
            label="Password"
            value="Change your password"
            onPress={() => setOpenSheet("password")}
          />
        </SettingsSection>

        <SettingsSection title="Account">
          <SettingsRow
            icon="mail-outline"
            label="Email"
            value={email ?? "Not available"}
          />
          <SettingsRow
            icon="calendar-outline"
            label="Member since"
            value={memberSince ?? "Not available"}
          />
          {/* Dev-facing: confirms which Clerk account the session belongs to
              while the auth flow is still being exercised. Safe to delete. */}
          <SettingsRow
            icon="finger-print-outline"
            label="User ID"
            value={user?.id ?? "Not available"}
          />
        </SettingsSection>

        <SettingsSection title="Preferences">
          <SettingsRow
            icon="notifications-outline"
            label="Renewal reminders"
            value="Get notified before a subscription renews"
            soon
          />
          <SettingsRow
            icon="cash-outline"
            label="Default currency"
            value="USD"
            soon
          />
          <SettingsRow
            icon="contrast-outline"
            label="Appearance"
            value="Light"
            soon
          />
        </SettingsSection>

        <Pressable
          className={clsx(
            "settings-signout",
            isSigningOut && "settings-signout-disabled"
          )}
          onPress={confirmSignOut}
          disabled={isSigningOut}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
          accessibilityState={{ disabled: isSigningOut, busy: isSigningOut }}
        >
          <Ionicons
            name="log-out-outline"
            size={18}
            color={colors.destructive}
          />
          <Text className="settings-signout-text">
            {isSigningOut ? "Signing out…" : "Sign out"}
          </Text>
        </Pressable>

        <Text className="settings-footnote">Recurly v1.0.0</Text>
      </ScrollView>

      <EditProfileSheet
        visible={openSheet === "profile"}
        onClose={() => setOpenSheet(null)}
      />
      <ChangePasswordSheet
        visible={openSheet === "password"}
        onClose={() => setOpenSheet(null)}
      />
    </SafeAreaView>
  );
}
