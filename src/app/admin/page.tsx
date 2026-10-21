import { count, desc, eq, max } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { AdminAccountForm } from "@/components/admin/account-form";
import { adminButtonClass } from "@/components/admin/button-styles";
import { RecentComments } from "@/components/admin/recent-comments";
import { getDb } from "@/db";
import {
  about,
  comments,
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
  users,
  wishlist,
} from "@/db/schema";
import { readDashboardSummary } from "@/lib/admin/dashboard";
import { buildDashboardMetrics } from "@/lib/admin/dashboard-metrics";
import { formatDateTimeId, toDateTimeAttribute } from "@/lib/admin/datetime";

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

  // Query counts dan timestamps secara paralel
  const [
    featureCount,
    galleryCount,
    newsCount,
    faqCount,
    wishlistCount,
    commentsCount,
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
    db.select({ count: count() }).from(wishlist),
    db.select({ count: count() }).from(comments),
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

  // Buat store untuk dashboard summary
  const dashboard = readDashboardSummary({
    features: featureCount[0]?.count ?? 0,
    galleryAssets: galleryCount[0]?.count ?? 0,
    news: newsCount[0]?.count ?? 0,
    faq: faqCount[0]?.count ?? 0,
    wishlist: wishlistCount[0]?.count ?? 0,
    comments: commentsCount[0]?.count ?? 0,
    contentUpdates: [
      siteSettingsUpdate[0]?.updatedAt ?? null,
      heroUpdate[0]?.updatedAt ?? null,
      heroBannersUpdate[0]?.updatedAt ?? null,
      aboutUpdate[0]?.updatedAt ?? null,
      featuresUpdate[0]?.updatedAt ?? null,
      howToPlayStepsUpdate[0]?.updatedAt ?? null,
      howToPlayVideoUpdate[0]?.updatedAt ?? null,
      galleryUpdate[0]?.updatedAt ?? null,
      newsUpdate[0]?.updatedAt ?? null,
      faqUpdate[0]?.updatedAt ?? null,
      socialLinksUpdate[0]?.updatedAt ?? null,
      downloadLinksUpdate[0]?.updatedAt ?? null,
    ],
  });

  const metrics = buildDashboardMetrics(dashboard);
  const latestContentUpdatedAt = dashboard.latestContentUpdatedAt;

  // E16-4: satu kueri untuk widget komentar terbaru.
  const recentComments = await db
    .select({
      id: comments.id,
      body: comments.body,
      userName: users.name,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .orderBy(desc(comments.createdAt), desc(comments.id))
    .limit(3);

  return (
    <section className="space-y-8">
      <header>
        <h1 className="font-display text-4xl uppercase tracking-wide text-sand">
          Dasbor Admin
        </h1>
        <p className="mt-2 text-sm text-sand-600">
          Masuk sebagai {(session.user as { email?: string }).email}
        </p>
      </header>

      <section aria-labelledby="ringkasan-metrik" className="space-y-4">
        <h2 id="ringkasan-metrik" className="sr-only">
          Ringkasan metrik
        </h2>
        <p className="text-sm text-sand-600">
          Angka dihitung langsung dari basis data saat halaman dimuat. Pilih
          kartu untuk melihat dan mengelola data sumbernya.
        </p>
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => (
            <li key={metric.key}>
              <Link
                href={metric.href}
                data-testid={`metric-${metric.key}`}
                className="group flex h-full flex-col border border-line bg-ink-800 p-5 transition-colors hover:border-ember hover:bg-ink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
              >
                <span className="text-sm text-sand-600">{metric.label}</span>
                <span
                  className="mt-2 text-3xl font-bold text-sand"
                  data-testid={`metric-value-${metric.key}`}
                >
                  {metric.value}
                </span>
                <span className="mt-1 text-sm text-sand-600">
                  {metric.description}
                </span>
                <span className="mt-auto pt-4 text-xs font-semibold uppercase tracking-wider text-sand-600 group-hover:text-ember">
                  {metric.actionLabel} <span aria-hidden="true">&rarr;</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="border border-line bg-ink-800 p-5">
          <h3 className="text-sm text-sand-600">Pembaruan konten terakhir</h3>
          <p className="mt-2 text-sm font-medium text-sand">
            {latestContentUpdatedAt ? (
              <time dateTime={toDateTimeAttribute(latestContentUpdatedAt)}>
                {formatDateTimeId(latestContentUpdatedAt)}
              </time>
            ) : (
              "Belum ada pembaruan konten."
            )}
          </p>
          <p className="mt-2 text-xs text-sand-600">
            Maksimum dari waktu pembaruan konten; tidak termasuk komentar dan
            wishlist.
          </p>
        </div>
      </section>

      <RecentComments comments={recentComments} />

      <nav aria-label="Navigasi Modul Admin">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-sand-600">
          Modul Konten
        </h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <li>
            <Link
              href="/admin/landing"
              className="block h-full border border-line bg-ink-800 px-4 py-3 text-sm font-semibold text-sand transition-colors hover:border-ember hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
            >
              Kelola Konten Landing
            </Link>
          </li>
          <li>
            <Link
              href="/admin/hero"
              className="block h-full border border-line bg-ink-800 px-4 py-3 text-sm font-semibold text-sand transition-colors hover:border-ember hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
            >
              Kelola Hero
            </Link>
          </li>
          <li>
            <Link
              href="/admin/landing-cards"
              className="block h-full border border-line bg-ink-800 px-4 py-3 text-sm font-semibold text-sand transition-colors hover:border-ember hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
            >
              Kelola Kartu Landing
            </Link>
          </li>
          <li>
            <Link
              href="/admin/news"
              className="block h-full border border-line bg-ink-800 px-4 py-3 text-sm font-semibold text-sand transition-colors hover:border-ember hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
            >
              Kelola Berita
            </Link>
          </li>
          <li>
            <Link
              href="/admin/how-to-play"
              className="block h-full border border-line bg-ink-800 px-4 py-3 text-sm font-semibold text-sand transition-colors hover:border-ember hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
            >
              Kelola How to Play
            </Link>
          </li>
          <li>
            <Link
              href="/admin/features"
              className="block h-full border border-line bg-ink-800 px-4 py-3 text-sm font-semibold text-sand transition-colors hover:border-ember hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
            >
              Kelola Fitur
            </Link>
          </li>
          <li>
            <Link
              href="/admin/branding"
              className="block h-full border border-line bg-ink-800 px-4 py-3 text-sm font-semibold text-sand transition-colors hover:border-ember hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
            >
              Kelola Branding
            </Link>
          </li>
          <li>
            <Link
              href="/admin/faq"
              className="block h-full border border-line bg-ink-800 px-4 py-3 text-sm font-semibold text-sand transition-colors hover:border-ember hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
            >
              Kelola FAQ
            </Link>
          </li>
          <li>
            <Link
              href="/admin/gallery"
              className="block h-full border border-line bg-ink-800 px-4 py-3 text-sm font-semibold text-sand transition-colors hover:border-ember hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
            >
              Kelola Galeri
            </Link>
          </li>
          <li>
            <Link
              href="/admin/links"
              className="block h-full border border-line bg-ink-800 px-4 py-3 text-sm font-semibold text-sand transition-colors hover:border-ember hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
            >
              Kelola Tautan Sosial
            </Link>
          </li>
          <li>
            <Link
              href="/admin/wishlist"
              className="block h-full border border-line bg-ink-800 px-4 py-3 text-sm font-semibold text-sand transition-colors hover:border-ember hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
            >
              Wishlist
            </Link>
          </li>
          <li>
            <Link
              href="/admin/comments"
              className="block h-full border border-line bg-ink-800 px-4 py-3 text-sm font-semibold text-sand transition-colors hover:border-ember hover:text-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
            >
              Komentar
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
        <button type="submit" className={adminButtonClass("secondary", "md")}>
          Keluar
        </button>
      </form>
    </section>
  );
}
