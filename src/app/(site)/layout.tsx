import type { Metadata } from "next";

import { getSiteBranding } from "@/lib/branding";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { WishlistMenu } from "@/components/site/wishlist-menu";

/**
 * E5-1 — Layout situs publik (Next.js App Router; baca docs layout/metadata
 * Next.js 16 sebelum mengubah: root layout memegang <html>/<body>, layout
 * segmen hanya membungkus UI).
 * E5-2 — Branding dinamis dari `site_settings` (kontrak E3-2): nama game,
 * logo, favicon, email kontak + tagline untuk deskripsi. `revalidate = 60`
 * (Cache Components tidak aktif di proyek ini, jadi model ISR segmen
 * berlaku — sama seperti pola E3-10): perubahan admin tayang
 * ≤60 detik. Gagal/kosong → fallback Indonesia (tak pernah melempar,
 * aman saat build tanpa env). Metadata penuh (sitemap/robots/OG) milik
 * E9-5/Mutu setelah Fondasi merge.
 * - Main landmark + skip link untuk navigasi inklusif.
 * - Slot akun header: `SiteHeader accountSlot` milik Fondasi; E11-4 Publik
 *   mengirim child `AccountMenu`, integrator memasang setelah kedua sisi merge.
 * - ID anchor kontrak: #top, #berita, #tentang, #fitur, #pemain, #arena,
 *   #faq, #galeri (E6), #kontak (E7), #daftar.
 */
export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getSiteBranding();
  return {
    title: `${branding.brandName} | Rebut benteng. Kuasai arena.`,
    description: branding.tagline,
    icons: { icon: branding.faviconUrl },
  };
}

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const branding = await getSiteBranding();

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
      <SiteHeader
        brandName={branding.brandName}
        logoSrc={branding.logoSrc}
        accountSlot={<WishlistMenu />}
      />
      <main
        id="konten-utama"
        tabIndex={-1}
        className="flex-1 focus:outline-none"
      >
        {children}
      </main>
      <SiteFooter
        brandName={branding.brandName}
        brandDescription={branding.tagline}
        contactEmail={branding.contactEmail}
        logoSrc={branding.logoSrc}
      />
    </div>
  );
}
