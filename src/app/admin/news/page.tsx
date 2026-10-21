import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { NewsManager } from "@/components/admin/news-manager";

export const dynamic = "force-dynamic";

export default async function NewsPage() {
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
      <h1 className="text-2xl font-bold mb-6">Kelola Berita</h1>
      <p className="text-sm text-gray-600 mb-4">
        Maksimal 3 berita terbaru tampil di landing page. Berita yang
        dipublikasikan dapat diakses di /berita/[slug].
      </p>
      <NewsManager />
    </div>
  );
}
