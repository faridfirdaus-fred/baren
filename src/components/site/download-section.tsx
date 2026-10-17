import { SectionShell } from "@/components/site/section-shell";
import { ScrollRevealWrapper } from "@/components/site/scroll-reveal-wrapper";

/**
 * E14-4 — Seksi Download Steam-only (FR-PUB-13, FR-PUB-25).
 * - Menampilkan kartu tunggal Steam dengan status "Segera Hadir".
 * - Tombol "Gabung Wishlist" mengarah ke #daftar di sisi kanan kartu.
 */
export function DownloadSection() {
  return (
    <ScrollRevealWrapper>
      <SectionShell id="unduh" tone="dark" className="border-t border-sand/15">
        <div className="flex flex-col items-center text-center">
          <h2 className="display-xl text-sand">UNDUH GAME BAREN</h2>
          <p className="mt-4 max-w-2xl text-lg leading-7 text-sand/75">
            Game BAREN saat ini sedang dalam tahap pengembangan aktif. Daftarkan
            diri Anda di Wishlist untuk mendapat pemberitahuan saat akses
            perdana dibuka di Steam.
          </p>

          <div className="mt-10 w-full max-w-3xl">
            <div className="flex flex-col items-center justify-between gap-6 border border-sand/20 bg-ink-800 p-8 sm:flex-row sm:text-left">
              <div className="flex flex-col items-center gap-2 sm:items-start">
                <span className="font-display text-3xl uppercase tracking-wider text-sand">
                  Steam
                </span>
                <span className="inline-block bg-ember/20 px-3 py-1 font-sans text-xs font-bold uppercase tracking-wider text-ember">
                  Segera Hadir
                </span>
              </div>
              <a
                href="#daftar"
                className="inline-flex min-h-11 items-center justify-center bg-ember px-8 py-3 font-sans text-sm font-bold uppercase tracking-wider text-sand shadow-lg transition hover:bg-ember/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
              >
                Gabung Wishlist
              </a>
            </div>
          </div>
        </div>
      </SectionShell>
    </ScrollRevealWrapper>
  );
}
