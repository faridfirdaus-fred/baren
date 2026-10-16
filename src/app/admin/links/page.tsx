import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LinksManager } from "@/components/admin/links-manager";

export const dynamic = "force-dynamic";

export default async function AdminLinksPage() {
  // Guard: auth and role check identik dengan dashboard
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
    <main>
      <h1>Kelola Tautan & Kontak</h1>
      <LinksManager />
    </main>
  );
}
