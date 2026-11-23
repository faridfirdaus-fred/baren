import Image from "next/image";
import { Heart } from "lucide-react";
import { ScrollRevealWrapper } from "@/components/site/scroll-reveal-wrapper";
import { joinWishlistAction } from "@/components/site/actions";

/**
 * E14-4 & Migrasi UI — Seksi Download Steam Wishlist Banner (FR-PUB-13, FR-PUB-25).
 * - Desain chunky timber container dengan visual gameplay di kanan.
 * - Tombol "Gabung Wishlist" memicu login Google OAuth (joinWishlistAction).
 */
export function DownloadSection({
  isLoggedIn = false,
}: {
  isLoggedIn?: boolean;
}) {
  return (
    <ScrollRevealWrapper>
      <section
        id="unduh"
        className="relative w-full py-16 sm:py-24 bg-[#faf6ee] text-[#2f180a] overflow-hidden"
      >
        <div id="wishlist" className="container-baren">
          <div className="relative rounded-3xl bg-[#2f180a] border-4 border-[#422310] shadow-2xl overflow-hidden text-white p-8 sm:p-12 lg:p-16">
            {/* Background Texture & Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#2f180a] via-[#2f180a]/90 to-transparent z-10" />

            {/* Visual Gameplay di Kanan */}
            <div className="absolute top-0 right-0 w-full sm:w-2/3 h-full z-0 opacity-40 sm:opacity-75">
              <Image
                src="/media/baren-village-keyart.jpg"
                alt="Arena BAREN"
                fill
                className="object-cover object-right"
              />
            </div>

            {/* Konten Kiri */}
            <div className="relative z-20 max-w-xl flex flex-col items-start gap-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f59e0b]/20 border border-[#f59e0b] text-[#f59e0b] text-xs font-black uppercase tracking-wider">
                <span>{"//"} Segera Hadir</span> di Steam
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                Jadilah pemain pertama
              </h2>

              <p className="text-base sm:text-lg text-[#faf6ee]/85 leading-relaxed font-medium">
                Masuk dengan Google dan daftarkan emailmu ke wishlist. Kami
                kabari begitu BAREN siap dimainkan di Steam.
              </p>

              <div className="pt-4">
                {isLoggedIn ? (
                  <div className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full bg-[#10b981] text-white font-black text-sm uppercase tracking-wider shadow-lg border-2 border-white/30">
                    <span>✓</span> Sudah Terdaftar
                  </div>
                ) : (
                  <form action={joinWishlistAction}>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-[#c83820] hover:bg-[#a72d18] text-white font-black text-base uppercase tracking-wider shadow-[0_6px_20px_rgba(200,56,32,0.45)] border border-[#e4572e] transition-all hover:scale-105 active:scale-95 cursor-pointer"
                    >
                      <Heart className="w-5 h-5 fill-white" />
                      <span>Gabung Wishlist</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </ScrollRevealWrapper>
  );
}
