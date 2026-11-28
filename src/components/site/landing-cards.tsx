import Image from "next/image";
import { CharacterDeck } from "@/components/site/character-deck";
import type { LandingCard } from "@/lib/landing-cards-content";
import { resolvePublicAssetUrl } from "@/lib/assets-url";

type Props = {
  cards: LandingCard[];
};

export function LandingCards({ cards }: Props) {
  const characterCards = cards.filter(
    (c) =>
      c.slot?.toLowerCase().includes("karakter") ||
      c.eyebrow?.toLowerCase().includes("karakter"),
  );
  const otherCards = cards.filter(
    (c) =>
      !c.slot?.toLowerCase().includes("karakter") &&
      !c.eyebrow?.toLowerCase().includes("karakter"),
  );

  return (
    <>
      <CharacterDeck
        customCards={characterCards.length > 0 ? characterCards : undefined}
      />

      {otherCards.map((card, idx) => (
        <section
          key={card.id}
          className={`w-full py-16 sm:py-20 ${
            idx % 2 === 0
              ? "bg-white"
              : "border-y border-zinc-100 bg-zinc-50/70"
          }`}
        >
          <div className="container-baren">
            <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
              {card.imageUrl && (
                <div className="lg:col-span-6">
                  <div className="relative aspect-video overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-100 shadow-sm">
                    <Image
                      src={
                        resolvePublicAssetUrl(card.imageUrl) || card.imageUrl
                      }
                      fill
                      sizes="(min-width:1024px) 50vw, 100vw"
                      className="object-cover"
                      alt={card.title}
                      unoptimized
                    />
                  </div>
                </div>
              )}
              <div
                className={
                  card.imageUrl
                    ? "lg:col-span-6"
                    : "mx-auto max-w-3xl lg:col-span-12"
                }
              >
                <h2 className="text-3xl leading-tight font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
                  {card.title}
                </h2>
                {card.subtitle && (
                  <p className="mt-2 text-base font-semibold text-[#c83820]">
                    {card.subtitle}
                  </p>
                )}
                {card.body && (
                  <p className="mt-3 text-base leading-relaxed text-zinc-600">
                    {card.body}
                  </p>
                )}
                {card.ctaLabel && card.ctaUrl && card.ctaUrl !== "#" && (
                  <div className="mt-6">
                    <a
                      href={card.ctaUrl}
                      target={
                        card.ctaUrl.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        card.ctaUrl.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="inline-flex items-center justify-center rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
                    >
                      {card.ctaLabel}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
