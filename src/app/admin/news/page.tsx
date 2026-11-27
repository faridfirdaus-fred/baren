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
      <p className="sr-only">
        Maksimal 3 berita terbaru tampil di landing page.
      </p>
      <NewsManager />
    </div>
  );
}
