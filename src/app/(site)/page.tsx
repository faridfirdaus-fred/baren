import { auth } from "@/auth";
import { CommentsSection } from "@/components/site/comments-section";
import { ContactSection } from "@/components/site/contact-section";
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
  resolveContactCopy,
  resolveFaqCopy,
  resolveGameFeaturesCopy,
  resolveGalleryCopy,
  resolveHowToPlayCopy,
  resolveNewsCopy,
} from "@/lib/landing-content";
import { getSocialItems } from "@/lib/links-content";
import { getLatestNews } from "@/lib/news-content";
import { getLandingSettings } from "@/lib/settings-content";

// E6-1: Hero dinamis dari DB. E7-3: FAQ dari DB (kosong = seksi hilang).
// E6-3..6: Landing cards, news-3, how-to-play dari DB (kosong = seksi hilang).
// E6-7/8: Galeri dari DB. E7-4..6: Download & Kontak dari DB.
// E13-3: Comments section (authenticated Google users, instant publish).
// E14-3: Seluruh copy pembungkus seksi dari site_settings via landing-content.
export default async function SiteHomePage() {
  const [
    settings,
    faqs,
    news,
    cards,
    howToPlay,
    features,
    galleryItems,
    socialItems,
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
    getSocialItems(),
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
  const contactCopy = resolveContactCopy(settings);

  return (
    <>
      <Hero />
      {news && (
        <LatestNews
          items={news}
          title={newsCopy.title}
          ctaLabel={newsCopy.ctaLabel}
        />
      )}
      {cards && <LandingCards cards={cards} />}
      <GameFeatures
        eyebrow={featuresCopy.eyebrow}
        title={featuresCopy.title}
        emptyMessage={featuresCopy.emptyMessage}
        features={features}
      />
      {howToPlay && (
        <HowToPlay content={howToPlay} title={howToPlayCopy.title} />
      )}
      <GallerySection
        eyebrow={galleryCopy.eyebrow}
        title={galleryCopy.title}
        description={galleryCopy.description}
        emptyTitle={galleryCopy.emptyTitle}
        emptyMessage={galleryCopy.emptyMessage}
        items={galleryItems ?? []}
      />
      <FaqAccordion
        eyebrow={faqCopy.eyebrow}
        title={faqCopy.title}
        items={faqs ?? []}
      />
      <DownloadSection />
      <ContactSection
        eyebrow={contactCopy.eyebrow}
        title={contactCopy.title}
        description={contactCopy.description}
        emailLabel={contactCopy.emailLabel}
        contactEmail={contactCopy.contactEmail}
        socialTitle={contactCopy.socialTitle}
        socialEmptyMessage={contactCopy.socialEmptyMessage}
        socials={
          socialItems?.map((s) => ({ platform: s.label, url: s.url })) ?? []
        }
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
    </>
  );
}
