import Image from "next/image";
import { Heart } from "lucide-react";
import { ScrollRevealWrapper } from "@/components/site/scroll-reveal-wrapper";
import { joinWishlistAction } from "@/components/site/actions";

export function DownloadSection({
  isLoggedIn = false,
}: {
  isLoggedIn?: boolean;
}) {
  return (
    <ScrollRevealWrapper>
      <section id="unduh" className="w-full bg-white py-12 sm:py-16">
        <div id="wishlist" className="container-baren">
          <div className="grid grid-cols-1 items-center gap-8 overflow-hidden rounded-3xl border border-zinc-200 bg-zinc-50 p-7 sm:p-10 lg:grid-cols-12 lg:p-12">
            <div className="flex flex-col items-start gap-4 lg:col-span-7">
              <h2 className="text-3xl leading-tight font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
                Jadilah pemain pertama saat BAREN rilis
              </h2>

              <p className="max-w-xl text-sm leading-relaxed text-zinc-600 sm:text-base">
                Masuk dengan akun Google untuk mendaftarkan emailmu ke wishlist.
                Kami akan memberi tahu begitu halaman Steam dan jadwal rilis
                dibuka.
              </p>

              <div className="pt-2">
                {isLoggedIn ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-6 py-3 text-sm font-semibold text-emerald-800">
                    <span>✓</span>
                    <span>Sudah Terdaftar di Wishlist</span>
                  </div>
                ) : (
                  <form action={joinWishlistAction}>
                    <button
                      type="submit"
                      className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-[#c83820] px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#a72d18] active:scale-[0.99]"
                    >
                      <Heart className="h-4 w-4 fill-white" />
                      <span>Gabung Wishlist</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white">
                <Image
                  src="/art/about-art.jpg"
                  alt="Cuplikan pertandingan BAREN"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </ScrollRevealWrapper>
  );
}
