import { redirect } from "next/navigation";

import { auth, signOut } from "@/auth";
import { AdminAccountForm } from "@/components/admin/account-form";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
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
    <main>
      <h1>Dasbor Admin</h1>
      <p>Masuk sebagai {(session.user as { email?: string }).email}</p>
      <AdminAccountForm
        name={session.user.name ?? ""}
        email={(session.user as { email?: string }).email ?? ""}
      />
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/admin/login" });
        }}
      >
        <button type="submit">Keluar</button>
      </form>
    </main>
  );
}
