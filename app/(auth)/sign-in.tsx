import AuthField from "@/components/AuthField";
import AuthFooterLink from "@/components/AuthFooterLink";
import AuthHeader from "@/components/AuthHeader";
import AuthShell from "@/components/AuthShell";
import AuthSubmitButton from "@/components/AuthSubmitButton";
import { resolveAuthError } from "@/lib/auth-errors";
import { posthog } from "@/lib/posthog";
import {
  signInSchema,
  toFieldErrors,
  type FieldErrors,
  type SignInValues,
} from "@/lib/validation";
import { useSignIn } from "@clerk/expo";
import { useState } from "react";
import { Text, View } from "react-native";

export default function SignIn() {
  const { signIn } = useSignIn();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors<SignInValues>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!signIn || isSubmitting) {
      return;
    }

    setFormError(null);
    const parsed = signInSchema.safeParse({ emailAddress, password });

    if (!parsed.success) {
      setFieldErrors(toFieldErrors(parsed.error));
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const { error } = await signIn.password(parsed.data);

      if (error) {
        const { target, message } = resolveAuthError(error);

        if (target === "emailAddress" || target === "password") {
          setFieldErrors({ [target]: message });
        } else {
          setFormError(message);
        }

        return;
      }

      if (signIn.status === "complete") {
        const { error: finalizeError } = await signIn.finalize();

        if (finalizeError) {
          setFormError(resolveAuthError(finalizeError).message);
          return;
        }

        posthog?.capture("user_signed_in");
        // On success the session goes active and the (auth) layout redirects.
        return;
      }

      // Password alone did not finish the sign-in. Rather than fail silently
      // with a spinner that stops, name the reason — these branches need real
      // screens (MFA entry, reset-password) before they can be completed.
      setFormError(
        signIn.status === "needs_second_factor"
          ? "This account uses two-factor authentication, which isn't supported in the app yet."
          : signIn.status === "needs_new_password"
            ? "You need to set a new password before signing in."
            : "We couldn't complete sign-in. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <AuthHeader
        title="Welcome back"
        subtitle="Sign in to continue managing your subscriptions"
      />

      <View className="auth-card">
        <View className="auth-form">
          <AuthField
            label="Email"
            value={emailAddress}
            onChangeText={(next) => {
              setEmailAddress(next);
              setFieldErrors((current) => ({
                ...current,
                emailAddress: undefined,
              }));
              setFormError(null);
            }}
            error={fieldErrors.emailAddress}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            textContentType="emailAddress"
            returnKeyType="next"
          />

          <AuthField
            label="Password"
            value={password}
            onChangeText={(next) => {
              setPassword(next);
              setFieldErrors((current) => ({ ...current, password: undefined }));
              setFormError(null);
            }}
            error={fieldErrors.password}
            placeholder="Enter your password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={handleSubmit}
          />

          {formError ? <Text className="auth-error">{formError}</Text> : null}

          <AuthSubmitButton
            label="Sign in"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={!signIn}
          />
        </View>

        <AuthFooterLink
          copy="New to Recurly?"
          actionLabel="Create an account"
          href="/sign-up"
        />
      </View>
    </AuthShell>
  );
}
