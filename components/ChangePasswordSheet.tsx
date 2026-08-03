import AuthField from "@/components/AuthField";
import AuthSubmitButton from "@/components/AuthSubmitButton";
import SettingsSheet from "@/components/SettingsSheet";
import { extractClerkError, resolveAuthError } from "@/lib/auth-errors";
import {
  PASSWORD_MIN_LENGTH,
  changePasswordSchema,
  toFieldErrors,
  type ChangePasswordValues,
  type FieldErrors,
} from "@/lib/validation";
import { useUser } from "@clerk/expo";
import { useEffect, useState } from "react";
import { Text } from "react-native";

export default function ChangePasswordSheet({
  visible,
  onClose,
}: SettingsSheetFormProps) {
  const { user } = useUser();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    FieldErrors<ChangePasswordValues>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Never leave typed passwords sitting in state across opens.
  useEffect(() => {
    if (visible) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setFieldErrors({});
      setFormError(null);
    }
  }, [visible]);

  const handleSave = async () => {
    if (!user || isSaving) {
      return;
    }

    setFormError(null);
    const parsed = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!parsed.success) {
      setFieldErrors(toFieldErrors(parsed.error));
      return;
    }

    setFieldErrors({});
    setIsSaving(true);

    try {
      await user.updatePassword({
        currentPassword: parsed.data.currentPassword,
        newPassword: parsed.data.newPassword,
        // A password change should invalidate anyone still holding the old one.
        // Clerk keeps the current session alive, so this device stays signed in.
        signOutOfOtherSessions: true,
      });
      onClose();
    } catch (thrown) {
      const { target, message } = resolveAuthError(extractClerkError(thrown));

      // Clerk reports a bad existing password as `form_password_incorrect`,
      // which in this form can only mean the current-password field.
      if (target === "password") {
        setFieldErrors({ currentPassword: message });
      } else {
        setFormError(message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsSheet visible={visible} title="Change password" onClose={onClose}>
      <AuthField
        label="Current password"
        value={currentPassword}
        onChangeText={(next) => {
          setCurrentPassword(next);
          setFieldErrors((current) => ({
            ...current,
            currentPassword: undefined,
          }));
        }}
        error={fieldErrors.currentPassword}
        placeholder="Enter your current password"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="next"
      />

      <AuthField
        label="New password"
        value={newPassword}
        onChangeText={(next) => {
          setNewPassword(next);
          setFieldErrors((current) => ({ ...current, newPassword: undefined }));
        }}
        error={fieldErrors.newPassword}
        helper={`At least ${PASSWORD_MIN_LENGTH} characters.`}
        placeholder="Enter a new password"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="next"
      />

      <AuthField
        label="Confirm new password"
        value={confirmPassword}
        onChangeText={(next) => {
          setConfirmPassword(next);
          setFieldErrors((current) => ({
            ...current,
            confirmPassword: undefined,
          }));
        }}
        error={fieldErrors.confirmPassword}
        placeholder="Re-enter your new password"
        secureTextEntry
        autoCapitalize="none"
        autoComplete="new-password"
        textContentType="newPassword"
        returnKeyType="done"
        onSubmitEditing={handleSave}
      />

      {formError ? <Text className="auth-error">{formError}</Text> : null}

      <AuthSubmitButton
        label="Update password"
        onPress={handleSave}
        loading={isSaving}
        disabled={!user}
      />

      <Text className="auth-helper">
        Updating your password signs you out on your other devices.
      </Text>
    </SettingsSheet>
  );
}
