import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | BAREN",
  description: "Kebijakan privasi dan pelindungan data pengguna game BAREN.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container-baren py-16 lg:py-24">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm font-semibold uppercase tracking-wider text-ember hover:underline"
        >
          ← Kembali ke Beranda
        </Link>
        <h1 className="display-xl mt-4 text-sand">KEBIJAKAN PRIVASI</h1>
        <p className="mt-2 text-sm text-sand/60">
          Terakhir diperbarui: 20 Oktober 2026
        </p>

        <div className="mt-10 space-y-8 text-base leading-relaxed text-sand/80">
          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-sand">
              1. Informasi yang Kami Kumpulkan
            </h2>
            <p className="mt-3">
              Kami mengumpulkan informasi yang Anda berikan secara langsung saat
              mendaftar wishlist atau berinteraksi dengan layanan kami, termasuk
              alamat email, nama tampilan profil, dan foto profil yang diperoleh
              melalui autentikasi Google OAuth.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-sand">
              2. Penggunaan Informasi
            </h2>
            <p className="mt-3">
              Informasi yang dikumpulkan digunakan untuk mengelola keikutsertaan
              wishlist game BAREN, mengirimkan notifikasi pembaruan saat game
              tersedia di Steam atau platform lainnya, serta memfasilitasi fitur
              komentar komunitas.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-sand">
              3. Pelindungan Data
            </h2>
            <p className="mt-3">
              Kami menerapkan standar keamanan teknis dan organisasi untuk
              melindungi data pribadi Anda dari akses, pengungkapan, atau
              perubahan yang tidak sah. Kami tidak menjual informasi pribadi
              Anda kepada pihak ketiga.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-sand">
              4. Hubungi Kami
            </h2>
            <p className="mt-3">
              Jika Anda memiliki pertanyaan mengenai Kebijakan Privasi ini,
              silakan hubungi kami melalui surel di{" "}
              <a
                href="mailto:halo@baren.game"
                className="text-ember underline hover:text-ember/80"
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
