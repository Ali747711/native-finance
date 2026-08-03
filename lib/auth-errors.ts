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

export type AuthErrorTarget =
  | "emailAddress"
  | "password"
  | "code"
  | "username"
  | "form";

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
  form_password_not_strong_enough: {
    target: "password",
    message: "That password is too easy to guess. Try a longer one.",
  },
  form_password_size_in_bytes_exceeded: {
    target: "password",
    message: "That password is too long.",
  },
  form_username_invalid_length: {
    target: "username",
    message: "That username is the wrong length.",
  },
  form_username_invalid_character: {
    target: "username",
    message: "Usernames can use letters, numbers, hyphens and underscores.",
  },
  form_param_format_invalid: {
    target: "form",
    message: "One of those values isn't in a format we accept.",
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

/**
 * Pulls the first usable error out of something `throw`n.
 *
 * The sign-in/sign-up "Future" methods hand back `{ error }`, but the signed-in
 * user methods (`user.update`, `user.updatePassword`) reject instead — and they
 * reject with a `ClerkAPIResponseError` carrying an `errors` array rather than
 * the flat shape `resolveAuthError` expects. This normalises both, and degrades
 * to `null` for non-Clerk failures such as a dropped connection.
 */
export const extractClerkError = (thrown: unknown): ClerkLikeError | null => {
  if (!thrown || typeof thrown !== "object") {
    return null;
  }

  const { errors } = thrown as { errors?: unknown };

  if (Array.isArray(errors) && errors.length > 0) {
    const [first] = errors as ClerkLikeError[];
    return first ?? null;
  }

  const { code, message, longMessage } = thrown as ClerkLikeError;

  // Requires a `code`, which every Clerk error carries. Matching on `message`
  // alone would let a bare `TypeError: Network request failed` reach the UI as
  // if it were copy we had written.
  if (code) {
    return { code, message, longMessage };
  }

  return null;
};
