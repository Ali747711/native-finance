import AuthField from "@/components/AuthField";
import AuthSubmitButton from "@/components/AuthSubmitButton";
import {
  CATEGORY_COLORS,
  SUBSCRIPTION_CATEGORIES,
  SUBSCRIPTION_FREQUENCIES,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import { nextRenewalIso, toSubscriptionSlug } from "@/lib/subscriptions";
import {
  SUBSCRIPTION_NAME_MAX_LENGTH,
  createSubscriptionSchema,
  toFieldErrors,
  type CreateSubscriptionValues,
  type FieldErrors,
} from "@/lib/validation";
import clsx from "clsx";
import dayjs from "dayjs";
import { useState } from "react";
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
    const parsed = createSubscriptionSchema.safeParse({ name, price });

    if (!parsed.success) {
      setFieldErrors(toFieldErrors(parsed.error));
      return;
    }

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

    resetForm();
    onClose();
  };

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
          <View className="modal-header">
            <Text className="modal-title">New Subscription</Text>
            <Pressable
              className="modal-close"
              onPress={handleClose}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={8}
            >
              <Text className="modal-close-text">×</Text>
            </Pressable>
          </View>

          <ScrollView
            contentContainerClassName="modal-body"
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
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

            <AuthField
              label="Price"
              value={price}
              onChangeText={(next) => {
                setPrice(next);
                setFieldErrors((current) => ({ ...current, price: undefined }));
              }}
              error={fieldErrors.price}
              placeholder="15.49"
              keyboardType="decimal-pad"
              returnKeyType="done"
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
                        isActive && "picker-option-active"
                      )}
                      onPress={() => setFrequency(option)}
                      accessibilityRole="button"
                      accessibilityLabel={`Bill ${option.toLowerCase()}`}
                      accessibilityState={{ selected: isActive }}
                    >
                      <Text
                        className={clsx(
                          "picker-option-text",
                          isActive && "picker-option-text-active"
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
                        isActive && "category-chip-active"
                      )}
                      onPress={() => setCategory(option)}
                      accessibilityRole="button"
                      accessibilityLabel={`Category ${option}`}
                      accessibilityState={{ selected: isActive }}
                    >
                      <Text
                        className={clsx(
                          "category-chip-text",
                          isActive && "category-chip-text-active"
                        )}
                      >
                        {option}
                      </Text>
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
