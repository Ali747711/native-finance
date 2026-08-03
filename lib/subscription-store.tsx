import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { posthog } from "@/lib/posthog";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface SubscriptionStore {
  subscriptions: Subscription[];
  addSubscription: (subscription: Subscription) => void;
}

const SubscriptionsContext = createContext<SubscriptionStore | null>(null);

/**
 * Holds the subscription list for every screen that renders it.
 *
 * Previously each screen read the `HOME_SUBSCRIPTIONS` module constant, so a
 * subscription created on Home was invisible on the Subscriptions tab. The
 * fixtures are still the seed value — this only moves ownership of the list from
 * module scope into a single shared, mutable source.
 *
 * Mounted inside the (tabs) auth guard, so the list resets on sign-out rather
 * than leaking one account's data into the next session.
 */
export function SubscriptionsProvider({ children }: { children: ReactNode }) {
  const [subscriptions, setSubscriptions] =
    useState<Subscription[]>(HOME_SUBSCRIPTIONS);

  const addSubscription = useCallback((subscription: Subscription) => {
    // Captured here rather than in the modal so every creation path is counted,
    // including any future one. Category and cadence only — the name and price
    // are the user's own financial detail and don't belong in analytics.
    // Both fields are optional on `Subscription` (the fixtures predate them) and
    // PostHog's property type rejects `undefined`, so fall back rather than drop
    // the event.
    posthog?.capture("subscription_created", {
      category: subscription.category ?? "Unknown",
      frequency: subscription.frequency ?? "Unknown",
    });

    // Prepend so a new subscription is visible without scrolling.
    setSubscriptions((current) => [subscription, ...current]);
  }, []);

  const value = useMemo(
    () => ({ subscriptions, addSubscription }),
    [subscriptions, addSubscription]
  );

  return (
    <SubscriptionsContext.Provider value={value}>
      {children}
    </SubscriptionsContext.Provider>
  );
}

export const useSubscriptions = (): SubscriptionStore => {
  const store = useContext(SubscriptionsContext);

  // Throwing beats returning an empty list: a screen rendered outside the
  // provider would otherwise look like a user with no subscriptions.
  if (!store) {
    throw new Error(
      "useSubscriptions must be called inside <SubscriptionsProvider>"
    );
  }

  return store;
};
