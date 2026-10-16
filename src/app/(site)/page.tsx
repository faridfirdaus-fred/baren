import { ContactSection } from "@/components/site/contact-section";
import { DownloadSection } from "@/components/site/download-section";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { GameFeatures } from "@/components/site/game-features";
import { GallerySection } from "@/components/site/gallery-section";
import { Hero } from "@/components/site/hero";
import { LatestNews } from "@/components/site/latest-news";
import { LandingCards } from "@/components/site/landing-cards";
import { HowToPlay } from "@/components/site/how-to-play";
import { CommentsSection } from "@/components/site/comments-section";
import { getFaqItems } from "@/lib/faq-content";
import { getLatestNews } from "@/lib/news-content";
import { getLandingCards } from "@/lib/landing-cards-content";
import { getHowToPlayContent } from "@/lib/how-to-play-content";
import { listComments } from "@/lib/api/comments";
import { auth } from "@/auth";

// E6-1: Hero dinamis dari DB. E7-3: FAQ dari DB (kosong = seksi hilang).
// E6-3..6: Landing cards, news-3, how-to-play dari DB (kosong = seksi hilang).
// E6-7/8: Galeri dari DB. E7-4..6: Download & Kontak dari DB.
// E13-3: Comments section (authenticated Google users, instant publish).
export default async function SiteHomePage() {
  const [faqs, news, cards, howToPlay, comments, session] = await Promise.all([
    getFaqItems(),
    getLatestNews(),
    getLandingCards(),
    getHowToPlayContent(),
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

  return (
    <>
      <Hero />
      {news && <LatestNews items={news} />}
      {cards && <LandingCards cards={cards} />}
      <GameFeatures />
      {howToPlay && <HowToPlay content={howToPlay} />}
      <GallerySection />
      <FaqAccordion items={faqs ?? undefined} />
      <DownloadSection />
      <ContactSection />
      <CommentsSection initialComments={comments} userSession={userSession} />
    </>
  );
}
