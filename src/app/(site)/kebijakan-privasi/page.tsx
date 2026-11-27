import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | BAREN",
  description: "Kebijakan privasi dan pelindungan data pengguna game BAREN.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white pt-24 pb-20 sm:pt-28">
      <div className="container-baren max-w-3xl">
        <Link
          href="/"
          className="text-xs font-semibold text-zinc-500 transition-colors hover:text-zinc-900"
        >
          &larr; Kembali ke Beranda
        </Link>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-zinc-950 sm:text-4xl">
          Kebijakan Privasi
        </h1>
        <p className="mt-2 text-xs text-zinc-400">
          Terakhir diperbarui: 27 November 2026
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-zinc-600 sm:text-base">
          <section>
            <h2 className="text-lg font-bold text-zinc-950">
              1. Informasi yang Kami Kumpulkan
            </h2>
            <p className="mt-2">
              Kami mengumpulkan informasi yang Anda berikan secara langsung saat
              mendaftar wishlist atau berinteraksi dengan layanan kami, termasuk
              alamat email, nama tampilan profil, dan foto profil yang diperoleh
              melalui autentikasi Google OAuth.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-950">
              2. Penggunaan Informasi
            </h2>
            <p className="mt-2">
              Informasi yang dikumpulkan digunakan untuk mengelola keikutsertaan
              wishlist game BAREN, mengirimkan notifikasi pembaruan saat game
              tersedia di Steam, serta memfasilitasi fitur komentar komunitas.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-950">
              3. Pelindungan Data
            </h2>
            <p className="mt-2">
              Kami menerapkan standar keamanan teknis untuk melindungi data
              pribadi Anda dari akses atau perubahan yang tidak sah, serta tidak
              menjual informasi pribadi Anda kepada pihak ketiga.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-950">4. Hubungi Kami</h2>
            <p className="mt-2">
              Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini,
              silakan hubungi kami melalui surel di{" "}
              <a
                href="mailto:halo@baren.game"
                className="font-medium text-[#c83820] underline"
              >
                halo@baren.game
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
