import { revalidatePath } from "next/cache";

/**
 * Revalidasi cache halaman publik pasca mutasi konten di admin.
 */
export function revalidateSite(paths: string[] = ["/", "/faq", "/berita"]) {
  try {
    for (const p of paths) {
      revalidatePath(p);
    }
  } catch {
    // Abaikan bila dijalankan di luar siklus request Next.js (misal di unit test)
  }
}
