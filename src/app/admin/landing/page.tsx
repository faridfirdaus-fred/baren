import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LandingContentManager } from "@/components/admin/landing-content-manager";

export const dynamic = "force-dynamic";

export default async function AdminLandingPage() {
  let session = null;
  try {
    session = await auth();
  } catch {
    redirect("/admin/login");
  }
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user) redirect("/admin/login");
  if (role !== "admin") redirect("/admin/login?error=AksesDitolak");

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold uppercase tracking-wider text-sand">
          Kelola Konten Landing
        </h1>
        <p className="mt-2 text-sand-500">
          Ubah judul, eyebrow, deskripsi seksi, dan pesan kosong halaman utama
          tanpa deployment.
        </p>
      </div>
      <LandingContentManager />
    </div>
  );
}
