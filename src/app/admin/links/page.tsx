import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LinksManager } from "@/components/admin/links-manager";

export const dynamic = "force-dynamic";

export default async function AdminLinksPage() {
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
          Kelola Tautan Sosial
        </h1>
        <p className="mt-2 text-sand-500">
          Kelola daftar tautan media sosial resmi game BAREN.
        </p>
      </div>
      <LinksManager />
    </div>
  );
}
