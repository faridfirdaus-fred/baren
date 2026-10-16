import Image from "next/image";
import Link from "next/link";

import { SectionShell } from "@/components/site/section-shell";
import type { LandingCard } from "@/lib/landing-cards-content";

type Props = {
  cards: LandingCard[];
};

export function LandingCards({ cards }: Props) {
  return (
    <>
      {cards.map((card) => {
        const tone = card.tone === "light" ? "light" : "dark";

        return (
          <SectionShell key={card.id} tone={tone}>
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              {card.imageUrl && (
                <div className="relative aspect-video overflow-hidden rounded-lg bg-ink-700">
                  <Image
                    src={card.imageUrl}
                    fill
                    sizes="(min-width:1024px) 50vw, 100vw"
                    className="object-cover"
                    alt={card.title}
                  />
                </div>
              )}
              <div className={card.imageUrl ? "" : "lg:col-span-2"}>
                {card.eyebrow && (
                  <p className="eyebrow text-ember-700">{card.eyebrow}</p>
                )}
                <h2 className="display-xl mt-4 text-[clamp(2rem,4vw,3.25rem)]">
                  {card.title}
                </h2>
                {card.subtitle && (
                  <p className="mt-4 text-xl text-ink-600">{card.subtitle}</p>
                )}
                {card.body && (
                  <p className="mt-6 text-lg leading-relaxed text-ink-700">
                    {card.body}
                  </p>
                )}
                {card.ctaLabel && card.ctaUrl && (
                  <Link
                    href={card.ctaUrl}
                    className="mt-8 inline-block rounded-lg bg-ember-700 px-8 py-4 font-bold uppercase tracking-wide text-white transition-colors hover:bg-ember-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
                  >
                    {card.ctaLabel}
                  </Link>
                )}
              </div>
            </div>
          </SectionShell>
        );
      })}
    </>
  );
}
