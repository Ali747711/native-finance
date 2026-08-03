import { z } from "zod";

export const PASSWORD_MIN_LENGTH = 8;
export const VERIFICATION_CODE_LENGTH = 6;

const emailAddress = z
  .string()
  .trim()
  .min(1, { error: "Enter your email address" })
  .pipe(z.email({ error: "That doesn't look like a valid email address" }));

export const signInSchema = z.object({
  emailAddress,
  // Sign-in deliberately checks only for presence. Restating the strength rules
  // here would tell an attacker what a valid password looks like, and would
  // reject legacy passwords that predate the current policy.
  password: z.string().min(1, { error: "Enter your password" }),
});

export const signUpSchema = z.object({
  emailAddress,
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH, {
      error: `Use at least ${PASSWORD_MIN_LENGTH} characters`,
    }),
});

export const verificationSchema = z.object({
  code: z
    .string()
    .trim()
    .length(VERIFICATION_CODE_LENGTH, {
      error: `Enter the ${VERIFICATION_CODE_LENGTH}-digit code`,
    })
    .regex(/^\d+$/, { error: "Codes contain digits only" }),
});

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
export type VerificationValues = z.infer<typeof verificationSchema>;

export type FieldErrors<T> = Partial<Record<keyof T & string, string>>;

/**
 * Flattens a `ZodError` into one message per field, keeping the first issue for
 * each. Showing every issue at once on a login form is noise — the user fixes
 * them one at a time regardless.
 */
export const toFieldErrors = <T>(error: z.ZodError<T>): FieldErrors<T> =>
  error.issues.reduce<FieldErrors<T>>((collected, issue) => {
    const key = issue.path[0];

    if (typeof key !== "string" || collected[key as keyof T & string]) {
      return collected;
    }

    return { ...collected, [key]: issue.message };
  }, {});
