import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Lock } from "lucide-react";

import { auth } from "@/auth";
import { AdminLoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Masuk Panel Admin | BAREN",
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
    <main className="flex min-h-dvh w-full flex-col justify-between bg-zinc-50 px-4 py-6 text-zinc-900 sm:px-8">
      {/* Top Bar */}
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900"
        >
          <span aria-hidden="true">&larr;</span> Kembali ke Situs
        </Link>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Panel Admin</span>
        </div>
      </header>

      {/* Centered Clean White Login Card */}
      <div className="mx-auto my-auto w-full max-w-sm py-8">
        <div className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-xs sm:p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3.5 flex items-center gap-2.5">
              <Image
                src="/brand/baren-mark.svg"
                alt="Logo BAREN"
                width={32}
                height={32}
                priority
                className="h-8 w-8 rounded-lg"
              />
              <span className="text-base font-bold tracking-tight text-zinc-900">
                BAREN
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              Masuk Panel Admin
            </h1>
            <p className="mt-1 text-xs text-zinc-500">
              Gunakan email dan kata sandi administrator yang terdaftar.
            </p>
          </div>

          <AdminLoginForm accessDenied={accessDenied} />

          <p className="mt-5 text-center text-[11px] text-zinc-400">
            Sesi berakhir otomatis setelah 60 menit tidak aktif.
          </p>
        </div>

        <div className="mt-5 text-center">
          <Link
            href="/"
            className="text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900"
          >
            Bukan admin? Kembali ke halaman utama BAREN
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-zinc-400">
        <span>BAREN &copy; 2026</span>
      </footer>
    </main>
  );
}
