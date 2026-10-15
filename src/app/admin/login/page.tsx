import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AdminLoginForm } from "@/components/admin/login-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Masuk Admin — BAREN",
  description: "Halaman masuk khusus administrator BAREN.",
};

export default async function AdminLoginPage() {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | undefined)?.role;
    if (session?.user && role === "admin") redirect("/admin");
  } catch {
    // Tanpa DB/env saat build: tampilkan form login saja.
  }
  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest opacity-70">
            BAREN
          </p>
          <h1 className="mt-2 text-2xl font-bold">Masuk Admin</h1>
          <p className="mt-1 text-sm opacity-70">
            Halaman khusus administrator. Bukan untuk pengunjung.
          </p>
        </div>
        <AdminLoginForm />
      </div>
    </main>
  );
}
