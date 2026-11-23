import { auth } from "@/auth";
import { AboutGame } from "@/components/site/about-game";
import { BatikDivider } from "@/components/site/batik-divider";
import { CommentsSection } from "@/components/site/comments-section";
import { DownloadSection } from "@/components/site/download-section";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { GameFeatures } from "@/components/site/game-features";
import { GallerySection } from "@/components/site/gallery-section";
import { Hero } from "@/components/site/hero";
import { HowToPlay } from "@/components/site/how-to-play";
import { LandingCards } from "@/components/site/landing-cards";
import { LatestNews } from "@/components/site/latest-news";
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

export default async function SiteHomePage() {
  const [
    settings,
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
    <div className="flex flex-col w-full bg-[#faf6ee] text-[#2f180a]">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Pembatas Batik */}
      <BatikDivider />

      {/* 3. Tentang Game */}
      <AboutGame />

      {/* 4. Pembatas Batik */}
      <BatikDivider />

      {/* 5. Fitur Game */}
      <GameFeatures
        eyebrow={featuresCopy.eyebrow}
        title={featuresCopy.title}
        emptyMessage={featuresCopy.emptyMessage}
        features={features}
      />

      {/* 6. Karakter - Pilih Jagoanmu (Interactive Draggable Deck) */}
      <LandingCards cards={cards ?? []} />

      {/* 7. Pembatas Batik */}
      <BatikDivider />

      {/* 8. Cara Main */}
      {howToPlay && (
        <HowToPlay content={howToPlay} title={howToPlayCopy.title} />
      )}

      {/* 9. Pembatas Batik */}
      <BatikDivider />

      {/* 10. Galeri */}
      <GallerySection
        eyebrow={galleryCopy.eyebrow}
        title={galleryCopy.title}
        description={galleryCopy.description}
        emptyTitle={galleryCopy.emptyTitle}
        emptyMessage={galleryCopy.emptyMessage}
        items={galleryItems ?? []}
      />

      {/* 11. Pembatas Batik */}
      <BatikDivider />

      {/* 12. Kabar Terbaru (News) */}
      {news && (
        <LatestNews
          items={news}
          title={newsCopy.title}
          ctaLabel={newsCopy.ctaLabel}
        />
      )}

      {/* 13. Banner Wishlist Steam */}
      <DownloadSection isLoggedIn={Boolean(session?.user?.email)} />

      {/* 14. FAQ Accordion */}
      <FaqAccordion
        eyebrow={faqCopy.eyebrow}
        title={faqCopy.title}
        items={faqs ?? []}
      />

      {/* 15. Komentar Komunitas */}
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
