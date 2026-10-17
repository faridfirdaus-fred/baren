import { auth, signOut } from "@/auth";
import { joinWishlistAction } from "./actions";

// E11-4: tombol wishlist + menu akun pengunjung untuk slot header.
// Anonim → form POST login Google (Auth.js v5: GET /signin/:provider tidak
// didukung — harus POST via signIn); login → email + tombol keluar.
// Dua varian responsif karena slot dipakai di header desktop dan menu mobil.
export async function WishlistMenu() {
  let email: string | null = null;
  try {
    email = (await auth())?.user?.email ?? null;
  } catch {
    email = null;
  }

  const buttonCls =
    "rounded-none bg-ember-700 px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-sand transition-colors hover:bg-ember-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember";

  if (!email) {
    return (
      <>
        <form action={joinWishlistAction} className="hidden md:inline-flex">
          <button type="submit" className={`inline-flex ${buttonCls}`}>
            Gabung Wishlist
          </button>
        </form>
        <form action={joinWishlistAction} className="md:hidden">
          <button
            type="submit"
            className={`inline-flex w-full items-center justify-center ${buttonCls}`}
          >
            Gabung Wishlist
          </button>
        </form>
      </>
    );
  }

  return (
    <>
      <div className="hidden min-w-0 items-center gap-3 md:flex">
        <span className="max-w-44 truncate text-sm text-sand/80" title={email}>
          {email}
        </span>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="rounded-none bg-ember-700 px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-sand transition-colors hover:bg-ember-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
          >
            Keluar
          </button>
        </form>
      </div>
      <div className="flex w-full flex-col gap-3 md:hidden">
        <span
          className="max-w-full truncate text-sm text-sand/80"
          title={email}
        >
          {email}
        </span>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/" });
          }}
        >
          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-none bg-ember-700 px-5 py-3 text-sm font-semibold uppercase tracking-[0.08em] text-sand transition-colors hover:bg-ember-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
          >
            Keluar
          </button>
        </form>
      </div>
    </>
  );
}
