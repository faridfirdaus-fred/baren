import Image from "next/image";
import { Users, Flag, Home } from "lucide-react";

import { ScrollRevealWrapper } from "@/components/site/scroll-reveal-wrapper";
import type { FeatureItem } from "@/lib/features-content";
import { resolvePublicAssetUrl } from "@/lib/assets-url";

export type GameFeaturesProps = {
  eyebrow?: string | null;
  title?: string | null;
  emptyMessage?: string | null;
  features?: FeatureItem[];
};

// Default fallback items sesuai mockup BAREN-1
const DEFAULT_FEATURES: FeatureItem[] = [
  {
    id: 1,
    title: "Duel Tim 2 vs 2",
    description:
      "Kompak dengan partner, atur strategi, lalu kejar dan tangkap lawan sebelum mereka merebut benteng.",
    iconUrl: "",
    sortOrder: 1,
  },
  {
    id: 2,
    title: "Rebut Benteng",
    description:
      "Tembus penjagaan, sentuh benteng lawan, dan bawa kemenangan pulang ke kampungmu.",
    iconUrl: "",
    sortOrder: 2,
  },
  {
    id: 3,
    title: "Kampung Penuh Warna",
    description:
      "Jelajahi arena bernuansa desa Nusantara dengan rumah panggung, kebun pisang, dan ayam yang lalu.",
    iconUrl: "",
    sortOrder: 3,
  },
];

export function GameFeatures({
  eyebrow,
  title,
  emptyMessage,
  features = [],
}: GameFeaturesProps) {
  const resolvedEyebrow = eyebrow?.trim() || "FITUR GAME";
  const resolvedTitle = title?.trim() || "Kenapa BAREN seru dimainkan?";
  const resolvedEmpty =
    emptyMessage?.trim() || "Fitur permainan sedang disiapkan.";

  const displayFeatures = features.length > 0 ? features : DEFAULT_FEATURES;

  const iconStyles = [
    { bg: "bg-[#c83820]", icon: Users, color: "text-white" },
    { bg: "bg-[#10b981]", icon: Flag, color: "text-white" },
    { bg: "bg-[#2563eb]", icon: Home, color: "text-white" },
  ];

  return (
    <ScrollRevealWrapper>
      <section
        id="fitur"
        className="relative w-full py-16 sm:py-24 bg-[#faf6ee] text-[#2f180a] overflow-hidden"
      >
        <div className="container-baren">
          <div className="flex flex-col items-center text-center gap-3 mb-12 sm:mb-16">
            <span className="pill-eyebrow">{resolvedEyebrow}</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#2f180a]">
              {resolvedTitle}
            </h2>
          </div>

          {displayFeatures.length === 0 ? (
            <p className="text-center text-[#542d14]">{resolvedEmpty}</p>
          ) : null}
          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            {displayFeatures.map((feature, index) => {
              const iconConfig = iconStyles[index % iconStyles.length];
              const IconComp = iconConfig.icon;
              const hasCustomIcon = Boolean(feature.iconUrl);

              return (
                <article
                  key={feature.id}
                  className="flex flex-col rounded-3xl bg-white border-2 border-[#2f180a]/12 p-6 sm:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-6">
                    {hasCustomIcon ? (
                      <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-[#faf6ee] border border-[#2f180a]/10">
                        <Image
                          src={
                            (feature.iconUrl &&
                              resolvePublicAssetUrl(feature.iconUrl)) ||
                            feature.iconUrl ||
                            "/art/placeholder-feature.jpg"
                          }
                          alt={feature.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-14 h-14 rounded-full flex items-center justify-center ${iconConfig.bg} ${iconConfig.color} shadow-md`}
                      >
                        <IconComp className="w-7 h-7" />
                      </div>
                    )}
                    <span className="text-sm font-black text-[#8c7b6d] bg-[#faf6ee] px-3 py-1 rounded-full border border-[#2f180a]/10">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black text-[#2f180a] tracking-tight mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base leading-relaxed text-[#542d14]">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </ScrollRevealWrapper>
  );
}
