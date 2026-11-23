import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";

import { auth } from "@/auth";
import { AdminLoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Masuk Panel Admin — BAREN",
  description: "Halaman masuk khusus administrator BAREN.",
};

type PageProps = {
  searchParams?: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: PageProps) {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (session?.user && role === "admin") redirect("/admin");
  } catch {
    // Tanpa DB/env saat build: tampilkan form login saja.
  }

  const params = searchParams ? await searchParams : undefined;
  const accessDenied = params?.error === "AksesDitolak";

  return (
    <main className="relative flex min-h-dvh w-full overflow-x-clip bg-[#faf6ee] text-[#2f180a]">
      {/* 50/50 Split Grid Desktop */}
      <div className="grid w-full grid-cols-1 md:grid-cols-2 min-h-dvh">
        {/* Kolom Kiri: Showcase Art Visual Nusantara (Desktop) */}
        <div className="relative hidden md:flex flex-col justify-end p-12 lg:p-16 overflow-hidden bg-[#2f180a]">
          <Image
            src="/media/baren-village-keyart.jpg"
            alt="Pemandangan Desa BAREN"
            fill
            priority
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1f1007] via-[#2f180a]/50 to-transparent z-10" />

          {/* Text Overlay di Bawah */}
          <div className="relative z-20 max-w-lg text-white">
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight mb-3 drop-shadow-md">
              Kelola kampung BAREN dari satu panel
            </h2>
            <p className="text-sm lg:text-base text-[#faf6ee]/90 leading-relaxed font-medium">
              Ubah konten landing, berita, galeri, dan pantau pendaftar wishlist
              tanpa menyentuh kode.
            </p>
          </div>
        </div>

        {/* Kolom Kanan: Card Form Login Admin */}
        <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-[#faf6ee]">
          {/* Top Bar Link */}
          <div className="flex items-center justify-between pb-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#8c7b6d] hover:text-[#c83820] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
            >
              <span aria-hidden="true">&larr;</span> Kembali ke Situs
            </Link>
          </div>

          {/* Centered Floating Card */}
          <div className="my-auto mx-auto w-full max-w-md">
            <div className="rounded-3xl bg-white border-2 border-ember/25 p-7 sm:p-9 shadow-xl backdrop-blur-md">
              {/* Header Card */}
              <div className="mb-6 flex flex-col items-center text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#2f180a] p-2.5 shadow-md">
                  <Image
                    src="/brand/baren-mark.svg"
                    alt="Logo BAREN"
                    width={36}
                    height={36}
                    priority
                  />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10b981]/15 text-[#059669] text-[11px] font-black uppercase tracking-wider mb-2">
                  <Lock className="w-3 h-3" />
                  <span>KHUSUS ADMIN</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#2f180a] tracking-tight">
                  Masuk Panel Admin
                </h1>
                <p className="mt-1 text-xs text-[#8c7b6d] font-medium">
                  Gunakan email dan kata sandi admin yang terdaftar.
                </p>
              </div>

              {/* Form Komponen */}
              <AdminLoginForm accessDenied={accessDenied} />

              <div className="mt-5 text-center">
                <p className="text-[11px] text-[#8c7b6d]">
                  Sesi berakhir otomatis 60 menit
                </p>
              </div>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/"
                className="text-xs font-bold text-[#8c7b6d] hover:text-[#c83820] transition-colors"
              >
                Bukan admin? Kembali ke situs BAREN
              </Link>
            </div>
          </div>

          {/* Footer Bawah */}
          <div className="pt-6 text-center text-xs text-[#8c7b6d]">
            <span>BAREN &copy; 2026. Hak cipta dilindungi.</span>
          </div>
        </div>
      </div>
    </main>
  );
}
