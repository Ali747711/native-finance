import type Ionicons from "@expo/vector-icons/Ionicons";
import type { Href } from "expo-router";
import type { ComponentProps, ReactNode } from "react";
import type { ImageSourcePropType, TextInputProps } from "react-native";

declare global {
  type IoniconName = ComponentProps<typeof Ionicons>["name"];

  interface AppTab {
    name: string;
    title: string;
    icon: ImageSourcePropType;
  }

  interface TabIconProps {
    focused: boolean;
    icon: ImageSourcePropType;
  }

  interface Subscription {
    id: string;
    icon: ImageSourcePropType;
    name: string;
    plan?: string;
    category?: string;
    paymentMethod?: string;
    status?: string;
    startDate?: string;
    price: number;
    currency?: string;
    billing: string;
    renewalDate?: string;
    color?: string;
  }

  interface SubscriptionCardProps extends Omit<Subscription, "id"> {
    expanded: boolean;
    onPress: () => void;
    onCancelPress?: () => void;
    isCancelling?: boolean;
  }

  interface UpcomingSubscription {
    id: string;
    icon: ImageSourcePropType;
    name: string;
    price: number;
    currency?: string;
    daysLeft: number;
  }

  interface UpcomingSubscriptionCardProps extends Omit<
    UpcomingSubscription,
    "id"
  > {}

  interface ListHeadingProps {
    title: string;
  }

  interface AuthShellProps {
    children: ReactNode;
  }

  interface AuthHeaderProps {
    title: string;
    subtitle: string;
  }

  /**
   * `onChangeText` and `value` are required rather than inherited as optional,
   * because an auth input that silently drops keystrokes is the kind of bug that
   * only shows up in production.
   */
  interface AuthFieldProps
    extends Omit<TextInputProps, "value" | "onChangeText" | "className"> {
    label: string;
    value: string;
    onChangeText: (value: string) => void;
    error?: string;
    helper?: string;
  }

  interface AuthSubmitButtonProps {
    label: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
  }

  interface AuthFooterLinkProps {
    copy: string;
    actionLabel: string;
    href: Href;
  }

  interface SettingsSectionProps {
    title: string;
    children: ReactNode;
  }

  interface SettingsRowProps {
    icon: IoniconName;
    label: string;
    value?: string;
    /** Renders the row dimmed with a "Soon" badge and no press target. */
    soon?: boolean;
  }
}

export {};
