import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { CommentsManager } from "@/components/admin/comments-manager";

export const dynamic = "force-dynamic";

export default async function CommentsPage() {
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
      <h1 className="text-2xl font-bold mb-6">Kelola Komentar</h1>
      <CommentsManager />
    </div>
  );
}
