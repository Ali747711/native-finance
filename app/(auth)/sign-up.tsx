import AuthField from "@/components/AuthField";
import AuthFooterLink from "@/components/AuthFooterLink";
import AuthHeader from "@/components/AuthHeader";
import AuthShell from "@/components/AuthShell";
import AuthSubmitButton from "@/components/AuthSubmitButton";
import { resolveAuthError, type ClerkLikeError } from "@/lib/auth-errors";
import {
  PASSWORD_MIN_LENGTH,
  VERIFICATION_CODE_LENGTH,
  signUpSchema,
  toFieldErrors,
  verificationSchema,
  type FieldErrors,
  type SignUpValues,
  type VerificationValues,
} from "@/lib/validation";
import { useSignUp } from "@clerk/expo";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

type Step = "details" | "verify";

export default function SignUp() {
  const { signUp } = useSignUp();

  const [step, setStep] = useState<Step>("details");
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  const [detailErrors, setDetailErrors] = useState<FieldErrors<SignUpValues>>(
    {}
  );
  const [codeErrors, setCodeErrors] = useState<FieldErrors<VerificationValues>>(
    {}
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const clearFeedback = () => {
    setFormError(null);
    setNotice(null);
  };

  /**
   * Routes a Clerk failure to the field it belongs to, so "that password is
   * incorrect" lands under the password input rather than in a banner detached
   * from the thing the user needs to fix.
   */
  const applyClerkError = (error: ClerkLikeError | null, scope: Step) => {
    const { target, message } = resolveAuthError(error);

    if (scope === "details" && (target === "emailAddress" || target === "password")) {
      setDetailErrors((current) => ({ ...current, [target]: message }));
      return;
    }

    if (scope === "verify" && target === "code") {
      setCodeErrors({ code: message });
      return;
    }

    setFormError(message);
  };

  const handleSubmitDetails = async () => {
    if (!signUp || isSubmitting) {
      return;
    }

    clearFeedback();
    const parsed = signUpSchema.safeParse({ emailAddress, password });

    if (!parsed.success) {
      setDetailErrors(toFieldErrors(parsed.error));
      return;
    }

    setDetailErrors({});
    setIsSubmitting(true);

    try {
      const { error } = await signUp.password(parsed.data);

      if (error) {
        applyClerkError(error, "details");
        return;
      }

      const { error: sendError } = await signUp.verifications.sendEmailCode();

      if (sendError) {
        applyClerkError(sendError, "details");
        return;
      }

      setStep("verify");
      setNotice(`We sent a code to ${parsed.data.emailAddress}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!signUp || isSubmitting) {
      return;
    }

    clearFeedback();
    const parsed = verificationSchema.safeParse({ code });

    if (!parsed.success) {
      setCodeErrors(toFieldErrors(parsed.error));
      return;
    }

    setCodeErrors({});
    setIsSubmitting(true);

    try {
      const { error } = await signUp.verifications.verifyEmailCode(parsed.data);

      if (error) {
        applyClerkError(error, "verify");
        return;
      }

      // `finalize()` is what converts a verified sign-up into an active session.
      // Skipping it leaves the user verified but still signed out.
      const { error: finalizeError } = await signUp.finalize();

      if (finalizeError) {
        applyClerkError(finalizeError, "verify");
      }
      // On success the session goes active, `isSignedIn` flips, and the
      // (auth) layout redirects away. No manual navigation needed here.
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!signUp || isResending) {
      return;
    }

    clearFeedback();
    setCodeErrors({});
    setIsResending(true);

    try {
      const { error } = await signUp.verifications.sendEmailCode();

      if (error) {
        applyClerkError(error, "verify");
        return;
      }

      setNotice("We sent you a new code.");
    } finally {
      setIsResending(false);
    }
  };

  const handleUseDifferentEmail = async () => {
    clearFeedback();
    setCodeErrors({});
    setCode("");

    // Discard the server-side attempt too. Without this the pending sign-up
    // keeps the old address, and submitting a different one comes back as
    // "that email already has an account" against the wrong address.
    await signUp?.reset();

    setStep("details");
  };

  if (step === "verify") {
    return (
      <AuthShell>
        <AuthHeader
          title="Check your email"
          subtitle={`Enter the ${VERIFICATION_CODE_LENGTH}-digit code we sent to ${emailAddress}.`}
        />

        <View className="auth-card">
          <View className="auth-form">
            <AuthField
              label="Verification code"
              value={code}
              onChangeText={(next) => {
                setCode(next);
                setCodeErrors({});
              }}
              error={codeErrors.code}
              placeholder="123456"
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="one-time-code"
              maxLength={VERIFICATION_CODE_LENGTH}
              returnKeyType="done"
              onSubmitEditing={handleVerify}
            />

            {formError ? <Text className="auth-error">{formError}</Text> : null}
            {notice ? <Text className="auth-helper">{notice}</Text> : null}

            <AuthSubmitButton
              label="Verify and continue"
              onPress={handleVerify}
              loading={isSubmitting}
              disabled={!signUp}
            />

            <View className="auth-divider-row">
              <View className="auth-divider-line" />
              <Text className="auth-divider-text">Didn&apos;t get it?</Text>
              <View className="auth-divider-line" />
            </View>

            <Pressable
              className="auth-secondary-button"
              onPress={handleResend}
              disabled={isResending}
              accessibilityRole="button"
              accessibilityState={{ disabled: isResending, busy: isResending }}
            >
              <Text className="auth-secondary-button-text">
                {isResending ? "Sending…" : "Send a new code"}
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="auth-link-row">
          <Text className="auth-link-copy">Wrong address?</Text>
          <Text className="auth-link" onPress={handleUseDifferentEmail}>
            Use a different email
          </Text>
        </View>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <AuthHeader
        title="Create your account"
        subtitle="Start tracking every subscription in one place"
      />

      <View className="auth-card">
        <View className="auth-form">
          <AuthField
            label="Email"
            value={emailAddress}
            onChangeText={(next) => {
              setEmailAddress(next);
              setDetailErrors((current) => ({
                ...current,
                emailAddress: undefined,
              }));
            }}
            error={detailErrors.emailAddress}
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
              setDetailErrors((current) => ({
                ...current,
                password: undefined,
              }));
            }}
            error={detailErrors.password}
            helper={`At least ${PASSWORD_MIN_LENGTH} characters.`}
            placeholder="Create a password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="new-password"
            textContentType="newPassword"
            returnKeyType="go"
            onSubmitEditing={handleSubmitDetails}
          />

          {formError ? <Text className="auth-error">{formError}</Text> : null}

          <AuthSubmitButton
            label="Create account"
            onPress={handleSubmitDetails}
            loading={isSubmitting}
            disabled={!signUp}
          />
        </View>

        {/*
          Required for sign-up on Expo web, where Clerk runs a bot check.
          Native iOS and Android skip the browser CAPTCHA entirely.
        */}
        <View nativeID="clerk-captcha" />

        <AuthFooterLink
          copy="Already have an account?"
          actionLabel="Sign in"
          href="/sign-in"
        />
      </View>
    </AuthShell>
  );
}
