import Image from "next/image";
import { Play } from "lucide-react";
import { ScrollRevealWrapper } from "@/components/site/scroll-reveal-wrapper";
import type {
  HowToPlayContent,
  HowToPlayStep,
} from "@/lib/how-to-play-content";
import { resolvePublicAssetUrl } from "@/lib/assets-url";

type Props = {
  content: HowToPlayContent;
  title?: string | null;
};

// Default fallback 4 langkah sesuai mockup BAREN-1
const DEFAULT_STEPS: HowToPlayStep[] = [
  {
    id: 1,
    step: 1,
    title: "Bentuk dua tim",
    description: "Pilih karakter, lalu bagi menjadi tim oranye dan biru.",
    mediaUrl: "",
    sortOrder: 1,
  },
  {
    id: 2,
    step: 2,
    title: "Jaga benteng sendiri",
    description: "Hadang lawan agar tidak menyentuh benteng timmu.",
    mediaUrl: "",
    sortOrder: 2,
  },
  {
    id: 3,
    step: 3,
    title: "Sentuh untuk menangkap",
    description: "Kejar lawan di wilayahmu dan tahan mereka di penjara.",
    mediaUrl: "",
    sortOrder: 3,
  },
  {
    id: 4,
    step: 4,
    title: "Rebut benteng lawan",
    description: "Tim pertama yang menyentuh benteng lawan menang.",
    mediaUrl: "",
    sortOrder: 4,
  },
];

export function HowToPlay({ content, title }: Props) {
  const resolvedTitle = title?.trim() || "Mudah dipelajari dalam semenit";

  const stepsToDisplay =
    content.steps.length > 0 ? content.steps : DEFAULT_STEPS;

  return (
    <ScrollRevealWrapper>
      <section
        id="cara-main"
        className="relative w-full py-16 sm:py-24 bg-[#faf6ee] text-[#2f180a] overflow-hidden"
      >
        <div className="container-baren">
          <div className="flex flex-col items-center text-center gap-3 mb-12 sm:mb-16">
            <span className="pill-eyebrow">CARA MAIN</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#2f180a]">
              {resolvedTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Kolom Kiri: Video Demo Gameplay */}
            <div className="lg:col-span-6 relative">
              <div className="relative rounded-3xl p-3 bg-[#422310] border-4 border-[#542d14] shadow-2xl overflow-hidden group">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#2f180a]">
                  {content.videoUrl ? (
                    <video
                      className="h-full w-full object-cover"
                      controls
                      poster="/media/baren-village-keyart.jpg"
                    >
                      <source
                        src={
                          resolvePublicAssetUrl(content.videoUrl) ||
                          content.videoUrl
                        }
                        type="video/mp4"
                      />
                      Browser Anda tidak mendukung video demo.
                    </video>
                  ) : (
                    <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-[#2f180a] to-[#1f1007]">
                      {/* Thumbnail Latar */}
                      <Image
                        src="/media/baren-village-keyart.jpg"
                        alt="Demo Gameplay BAREN"
                        fill
                        className="object-cover opacity-60"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-[#2f180a]/40 backdrop-blur-[1px]" />
                      <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-[#c83820] text-white flex items-center justify-center shadow-lg mb-3 hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 fill-white ml-1" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-wider text-white bg-[#2f180a]/80 px-4 py-1 rounded-full border border-white/20">
                          VIDEO DEMO GAMEPLAY
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Kolom Kanan: 4 Langkah Bernomor */}
            <div className="lg:col-span-6 flex flex-col gap-3.5 sm:gap-4">
              {stepsToDisplay.map((step, idx) => (
                <div
                  key={step.id || idx}
                  className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-white border-2 border-[#2f180a]/12 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#c83820] text-white font-black text-lg flex items-center justify-center shrink-0 shadow-md">
                    {step.step || idx + 1}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-base sm:text-lg font-black text-[#2f180a] tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#542d14] leading-relaxed mt-0.5">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </ScrollRevealWrapper>
  );
}
