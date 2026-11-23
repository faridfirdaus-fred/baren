import Image from "next/image";
import { CharacterDeck } from "@/components/site/character-deck";
import type { LandingCard } from "@/lib/landing-cards-content";
import { resolvePublicAssetUrl } from "@/lib/assets-url";

type Props = {
  cards: LandingCard[];
};

export function LandingCards({ cards }: Props) {
  // Pisahkan kartu karakter untuk deck interaktif dan kartu konten umum lainnya
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
      {/* Seksi Karakter Draggable / Swipeable Deck */}
      <CharacterDeck
        customCards={characterCards.length > 0 ? characterCards : undefined}
      />

      {/* Kartu Tambahan dari CMS jika ada */}
      {otherCards.map((card) => {
        const isDark = card.tone === "dark";
        return (
          <section
            key={card.id}
            className={`relative w-full py-16 sm:py-20 ${
              isDark
                ? "bg-[#2f180a] text-[#faf6ee]"
                : "bg-[#faf6ee] text-[#2f180a]"
            }`}
          >
            <div className="container-baren">
              <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
                {card.imageUrl && (
                  <div className="relative aspect-video overflow-hidden rounded-3xl border-4 border-[#2f180a]/20 shadow-xl bg-[#2f180a]">
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
                )}
                <div className={card.imageUrl ? "" : "lg:col-span-2"}>
                  {card.eyebrow && (
                    <span className="pill-eyebrow mb-4 inline-block">
                      {card.eyebrow}
                    </span>
                  )}
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mt-2">
                    {card.title}
                  </h2>
                  {card.subtitle && (
                    <p
                      className={`mt-3 text-lg font-bold ${
                        isDark ? "text-[#f59e0b]" : "text-[#c83820]"
                      }`}
                    >
                      {card.subtitle}
                    </p>
                  )}
                  {card.body && (
                    <p
                      className={`mt-4 text-base sm:text-lg leading-relaxed ${
                        isDark ? "text-[#faf6ee]/80" : "text-[#542d14]"
                      }`}
                    >
                      {card.body}
                    </p>
                  )}
                  {card.ctaLabel && card.ctaUrl && card.ctaUrl !== "#" && (
                    <div className="mt-8">
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
                        className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full font-bold uppercase text-white bg-[#c83820] hover:bg-[#a72d18] shadow-lg transition-transform active:scale-95"
                      >
                        {card.ctaLabel}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </>
  );
}
