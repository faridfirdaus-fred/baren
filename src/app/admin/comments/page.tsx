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
      <header className="mb-6 border-b border-zinc-200 pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
          Kelola Komentar
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Pantau dan hapus komentar pengunjung dari halaman utama.
        </p>
      </header>
      <CommentsManager />
    </div>
  );
}
