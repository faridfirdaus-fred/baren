import { z } from "zod";

const googleProfileSchema = z.object({
  email: z.string().trim().pipe(z.string().email()),
  email_verified: z.literal(true),
});

export function verifiedGoogleEmail(profile) {
  const parsed = googleProfileSchema.safeParse(profile);
  return parsed.success ? parsed.data.email.trim().toLowerCase() : null;
}
