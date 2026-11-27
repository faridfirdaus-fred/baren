import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoginLoading() {
  return (
    <main className="flex min-h-dvh w-full flex-col justify-between bg-zinc-50 px-4 py-6 text-zinc-900 sm:px-8">
      <header className="mx-auto flex w-full max-w-5xl items-center justify-between">
        <Skeleton className="h-6 w-28" />
        <Skeleton className="h-5 w-24" />
      </header>

      <div className="mx-auto my-auto w-full max-w-sm py-8">
        <div
          role="status"
          aria-live="polite"
          className="space-y-5 rounded-2xl border border-zinc-200 bg-white p-7 shadow-xs sm:p-8"
        >
          <div className="flex flex-col items-center space-y-2">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-4 w-56" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
            <Skeleton className="h-11 w-full" />
          </div>
          <span className="sr-only">Memuat halaman masuk admin...</span>
        </div>
      </div>

      <footer className="text-center text-xs text-zinc-400">
        <span>BAREN &copy; 2026</span>
      </footer>
    </main>
  );
}
