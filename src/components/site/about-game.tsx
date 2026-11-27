import Image from "next/image";
import { resolvePublicAssetUrl } from "@/lib/assets-url";

interface AboutGameProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  screenshotUrl?: string;
}

export function AboutGame({
  eyebrow = "TENTANG GAME",
  title = "Permainan kampung, rasa pesta modern",
  description,
  screenshotUrl = "/art/about-art.jpg",
}: AboutGameProps) {
  const defaultDesc =
    "BAREN terinspirasi dari permainan tradisional Baren atau Bebentengan. Dua tim berlomba menjaga benteng sendiri sambil menyusup ke wilayah lawan dalam satu layar bersama teman dan keluarga. Aturannya cepat dipahami, namun penuh strategi kejutan di setiap ronde.";

  const content = description?.trim() || defaultDesc;
  const resolvedTitle = title?.trim() || "Permainan kampung, rasa pesta modern";
  const resolvedImage =
    resolvePublicAssetUrl(screenshotUrl) ||
    screenshotUrl ||
    "/art/about-art.jpg";

  return (
    <section
      id="tentang"
      className="w-full border-y border-zinc-100 bg-zinc-50/70 py-16 sm:py-24"
    >
      <div className="container-baren">
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="flex flex-col items-start gap-5 lg:col-span-6">
            <span className="pill-eyebrow">{eyebrow}</span>

            <h2 className="text-3xl leading-tight font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
              {resolvedTitle}
            </h2>

            <p className="max-w-2xl text-base leading-relaxed text-zinc-600 sm:text-lg">
              {content}
            </p>

            <div className="grid w-full max-w-lg grid-cols-3 gap-3 pt-2">
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-2xs">
                <span className="block text-xl font-extrabold text-zinc-950 sm:text-2xl">
                  2 vs 2
                </span>
                <span className="mt-1 block text-[11px] font-semibold text-zinc-500">
                  Tim Kompetitif
                </span>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-2xs">
                <span className="block text-xl font-extrabold text-zinc-950 sm:text-2xl">
                  3 Menit
                </span>
                <span className="mt-1 block text-[11px] font-semibold text-zinc-500">
                  Cepat & Seru
                </span>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white p-4 text-center shadow-2xs">
                <span className="block text-xl font-extrabold text-[#c83820] sm:text-2xl">
                  Steam
                </span>
                <span className="mt-1 block text-[11px] font-semibold text-zinc-500">
                  Segera Hadir
                </span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-white p-2 shadow-lg shadow-zinc-900/5">
              <div className="relative aspect-16/10 w-full overflow-hidden rounded-2xl bg-zinc-100">
                <Image
                  src={resolvedImage}
                  alt="Gameplay BAREN di halaman kampung"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
