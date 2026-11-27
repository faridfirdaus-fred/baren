import { auth, signOut } from "@/auth";
import { joinWishlistAction } from "./actions";

export async function WishlistMenu() {
  let email: string | null = null;
  try {
    email = (await auth())?.user?.email ?? null;
  } catch {
    email = null;
  }

  const buttonCls =
    "cursor-pointer rounded-full bg-[#c83820] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#a72d18] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c83820]";

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
            className={`inline-flex w-full items-center justify-center py-2.5 text-sm ${buttonCls}`}
          >
            Gabung Wishlist
          </button>
        </form>
      </>
    );
  }

  return (
    <>
      <div className="hidden min-w-0 items-center gap-2.5 md:flex">
        <span
          className="max-w-40 truncate text-xs font-medium text-zinc-600"
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
            className="cursor-pointer rounded-full border border-zinc-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
          >
            Keluar
          </button>
        </form>
      </div>
      <div className="flex w-full flex-col gap-2.5 md:hidden">
        <span
          className="max-w-full truncate text-xs font-medium text-zinc-600"
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
            className="inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            Keluar
          </button>
        </form>
      </div>
    </>
  );
}
