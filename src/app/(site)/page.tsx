import { AboutGame } from '@/components/site/about-game';
import { AgentsSection } from '@/components/site/agents-section';
import { EventBanner } from '@/components/site/event-banner';
import { FaqAccordion } from '@/components/site/faq-accordion';
import { GameFeatures } from '@/components/site/game-features';
import { Hero } from '@/components/site/hero';
import { LatestNews } from '@/components/site/latest-news';
import { MapsSection } from '@/components/site/maps-section';

export default function SiteHomePage() {
  return (
    <>
      <Hero />
      <LatestNews />
      <EventBanner />
      <AboutGame />
      <GameFeatures />
      <AgentsSection />
      <MapsSection />
      <FaqAccordion />
    </>
  );
}
