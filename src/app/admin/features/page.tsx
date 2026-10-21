import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { FeaturesManager } from "@/components/admin/features-manager";

export const dynamic = "force-dynamic";

export default async function AdminFeaturesPage() {
  // Guard: auth dan role check identik dengan dashboard (lapisan kedua proxy).
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
      <h1 className="mb-2 text-2xl font-bold">Kelola Fitur</h1>
      <p className="mb-6 text-sm text-sand-600">
        Fitur tampil di seksi FITUR UTAMA landing page.
      </p>
      <FeaturesManager />
    </div>
  );
}
