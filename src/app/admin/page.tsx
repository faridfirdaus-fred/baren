import { count, desc, eq, max } from "drizzle-orm";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, ExternalLink, Globe } from "lucide-react";

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

  const quickLinks = [
    { href: "/admin/characters", label: "Kelola Jagoan" },
    { href: "/admin/news", label: "Berita & Foto Event" },
    { href: "/admin/landing-cards", label: "Kartu Tambahan" },
    { href: "/admin/hero", label: "Kelola Hero" },
    { href: "/admin/features", label: "Kelola Fitur" },
    { href: "/admin/how-to-play", label: "Cara Bermain" },
    { href: "/admin/gallery", label: "Kelola Galeri" },
    { href: "/admin/faq", label: "Kelola FAQ" },
    { href: "/admin/landing", label: "Judul & Teks Seksi" },
    { href: "/admin/branding", label: "Branding" },
    { href: "/admin/links", label: "Tautan Sosial" },
    { href: "/admin/wishlist", label: "Wishlist" },
    { href: "/admin/comments", label: "Komentar" },
  ];

  return (
    <section className="space-y-8">
      <header className="flex flex-col gap-4 border-b border-zinc-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
            Dasbor Admin
          </h1>
          <span className="sr-only">Dashboard Admin</span>
          <p className="mt-1 text-sm text-zinc-500">
            Masuk sebagai {(session.user as { email?: string }).email}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={adminButtonClass("secondary", "md")}
          >
            <Globe className="h-4 w-4 text-zinc-500" aria-hidden="true" />
            <span>Lihat Situs</span>
            <ExternalLink
              className="h-3.5 w-3.5 text-zinc-400"
              aria-hidden="true"
            />
          </Link>
        </div>
      </header>

      <section aria-labelledby="ringkasan-metrik" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2
            id="ringkasan-metrik"
            className="text-sm font-semibold text-zinc-900"
          >
            Ringkasan Konten & Komunitas
          </h2>
          <p className="text-xs text-zinc-500">
            Pembaruan terakhir:{" "}
            {latestContentUpdatedAt ? (
              <time
                dateTime={toDateTimeAttribute(latestContentUpdatedAt)}
                className="font-medium text-zinc-700"
              >
                {formatDateTimeId(latestContentUpdatedAt)}
              </time>
            ) : (
              "Belum ada pembaruan konten."
            )}
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map((metric) => (
            <li key={metric.key}>
              <Link
                href={metric.href}
                data-testid={`metric-${metric.key}`}
                className="group flex h-full flex-col rounded-2xl border border-zinc-200 bg-white p-5 transition-all hover:border-zinc-300 hover:shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500">
                    {metric.label}
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 text-zinc-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-zinc-900"
                    aria-hidden="true"
                  />
                </div>
                <span
                  className="mt-2.5 text-3xl font-bold tracking-tight text-zinc-900"
                  data-testid={`metric-value-${metric.key}`}
                >
                  {metric.value}
                </span>
                <span className="mt-1 text-xs text-zinc-500">
                  {metric.description}
                </span>
                <span className="mt-auto pt-3 text-xs font-medium text-zinc-600 group-hover:text-zinc-900">
                  {metric.actionLabel}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <RecentComments comments={recentComments} />

      <nav aria-label="Navigasi Modul Admin" className="space-y-3">
        <h2 className="text-sm font-semibold text-zinc-900">Akses Cepat</h2>
        <ul className="grid gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {quickLinks.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
              >
                <span>{item.label}</span>
                <ArrowUpRight
                  className="h-3.5 w-3.5 text-zinc-400"
                  aria-hidden="true"
                />
              </Link>
            </li>
          ))}
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
