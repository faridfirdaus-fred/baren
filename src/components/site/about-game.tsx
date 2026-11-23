import Image from "next/image";

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
    "BAREN terinspirasi dari permainan tradisional Baren atau Bebentengan. Dua tim berlomba menjaga benteng sendiri sambil menyusup ke wilayah lawan. Sekali tersentuh, kamu tertangkap! Dimainkan satu layar bersama teman dan keluarga. Aturannya mudah dipelajari, tapi serunya sulit berhenti.";

  const content = description || defaultDesc;

  return (
    <section
      id="tentang"
      className="relative w-full py-16 sm:py-24 bg-[#faf6ee] text-[#2f180a] overflow-hidden"
    >
      <div className="container-baren">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Kolom Kiri: Cerita & Info */}
          <div className="lg:col-span-7 flex flex-col items-start gap-6">
            <span className="pill-eyebrow">{eyebrow}</span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-[#2f180a]">
              {title}
            </h2>

            <p className="text-base sm:text-lg leading-relaxed text-[#542d14] max-w-2xl">
              {content}
            </p>

            {/* 3 Pill Badges */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 w-full max-w-lg pt-4">
              <div className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-[#2f180a]/15 shadow-sm text-center">
                <span className="text-lg sm:text-2xl font-black text-[#c83820]">
                  2 vs 2
                </span>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#8c7b6d] mt-1">
                  TIM SERU
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-[#2f180a]/15 shadow-sm text-center">
                <span className="text-lg sm:text-2xl font-black text-[#2f180a]">
                  Lokal
                </span>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#8c7b6d] mt-1">
                  MAIN BARENG
                </span>
              </div>
              <div className="flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl bg-white border-2 border-[#2f180a]/15 shadow-sm text-center">
                <span className="text-lg sm:text-2xl font-black text-[#f59e0b]">
                  Steam
                </span>
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#8c7b6d] mt-1">
                  SEGERA HADIR
                </span>
              </div>
            </div>
          </div>

          {/* Kolom Kanan: Framed Screenshot */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-3xl p-3 bg-[#422310] border-4 border-[#542d14] shadow-2xl overflow-hidden group">
              <div className="relative aspect-video sm:aspect-4/3 w-full rounded-2xl overflow-hidden bg-[#2f180a]">
                <Image
                  src={screenshotUrl}
                  alt="Gameplay BAREN di kampung Nusantara"
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 40vw"
                />
              </div>

              {/* Tilted badge "Dari Nusantara!" */}
              <div className="absolute -bottom-1 -left-1 sm:bottom-4 sm:left-4 z-10">
                <span className="inline-block bg-[#c83820] text-white text-xs sm:text-sm font-black uppercase px-4 py-1.5 rounded-full shadow-lg border-2 border-white -rotate-3">
                  Dari Nusantara!
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
