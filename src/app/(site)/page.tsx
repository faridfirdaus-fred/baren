import { AboutGame } from "@/components/site/about-game";
import { AgentsSection } from "@/components/site/agents-section";
import { ContactSection } from "@/components/site/contact-section";
import { DownloadSection } from "@/components/site/download-section";
import { EventBanner } from "@/components/site/event-banner";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { GameFeatures } from "@/components/site/game-features";
import { GallerySection } from "@/components/site/gallery-section";
import { Hero } from "@/components/site/hero";
import { LatestNews } from "@/components/site/latest-news";
import { LandingCards } from "@/components/site/landing-cards";
import { HowToPlay } from "@/components/site/how-to-play";
import { MapsSection } from "@/components/site/maps-section";
import { getFaqItems } from "@/lib/faq-content";
import { getLatestNews } from "@/lib/news-content";
import { getLandingCards } from "@/lib/landing-cards-content";
import { getHowToPlayContent } from "@/lib/how-to-play-content";

// E6-1: Hero dinamis dari DB. E7-3: FAQ dari DB (kosong = seksi hilang).
// E6-3..6: Landing cards, news-3, how-to-play dari DB (kosong = seksi hilang).
// E6-7/8: Galeri dari DB. E7-4..6: Download & Kontak dari DB.
export default async function SiteHomePage() {
  const [faqs, news, cards, howToPlay] = await Promise.all([
    getFaqItems(),
    getLatestNews(),
    getLandingCards(),
    getHowToPlayContent(),
  ]);

  return (
    <>
      <Hero />
      {news && <LatestNews items={news} />}
      <EventBanner />
      {cards && <LandingCards cards={cards} />}
      <AboutGame />
      <GameFeatures />
      <AgentsSection />
      <MapsSection />
      {howToPlay && <HowToPlay content={howToPlay} />}
      <GallerySection />
      <FaqAccordion items={faqs ?? undefined} />
      <DownloadSection />
      <ContactSection />
    </>
  );
}
