import AuthField from "@/components/AuthField";
import AuthSubmitButton from "@/components/AuthSubmitButton";
import SettingsSheet from "@/components/SettingsSheet";
import { extractClerkError, resolveAuthError } from "@/lib/auth-errors";
import { posthog } from "@/lib/posthog";
import {
  NAME_MAX_LENGTH,
  profileSchema,
  toFieldErrors,
  type FieldErrors,
  type ProfileValues,
} from "@/lib/validation";
import { useUser } from "@clerk/expo";
import { useEffect, useState } from "react";
import { Text } from "react-native";

export default function EditProfileSheet({
  visible,
  onClose,
}: SettingsSheetFormProps) {
  const { user } = useUser();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<ProfileValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Reseed from Clerk each time the sheet opens, so reopening after a cancel
  // shows the saved values rather than the abandoned edit.
  useEffect(() => {
    if (visible) {
      setFirstName(user?.firstName ?? "");
      setLastName(user?.lastName ?? "");
      setFieldErrors({});
      setFormError(null);
    }
  }, [visible, user?.firstName, user?.lastName]);

  const handleSave = async () => {
    if (!user || isSaving) {
      return;
    }

    setFormError(null);
    const parsed = profileSchema.safeParse({ firstName, lastName });

    if (!parsed.success) {
      setFieldErrors(toFieldErrors(parsed.error));
      return;
    }

    setFieldErrors({});
    setIsSaving(true);

    try {
      await user.update(parsed.data);
      posthog?.capture("profile_updated");
      onClose();
    } catch (thrown) {
      // These resource methods reject rather than returning `{ error }`.
      setFormError(resolveAuthError(extractClerkError(thrown)).message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsSheet visible={visible} title="Your name" onClose={onClose}>
      <AuthField
        label="First name"
        value={firstName}
        onChangeText={(next) => {
          setFirstName(next);
          setFieldErrors((current) => ({ ...current, firstName: undefined }));
        }}
        error={fieldErrors.firstName}
        placeholder="Enter your first name"
        autoCapitalize="words"
        autoComplete="given-name"
        textContentType="givenName"
        maxLength={NAME_MAX_LENGTH}
        returnKeyType="next"
      />

      <AuthField
        label="Last name"
        value={lastName}
        onChangeText={(next) => {
          setLastName(next);
          setFieldErrors((current) => ({ ...current, lastName: undefined }));
        }}
        error={fieldErrors.lastName}
        helper="Optional."
        placeholder="Enter your last name"
        autoCapitalize="words"
        autoComplete="family-name"
        textContentType="familyName"
        maxLength={NAME_MAX_LENGTH}
        returnKeyType="done"
        onSubmitEditing={handleSave}
      />

      {formError ? <Text className="auth-error">{formError}</Text> : null}

      <AuthSubmitButton
        label="Save name"
        onPress={handleSave}
        loading={isSaving}
        disabled={!user}
      />
    </SettingsSheet>
  );
}
