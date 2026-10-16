import { count, max } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { AdminAccountForm } from "@/components/admin/account-form";
import { getDb } from "@/db";
import {
  about,
  downloadLinks,
  faq,
  features,
  galleryAssets,
  hero,
  heroBanners,
  howToPlaySteps,
  howToPlayVideo,
  news,
  siteSettings,
  socialLinks,
  waitlist,
} from "@/db/schema";
import { summarizeAdminDashboard } from "@/lib/admin-dashboard";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  let session = null;
  try {
    session = await auth();
  } catch {
    redirect("/admin/login");
  }
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user) redirect("/admin/login");
  if (role !== "admin") redirect("/admin/login?error=AksesDitolak");

  const db = getDb();
  const [
    featureCount,
    galleryCount,
    newsCount,
    faqCount,
    waitlistCount,
    siteSettingsUpdate,
    heroUpdate,
    heroBannersUpdate,
    aboutUpdate,
    featuresUpdate,
    howToPlayStepsUpdate,
    howToPlayVideoUpdate,
    galleryUpdate,
    newsUpdate,
    faqUpdate,
    socialLinksUpdate,
    downloadLinksUpdate,
  ] = await Promise.all([
    db.select({ count: count() }).from(features),
    db.select({ count: count() }).from(galleryAssets),
    db.select({ count: count() }).from(news),
    db.select({ count: count() }).from(faq),
    db.select({ count: count() }).from(waitlist),
    db.select({ updatedAt: max(siteSettings.updatedAt) }).from(siteSettings),
    db.select({ updatedAt: max(hero.updatedAt) }).from(hero),
    db.select({ updatedAt: max(heroBanners.updatedAt) }).from(heroBanners),
    db.select({ updatedAt: max(about.updatedAt) }).from(about),
    db.select({ updatedAt: max(features.updatedAt) }).from(features),
    db
      .select({ updatedAt: max(howToPlaySteps.updatedAt) })
      .from(howToPlaySteps),
    db
      .select({ updatedAt: max(howToPlayVideo.updatedAt) })
      .from(howToPlayVideo),
    db.select({ updatedAt: max(galleryAssets.updatedAt) }).from(galleryAssets),
    db.select({ updatedAt: max(news.updatedAt) }).from(news),
    db.select({ updatedAt: max(faq.updatedAt) }).from(faq),
    db.select({ updatedAt: max(socialLinks.updatedAt) }).from(socialLinks),
    db.select({ updatedAt: max(downloadLinks.updatedAt) }).from(downloadLinks),
  ]);
  const dashboard = summarizeAdminDashboard({
    features: featureCount[0]?.count ?? 0,
    gallery: galleryCount[0]?.count ?? 0,
    news: newsCount[0]?.count ?? 0,
    faq: faqCount[0]?.count ?? 0,
    waitlist: waitlistCount[0]?.count ?? 0,
    contentUpdatedAt: {
      siteSettings: siteSettingsUpdate[0]?.updatedAt ?? null,
      hero: heroUpdate[0]?.updatedAt ?? null,
      heroBanners: heroBannersUpdate[0]?.updatedAt ?? null,
      about: aboutUpdate[0]?.updatedAt ?? null,
      features: featuresUpdate[0]?.updatedAt ?? null,
      howToPlaySteps: howToPlayStepsUpdate[0]?.updatedAt ?? null,
      howToPlayVideo: howToPlayVideoUpdate[0]?.updatedAt ?? null,
      gallery: galleryUpdate[0]?.updatedAt ?? null,
      news: newsUpdate[0]?.updatedAt ?? null,
      faq: faqUpdate[0]?.updatedAt ?? null,
      social: socialLinksUpdate[0]?.updatedAt ?? null,
      downloads: downloadLinksUpdate[0]?.updatedAt ?? null,
    },
  });

  return (
    <main>
      <h1>Dasbor Admin</h1>
      <p>Masuk sebagai {(session.user as { email?: string }).email}</p>
      <dl>
        <div>
          <dt>Fitur</dt>
          <dd>{dashboard.features}</dd>
        </div>
        <div>
          <dt>Galeri</dt>
          <dd>{dashboard.gallery}</dd>
        </div>
        <div>
          <dt>Berita</dt>
          <dd>{dashboard.news}</dd>
        </div>
        <div>
          <dt>FAQ</dt>
          <dd>{dashboard.faq}</dd>
        </div>
        <div>
          <dt>Waitlist</dt>
          <dd>{dashboard.waitlist}</dd>
        </div>
        <div>
          <dt>Pembaruan konten terakhir</dt>
          <dd>
            {dashboard.latestContentUpdate?.toISOString() ??
              "Belum ada pembaruan konten."}
          </dd>
        </div>
      </dl>
      <nav aria-label="Navigasi Modul Admin" className="my-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-sand-600">
          Modul Konten
        </h2>
        <ul className="mt-2 flex flex-wrap gap-3">
          <li>
            <Link
              href="/admin/branding"
              className="inline-block border border-line bg-ink-800 px-4 py-2 text-sm font-semibold text-sand hover:border-ember hover:text-ember"
            >
              Kelola Branding
            </Link>
          </li>
          <li>
            <Link
              href="/admin/faq"
              className="inline-block border border-line bg-ink-800 px-4 py-2 text-sm font-semibold text-sand hover:border-ember hover:text-ember"
            >
              Kelola FAQ
            </Link>
          </li>
          <li>
            <Link
              href="/admin/links"
              className="inline-block border border-line bg-ink-800 px-4 py-2 text-sm font-semibold text-sand hover:border-ember hover:text-ember"
            >
              Kelola Tautan & Kontak
            </Link>
          </li>
          <li>
            <Link
              href="/admin/waitlist"
              className="inline-block border border-line bg-ink-800 px-4 py-2 text-sm font-semibold text-sand hover:border-ember hover:text-ember"
            >
              Kelola Waitlist
            </Link>
          </li>
        </ul>
      </nav>
      <AdminAccountForm
        name={session.user.name ?? ""}
        email={(session.user as { email?: string }).email ?? ""}
      />
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/admin/login" });
        }}
      >
        <button type="submit">Keluar</button>
      </form>
    </main>
  );
}
