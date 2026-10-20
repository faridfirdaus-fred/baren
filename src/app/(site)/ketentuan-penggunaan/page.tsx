import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ketentuan Penggunaan | BAREN",
  description:
    "Syarat dan ketentuan penggunaan situs serta layanan game BAREN.",
};

export default function TermsOfUsePage() {
  return (
    <div className="container-baren py-16 lg:py-24">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="text-sm font-semibold uppercase tracking-wider text-ember hover:underline"
        >
          ← Kembali ke Beranda
        </Link>
        <h1 className="display-xl mt-4 text-sand">KETENTUAN PENGGUNAAN</h1>
        <p className="mt-2 text-sm text-sand/60">
          Terakhir diperbarui: 20 Oktober 2026
        </p>

        <div className="mt-10 space-y-8 text-base leading-relaxed text-sand/80">
          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-sand">
              1. Penerimaan Ketentuan
            </h2>
            <p className="mt-3">
              Dengan mengakses situs web ini dan mendaftar pada program wishlist
              BAREN, Anda menyetujui untuk terikat oleh Ketentuan Penggunaan ini
              serta semua peraturan perundang-undangan yang berlaku.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-sand">
              2. Hak Kekayaan Intelektual
            </h2>
            <p className="mt-3">
              Seluruh materi pada situs ini, termasuk namun tidak terbatas pada
              nama BAREN, logo, ilustrasi seni, video, teks, dan kode program,
              adalah hak milik eksklusif pengembang BAREN dan dilindungi oleh
              hukum hak cipta.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-sand">
              3. Perilaku Komunitas
            </h2>
            <p className="mt-3">
              Saat menggunakan fitur interaktif seperti komentar komunitas, Anda
              dilarang mengunggah konten yang bersifat memfitnah, melecehkan,
              mengandung ujaran kebencian, spam, atau melanggar hak pihak lain.
              Pengelola berhak menghapus komentar yang melanggar ketentuan ini.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-sand">
              4. Batasan Tanggung Jawab
            </h2>
            <p className="mt-3">
              Layanan dan informasi pada situs ini disediakan &quot;sebagaimana
              adanya&quot;. Game BAREN sedang dalam tahap pengembangan aktif dan
              fitur dapat berubah sewaktu-waktu sebelum peluncuran resmi.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
