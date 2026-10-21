import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { HeroManager } from "@/components/admin/hero-manager";

export const dynamic = "force-dynamic";

export default async function HeroPage() {
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
      <h1 className="text-2xl font-bold mb-6">Kelola Hero</h1>
      <HeroManager />
    </div>
  );
}
