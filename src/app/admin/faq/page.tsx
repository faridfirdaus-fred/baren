import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { FaqManager } from "@/components/admin/faq-manager";

export const dynamic = "force-dynamic";

export default async function AdminFaqPage() {
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
    <div>
      <h1 className="mb-6 text-2xl font-bold">Kelola FAQ</h1>
      <FaqManager />
    </div>
  );
}
