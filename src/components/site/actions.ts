"use server";

import { signIn } from "@/auth";

// E11-4: Server Action login Google untuk tombol "Gabung Wishlist".
// Auth.js v5 hanya melayani POST /api/auth/signin/:provider — GET langsung
// melempar UnknownAction. signIn("google") memicu alur OAuth yang benar
// (≤3 langkah: klik → pilih akun → status terlihat).
export async function joinWishlistAction(): Promise<void> {
  await signIn("google", { redirectTo: "/" });
}
