import Image from "next/image";
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

const DEFAULT_STEPS: HowToPlayStep[] = [
  {
    id: 1,
    step: 1,
    title: "Sentuh Benteng & Ambil Status FRESH",
    description:
      "Mulai dari markas timmu untuk mengisi energi FRESH agar bisa mengejar dan menangkap lawan.",
    mediaUrl: "",
    sortOrder: 1,
  },
  {
    id: 2,
    step: 2,
    title: "Kejar & Tangkap Lawan ke Tahanan",
    description:
      "Kejar pemain lawan di arena, tekan tombol Tag untuk memasukkannya ke Zona Tahanan.",
    mediaUrl: "",
    sortOrder: 2,
  },
  {
    id: 3,
    step: 3,
    title: "Selamatkan Rekan Satu Tim",
    description:
      "Sentuh rantai kawan yang tertahan untuk membebaskannya lalu lari kembali ke benteng sendiri.",
    mediaUrl: "",
    sortOrder: 3,
  },
  {
    id: 4,
    step: 4,
    title: "Rebut Benteng Lawan (BAREN!)",
    description:
      "Kuasai benteng lawan atau tahan seluruh anggota tim lawan untuk memenangkan ronde!",
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
      <section id="cara-main" className="w-full bg-white py-16 sm:py-24">
        <div className="container-baren">
          <div className="mb-12 flex flex-col items-center gap-3 text-center sm:mb-14">
            <h2 className="text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
              {resolvedTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
            {/* Showcase Video / Visual Mekanisme */}
            <div className="lg:col-span-6">
              <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 p-2 shadow-lg shadow-zinc-900/5">
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-zinc-900">
                  {content.videoUrl ? (
                    <video
                      className="h-full w-full object-cover"
                      controls
                      poster="/art/feature-2.jpg"
                    >
                      <source
                        src={
                          resolvePublicAssetUrl(content.videoUrl) ||
                          content.videoUrl
                        }
                        type="video/mp4"
                      />
                      Peramban Anda tidak mendukung pemutaran video.
                    </video>
                  ) : (
                    <Image
                      src="/art/feature-2.jpg"
                      alt="Mekanisme Tag dan Zona Tahanan BAREN"
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                      unoptimized
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Daftar Langkah */}
            <div className="flex flex-col gap-3.5 lg:col-span-6">
              {stepsToDisplay.map((step, idx) => (
                <div
                  key={step.id || idx}
                  className="flex items-start gap-4 rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:border-zinc-300 sm:p-5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-sm font-bold text-white">
                    {String(step.step || idx + 1).padStart(2, "0")}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold tracking-tight text-zinc-950">
                      {step.title}
                    </h3>
                    {step.description && (
                      <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                        {step.description}
                      </p>
                    )}
                    {step.mediaUrl && (
                      <div className="relative mt-3 aspect-video w-full max-w-xs overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                        <Image
                          src={
                            resolvePublicAssetUrl(step.mediaUrl) ||
                            step.mediaUrl
                          }
                          alt={step.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
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
