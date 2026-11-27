import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { HowToPlayManager } from "@/components/admin/how-to-play-manager";

export const dynamic = "force-dynamic";

export default async function HowToPlayPage() {
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
      <span className="sr-only">Kelola How to Play</span>
      <HowToPlayManager />
    </div>
  );
}
