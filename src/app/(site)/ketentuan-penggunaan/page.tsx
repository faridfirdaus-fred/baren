import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ketentuan Penggunaan | BAREN",
  description:
    "Syarat dan ketentuan penggunaan situs serta layanan game BAREN.",
};

export default function TermsOfUsePage() {
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
          Ketentuan Penggunaan
        </h1>
        <p className="mt-2 text-xs text-zinc-400">
          Terakhir diperbarui: 27 November 2026
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-zinc-600 sm:text-base">
          <section>
            <h2 className="text-lg font-bold text-zinc-950">
              1. Penerimaan Ketentuan
            </h2>
            <p className="mt-2">
              Dengan mengakses situs web ini dan mendaftar pada program wishlist
              BAREN, Anda menyetujui untuk terikat oleh Ketentuan Penggunaan ini
              serta peraturan perundang-undangan yang berlaku.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-950">
              2. Hak Kekayaan Intelektual
            </h2>
            <p className="mt-2">
              Seluruh materi pada situs ini, termasuk nama BAREN, logo,
              ilustrasi seni, dokumentasi acara, video, teks, dan kode program,
              adalah hak milik pengembang BAREN dan dilindungi hukum hak cipta.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-950">
              3. Perilaku Komunitas
            </h2>
            <p className="mt-2">
              Saat menggunakan fitur komentar komunitas, Anda dilarang
              mengunggah konten yang bersifat memfitnah, melecehkan, mengandung
              ujaran kebencian, atau spam. Pengelola berhak menghapus komentar
              yang melanggar ketentuan ini.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-zinc-950">
              4. Batasan Tanggung Jawab
            </h2>
            <p className="mt-2">
              Layanan dan informasi pada situs ini disediakan sebagaimana
              adanya. Game BAREN sedang dalam tahap pengembangan aktif dan fitur
              dapat diperbarui sebelum peluncuran resmi.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
