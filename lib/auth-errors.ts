/**
 * Structural shape rather than an import of Clerk's `ClerkError` class. The
 * class lives behind a deep path that shifts between releases, and everything
 * here needs is the three public fields — so a real `ClerkError` satisfies this
 * without coupling us to Clerk's internal module layout.
 */
export interface ClerkLikeError {
  code?: string;
  message?: string;
  longMessage?: string;
}

export type AuthErrorTarget = "emailAddress" | "password" | "code" | "form";

export interface ResolvedAuthError {
  target: AuthErrorTarget;
  message: string;
}

const GENERIC_MESSAGE = "Something went wrong. Please try again.";

/**
 * Codes worth rewriting. Clerk's own copy is serviceable but generic, and these
 * are the paths users actually hit. Anything not listed falls through to Clerk's
 * message, so an unmapped code still shows something useful rather than
 * "Something went wrong".
 */
const ERROR_COPY: Record<string, ResolvedAuthError> = {
  form_identifier_not_found: {
    target: "emailAddress",
    message: "We couldn't find an account with that email.",
  },
  form_password_incorrect: {
    target: "password",
    message: "That password is incorrect.",
  },
  form_identifier_exists: {
    target: "emailAddress",
    message: "That email already has an account. Try signing in instead.",
  },
  form_password_pwned: {
    target: "password",
    message:
      "That password has shown up in a known data breach. Please choose a different one.",
  },
  form_password_length_too_short: {
    target: "password",
    message: "That password is too short.",
  },
  form_password_validation_failed: {
    target: "password",
    message: "That password doesn't meet the requirements.",
  },
  form_code_incorrect: {
    target: "code",
    message: "That code isn't right. Check it and try again.",
  },
  verification_expired: {
    target: "code",
    message: "That code has expired. Send yourself a new one.",
  },
  verification_failed: {
    target: "code",
    message: "We couldn't verify that code. Send yourself a new one.",
  },
  too_many_requests: {
    target: "form",
    message: "Too many attempts. Wait a moment before trying again.",
  },
  session_exists: {
    target: "form",
    message: "You're already signed in.",
  },
};

/**
 * Turns a Clerk error into a message and the field it belongs against, so the
 * screen can render it inline instead of dumping every failure into one banner.
 */
export const resolveAuthError = (
  error: ClerkLikeError | null | undefined
): ResolvedAuthError => {
  if (!error) {
    return { target: "form", message: GENERIC_MESSAGE };
  }

  const mapped = error.code ? ERROR_COPY[error.code] : undefined;

  if (mapped) {
    return mapped;
  }

  return {
    target: "form",
    message: error.message?.trim() || GENERIC_MESSAGE,
  };
};
