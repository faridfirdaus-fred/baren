import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

/**
 * E5-1 — Layout situs publik (Next.js App Router; baca docs layout/metadata
 * Next.js 16 sebelum mengubah: root layout memegang <html>/<body>, layout
 * segmen hanya membungkus UI).
 * - Header/footer + container + tipografi via globals.css.
 * - Branding fallback Indonesia (nama/logo statis); E5-2 mengganti dengan
 *   `site_settings` (logo, favicon, nama game) + revalidasi ≤60 dtk.
 * - Main landmark + skip link untuk navigasi inklusif.
 * - Slot akun header: `SiteHeader accountSlot` milik Fondasi; E11-4 Publik
 *   mengirim child `AccountMenu`, integrator memasang setelah kedua sisi merge.
 * - ID anchor kontrak: #top, #berita, #tentang, #fitur, #pemain, #arena,
 *   #faq, #galeri (E6), #kontak (E7), #daftar.
 */
export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      id="top"
      className="flex min-h-dvh flex-col overflow-x-clip bg-ink text-sand"
    >
      <a
        href="#konten-utama"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-none focus:bg-sand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink focus:outline-2 focus:outline-offset-2 focus:outline-ember"
      >
        Lewati ke konten utama
      </a>
      <SiteHeader />
      <main
        id="konten-utama"
        tabIndex={-1}
        className="flex-1 focus:outline-none"
      >
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
