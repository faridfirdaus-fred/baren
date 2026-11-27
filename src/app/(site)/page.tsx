import { auth } from "@/auth";
import { AboutGame } from "@/components/site/about-game";
import { CommentsSection } from "@/components/site/comments-section";
import { DownloadSection } from "@/components/site/download-section";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { GameFeatures } from "@/components/site/game-features";
import { GallerySection } from "@/components/site/gallery-section";
import { Hero } from "@/components/site/hero";
import { HowToPlay } from "@/components/site/how-to-play";
import { LandingCards } from "@/components/site/landing-cards";
import { LatestNews } from "@/components/site/latest-news";
import { getDb } from "@/db";
import { about as aboutTable } from "@/db/schema";
import { listComments } from "@/lib/api/comments";
import { getFaqItems } from "@/lib/faq-content";
import { getFeatures } from "@/lib/features-content";
import { getGalleryItems } from "@/lib/gallery-content";
import { getHowToPlayContent } from "@/lib/how-to-play-content";
import { getLandingCards } from "@/lib/landing-cards-content";
import {
  resolveCommentsCopy,
  resolveFaqCopy,
  resolveGameFeaturesCopy,
  resolveGalleryCopy,
  resolveHowToPlayCopy,
  resolveNewsCopy,
} from "@/lib/landing-content";
import { getLatestNews } from "@/lib/news-content";
import { getLandingSettings } from "@/lib/settings-content";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getAboutRow() {
  try {
    const db = getDb();
    const rows = await db.select().from(aboutTable).limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export default async function SiteHomePage() {
  const [
    settings,
    aboutRow,
    faqs,
    news,
    cards,
    howToPlay,
    features,
    galleryItems,
    comments,
    session,
  ] = await Promise.all([
    getLandingSettings(),
    getAboutRow(),
    getFaqItems(),
    getLatestNews(),
    getLandingCards(),
    getHowToPlayContent(),
    getFeatures(),
    getGalleryItems(),
    listComments(),
    auth().catch(() => null),
  ]);

  const userSession = session?.user
    ? {
        id: session.user.id!,
        name: session.user.name ?? null,
        image: (session.user as { image?: string | null }).image ?? null,
      }
    : null;

  const featuresCopy = resolveGameFeaturesCopy(settings);
  const galleryCopy = resolveGalleryCopy(settings);
  const newsCopy = resolveNewsCopy(settings);
  const faqCopy = resolveFaqCopy(settings);
  const howToPlayCopy = resolveHowToPlayCopy(settings);
  const commentsCopy = resolveCommentsCopy(settings);

  return (
    <div className="flex w-full flex-col bg-white text-zinc-900">
      <Hero />

      <AboutGame
        title={aboutRow?.title}
        description={aboutRow?.body}
        screenshotUrl={aboutRow?.imageUrl || undefined}
      />

      <GameFeatures
        eyebrow={featuresCopy.eyebrow}
        title={featuresCopy.title}
        emptyMessage={featuresCopy.emptyMessage}
        features={features}
      />

      <LandingCards cards={cards ?? []} />

      <HowToPlay content={howToPlay} title={howToPlayCopy.title} />

      <GallerySection
        eyebrow={galleryCopy.eyebrow}
        title={galleryCopy.title}
        description={galleryCopy.description}
        emptyTitle={galleryCopy.emptyTitle}
        emptyMessage={galleryCopy.emptyMessage}
        items={galleryItems ?? []}
      />

      <LatestNews
        items={news}
        title={newsCopy.title}
        ctaLabel={newsCopy.ctaLabel}
      />

      <DownloadSection isLoggedIn={Boolean(session?.user?.email)} />

      <FaqAccordion
        eyebrow={faqCopy.eyebrow}
        title={faqCopy.title}
        items={faqs ?? []}
      />

      <CommentsSection
        initialComments={comments}
        userSession={userSession}
        title={commentsCopy.title}
        loginPrompt={commentsCopy.loginPrompt}
        emptyMessage={commentsCopy.emptyMessage}
        submitLabel={commentsCopy.submitLabel}
        submitError={commentsCopy.submitError}
      />
    </div>
  );
}
