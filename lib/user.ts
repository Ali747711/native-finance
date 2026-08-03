/**
 * Structural shape rather than an import of Clerk's `UserResource`, matching the
 * approach in `lib/auth-errors.ts` — a real Clerk user satisfies this, but the
 * helper stays independently testable and unpinned from Clerk's module layout.
 */
export interface DisplayUser {
  fullName?: string | null;
  username?: string | null;
  primaryEmailAddress?: { emailAddress?: string | null } | null;
}

export const FALLBACK_DISPLAY_NAME = "Your account";

const firstNonEmpty = (
  ...candidates: (string | null | undefined)[]
): string | undefined =>
  candidates
    .map((candidate) => candidate?.trim())
    .find((candidate): candidate is string => Boolean(candidate));

/**
 * Picks the best available human label for the signed-in user.
 *
 * Worth knowing: the sign-up flow collects only an email and password, so
 * `fullName` and `username` are null on most accounts. The email local part is
 * the ordinary path here, not a rare fallback — which is why it's a real branch
 * rather than a last-ditch guard.
 */
export const resolveUserDisplayName = (user?: DisplayUser | null): string => {
  if (!user) {
    return FALLBACK_DISPLAY_NAME;
  }

  const email = user.primaryEmailAddress?.emailAddress;
  const emailLocalPart = email?.includes("@") ? email.split("@")[0] : undefined;

  return (
    firstNonEmpty(user.fullName, user.username, emailLocalPart) ??
    FALLBACK_DISPLAY_NAME
  );
};
