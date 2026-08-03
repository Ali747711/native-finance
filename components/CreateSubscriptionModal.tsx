import AuthField from "@/components/AuthField";
import AuthSubmitButton from "@/components/AuthSubmitButton";
import PriceField from "@/components/PriceField";
import SubscriptionCard from "@/components/SubscriptionCard";
import {
  CATEGORY_COLORS,
  SUBSCRIPTION_CATEGORIES,
  SUBSCRIPTION_FREQUENCIES,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import { colors } from "@/constants/theme";
import { posthog } from "@/lib/posthog";
import { nextRenewalIso, toSubscriptionSlug } from "@/lib/subscriptions";
import {
  SUBSCRIPTION_NAME_MAX_LENGTH,
  createSubscriptionSchema,
  toFieldErrors,
  type CreateSubscriptionValues,
  type FieldErrors,
} from "@/lib/validation";
import Ionicons from "@expo/vector-icons/Ionicons";
import clsx from "clsx";
import dayjs from "dayjs";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

const DEFAULT_CATEGORY: SubscriptionCategory = "Entertainment";
const DEFAULT_FREQUENCY: SubscriptionFrequency = "Monthly";
const PREVIEW_FALLBACK_NAME = "New subscription";

export default function CreateSubscriptionModal({
  visible,
  onClose,
  onCreate,
}: CreateSubscriptionModalProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [frequency, setFrequency] =
    useState<SubscriptionFrequency>(DEFAULT_FREQUENCY);
  const [category, setCategory] =
    useState<SubscriptionCategory>(DEFAULT_CATEGORY);
  const [fieldErrors, setFieldErrors] = useState<
    FieldErrors<CreateSubscriptionValues>
  >({});

  /**
   * A ref rather than state, because `handleSubmit` is fully synchronous: a
   * `setState` flag would still read its previous value if a second press landed
   * in the same tick, which is exactly the case being guarded. Cleared when the
   * sheet reopens — a successful submit always closes it.
   */
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (visible) {
      hasSubmitted.current = false;
    }
  }, [visible]);

  const resetForm = () => {
    setName("");
    setPrice("");
    setFrequency(DEFAULT_FREQUENCY);
    setCategory(DEFAULT_CATEGORY);
    setFieldErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = () => {
    // Two presses inside one frame would both read the pre-reset `name`/`price`
    // from this closure and both mint an id from the same millisecond timestamp —
    // two subscriptions sharing one React key.
    if (hasSubmitted.current) {
      return;
    }

    const parsed = createSubscriptionSchema.safeParse({ name, price });

    if (!parsed.success) {
      // Not latched on a validation failure: the user must be able to correct
      // the field and press again.
      setFieldErrors(toFieldErrors(parsed.error));
      return;
    }

    hasSubmitted.current = true;
    const createdAt = dayjs();

    onCreate({
      id: `${toSubscriptionSlug(parsed.data.name)}-${createdAt.valueOf()}`,
      icon: icons.wallet,
      name: parsed.data.name,
      price: parsed.data.price,
      category,
      frequency,
      // `billing` is what SubscriptionCard renders; `frequency` is the typed
      // copy the date maths uses. They always hold the same value here.
      billing: frequency,
      status: "active",
      startDate: createdAt.toISOString(),
      renewalDate: nextRenewalIso(createdAt.valueOf(), frequency),
      color: CATEGORY_COLORS[category],
    });

    posthog?.capture("subscription created", {
      subscription_name: parsed.data.name,
      subscription_price: parsed.data.price,
      subscription_category: category,
      subscription_frequency: frequency,
    });

    resetForm();
    onClose();
  };

  // Live preview of the card this form will produce. Category silently decides
  // the card's colour, so without showing it the choice is invisible until the
  // subscription already exists. Parsed leniently — mid-typing values like "1."
  // fall back to zero instead of blanking the card.
  const parsedPreviewPrice = Number(price.trim());
  const previewPrice =
    Number.isFinite(parsedPreviewPrice) && parsedPreviewPrice > 0
      ? parsedPreviewPrice
      : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        className="modal-overlay"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          className="flex-1"
          onPress={handleClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
        />

        <View className="modal-container">
          <View className="sheet-grabber-wrap">
            <View className="sheet-grabber" />
          </View>

          <View className="modal-header">
            <View className="modal-heading-copy">
              <Text className="modal-title">New Subscription</Text>
              <Text className="modal-subtitle">
                Track a recurring charge and when it renews.
              </Text>
            </View>
            <Pressable
              className="modal-close"
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={8}
            >
              <Ionicons name="close" size={16} color={colors.primary} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerClassName="modal-body"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View className="create-section">
              <Text className="create-section-label">Preview</Text>
              {/*
                The real SubscriptionCard, so the preview can't drift from the
                thing it previews. `pointerEvents="none"` keeps it presentational
                — it reads to a screen reader but can't be tapped or expanded.
              */}
              <View className="create-preview" pointerEvents="none">
                <SubscriptionCard
                  icon={icons.wallet}
                  name={name.trim() || PREVIEW_FALLBACK_NAME}
                  price={previewPrice}
                  category={category}
                  frequency={frequency}
                  billing={frequency}
                  color={CATEGORY_COLORS[category]}
                  expanded={false}
                  onPress={() => {}}
                />
              </View>
            </View>

            <AuthField
              label="Name"
              value={name}
              onChangeText={(next) => {
                setName(next);
                setFieldErrors((current) => ({ ...current, name: undefined }));
              }}
              error={fieldErrors.name}
              placeholder="Netflix"
              autoCapitalize="words"
              maxLength={SUBSCRIPTION_NAME_MAX_LENGTH}
              returnKeyType="next"
            />

            <PriceField
              label="Price"
              value={price}
              onChangeText={(next) => {
                setPrice(next);
                setFieldErrors((current) => ({ ...current, price: undefined }));
              }}
              error={fieldErrors.price}
              onSubmitEditing={handleSubmit}
            />

            <View className="auth-field">
              <Text className="auth-label">Frequency</Text>
              <View className="picker-row">
                {SUBSCRIPTION_FREQUENCIES.map((option) => {
                  const isActive = option === frequency;

                  return (
                    <Pressable
                      key={option}
                      className={clsx(
                        "picker-option",
                        isActive && "picker-option-active",
                      )}
                      onPress={() => setFrequency(option)}
                      accessibilityRole="button"
                      accessibilityLabel={`Bill ${option.toLowerCase()}`}
                      accessibilityState={{ selected: isActive }}
                    >
                      <Text
                        className={clsx(
                          "picker-option-text",
                          isActive && "picker-option-text-active",
                        )}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="auth-field">
              <Text className="auth-label">Category</Text>
              <View className="category-scroll">
                {SUBSCRIPTION_CATEGORIES.map((option) => {
                  const isActive = option === category;

                  return (
                    <Pressable
                      key={option}
                      className={clsx(
                        "category-chip",
                        isActive && "category-chip-active",
                      )}
                      onPress={() => setCategory(option)}
                      accessibilityRole="button"
                      accessibilityLabel={`Category ${option}`}
                      accessibilityState={{ selected: isActive }}
                    >
                      <View className="chip-inner">
                        {/* Ties each chip to the tint it will give the card. */}
                        <View
                          className="chip-dot"
                          style={{ backgroundColor: CATEGORY_COLORS[option] }}
                        />
                        <Text
                          className={clsx(
                            "category-chip-text",
                            isActive && "category-chip-text-active",
                          )}
                        >
                          {option}
                        </Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/*
              Disabled while either field is blank so `auth-button-disabled`
              actually renders. The schema still owns the real rules — price
              above zero and the name length cap stay reachable from here.
            */}
            <AuthSubmitButton
              label="Add subscription"
              onPress={handleSubmit}
              disabled={name.trim().length === 0 || price.trim().length === 0}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
