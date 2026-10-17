import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { AdminWishlistManager } from "@/components/admin/wishlist-manager";

export const dynamic = "force-dynamic";

export default async function AdminWishlistPage() {
  let session = null;
  try {
    session = await auth();
  } catch {
    redirect("/admin/login");
  }
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session?.user) redirect("/admin/login");
  if (role !== "admin") redirect("/admin/login?error=AksesDitolak");

  return <AdminWishlistManager />;
}
