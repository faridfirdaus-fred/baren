import type { Metadata } from "next";

import { getSiteBranding } from "@/lib/branding";
import { getSocialItems } from "@/lib/links-content";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { WishlistMenu } from "@/components/site/wishlist-menu";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata(): Promise<Metadata> {
  const branding = await getSiteBranding();
  const iconUrl = branding.faviconUrl;
  return {
    title: `${branding.brandName} | Party Game Lokal 2 vs 2`,
    description: branding.tagline,
    icons: {
      icon: [{ url: iconUrl }],
      shortcut: iconUrl,
      apple: branding.logoSrc || iconUrl,
    },
    openGraph: {
      title: `${branding.brandName} | Party Game Lokal 2 vs 2`,
      description: branding.tagline,
      images: [branding.logoSrc],
    },
  };
}

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [branding, socialLinks] = await Promise.all([
    getSiteBranding(),
    getSocialItems(),
  ]);

  return (
    <div
      id="top"
      className="flex min-h-dvh flex-col overflow-x-clip bg-white text-zinc-900"
    >
      <a
        href="#konten-utama"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-xl focus:bg-zinc-900 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white focus:outline-2 focus:outline-offset-2 focus:outline-zinc-900"
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
        socialLinks={socialLinks}
      />
    </div>
  );
}
