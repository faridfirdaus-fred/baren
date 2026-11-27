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

  return <LandingContentManager />;
}
