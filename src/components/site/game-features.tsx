import Image from "next/image";

import { ScrollRevealWrapper } from "@/components/site/scroll-reveal-wrapper";
import type { FeatureItem } from "@/lib/features-content";
import { resolvePublicAssetUrl } from "@/lib/assets-url";

export type GameFeaturesProps = {
  eyebrow?: string | null;
  title?: string | null;
  emptyMessage?: string | null;
  features?: FeatureItem[];
};

const FALLBACK_IMAGES = [
  "/art/feature-1.jpg",
  "/art/feature-2.jpg",
  "/art/feature-3.jpg",
];

const DEFAULT_FEATURES: FeatureItem[] = [
  {
    id: 1,
    title: "Duel Tim 2 vs 2",
    description:
      "Kompak bersama partner dalam satu layar, atur strategi pancingan, lalu tangkap lawan sebelum mereka menyentuh bentengmu.",
    iconUrl: "/art/feature-1.jpg",
    sortOrder: 1,
  },
  {
    id: 2,
    title: "Tag, Tahanan & Rescue",
    description:
      "Sentuh markas untuk mendapat status FRESH, masukkan lawan ke zona tahanan, atau selamatkan teman untuk membalikkan keadaan.",
    iconUrl: "/art/feature-2.jpg",
    sortOrder: 2,
  },
  {
    id: 3,
    title: "Arena Kampung Variatif",
    description:
      "Bertanding di Lapang Kampung, Pasar Ramai penuh gerobak, hingga Alun-Alun Hujan yang licin dan penuh kejutan.",
    iconUrl: "/art/feature-3.jpg",
    sortOrder: 3,
  },
];

export function GameFeatures({
  eyebrow,
  title,
  features = [],
}: GameFeaturesProps) {
  const resolvedEyebrow = eyebrow?.trim() || "FITUR GAME";
  const resolvedTitle = title?.trim() || "Kenapa BAREN seru dimainkan?";
  const displayFeatures = features.length > 0 ? features : DEFAULT_FEATURES;

  return (
    <ScrollRevealWrapper>
      <section id="fitur" className="w-full bg-white py-16 sm:py-24">
        <div className="container-baren">
          <div className="mb-12 flex flex-col items-center gap-3 text-center sm:mb-14">
            <span className="pill-eyebrow">{resolvedEyebrow}</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
              {resolvedTitle}
            </h2>
          </div>

          <div className="grid gap-6 sm:gap-7 md:grid-cols-3">
            {displayFeatures.map((feature, index) => {
              const fallbackImg =
                FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
              const imgSrc =
                (feature.iconUrl && resolvePublicAssetUrl(feature.iconUrl)) ||
                feature.iconUrl ||
                fallbackImg;

              return (
                <article
                  key={feature.id}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white transition-all duration-200 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-900/5"
                >
                  <div className="relative aspect-16/10 w-full overflow-hidden bg-zinc-100">
                    <Image
                      src={imgSrc}
                      alt={feature.title}
                      fill
                      sizes="(min-width: 768px) 33vw, 100vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      unoptimized
                    />
                    <span className="absolute top-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-bold text-zinc-900 shadow-2xs backdrop-blur-xs">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-lg font-bold tracking-tight text-zinc-950 sm:text-xl">
                      {feature.title}
                    </h3>
                    {feature.description && (
                      <p className="mt-2 text-sm leading-relaxed text-zinc-600">
                        {feature.description}
                      </p>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </ScrollRevealWrapper>
  );
}
