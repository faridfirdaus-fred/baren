import { AboutGame } from "@/components/site/about-game";
import { AgentsSection } from "@/components/site/agents-section";
import { DownloadSection } from "@/components/site/download-section";
import { EventBanner } from "@/components/site/event-banner";
import { FaqAccordion } from "@/components/site/faq-accordion";
import { GallerySection } from "@/components/site/gallery-section";
import { GameFeatures } from "@/components/site/game-features";
import { Hero } from "@/components/site/hero";
import { LatestNews } from "@/components/site/latest-news";
import { MapsSection } from "@/components/site/maps-section";
import { getFaqItems } from "@/lib/faq-content";

// E7-3: FAQ dari DB (kosong = seksi hilang, gagal = fallback statis di
// komponen). Hero dinamis diurus di dalam <Hero /> (E6-1).
// E6-7/8: Galeri & Lightbox dari DB gallery_assets.
// E7-4: Download per platform / Segera Hadir dari DB download_links.
export default async function SiteHomePage() {
  const faqs = await getFaqItems();

  return (
    <>
      <Hero />
      <LatestNews />
      <EventBanner />
      <AboutGame />
      <GameFeatures />
      <AgentsSection />
      <MapsSection />
      <GallerySection />
      <FaqAccordion items={faqs ?? undefined} />
      <DownloadSection />
    </>
  );
}
