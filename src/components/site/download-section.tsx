// E7-4 — Seksi unduhan situs publik (Server Component).
// Daftar per platform dibaca dari tabel `download_links` (E3-8) dengan
// urutan deterministik `sortOrder` lalu `id` (lihat `src/lib/api/links.ts`).
// Daftar kosong atau DB gagal dibaca = game belum rilis → tampil
// "Segera Hadir" (FR-PUB-25), tidak pernah blank. Tautan unduhan adalah
// tautan keluar sehingga memakai `target="_blank" rel="noopener noreferrer"`
// via `CtaButton external` (E7-6/EI-07); anchor internal (#daftar) tanpa itu.

import { getDb } from "@/db";
import { downloadLinks } from "@/db/schema";
import { readDownloadLinks, type DownloadRow } from "@/lib/api/links";
import { CtaButton } from "./cta-button";
import { IconArrowUpRight } from "./icon";
import { SectionShell } from "./section-shell";

export type DownloadSectionItem = {
  platform: string;
  label: string;
  url: string;
};

export type DownloadSectionProps = {
  /** Override dari integrator (mis. hasil fetch `page.tsx`).
      `undefined` = baca DB di sini; `[]` = belum rilis ("Segera Hadir"). */
  items?: DownloadSectionItem[];
};

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/** Baca tautan unduhan dari DB. Gagal (tanpa env/DB mati) → null. */
async function getDownloadItems(): Promise<DownloadSectionItem[] | null> {
  try {
    const db = getDb();
    const rows = await db.select().from(downloadLinks);
    const lister = {
      list: async (): Promise<DownloadRow[]> =>
        rows.map((r) => ({
          id: r.id,
          platform: r.platform,
          label: r.label,
          url: r.url,
          sortOrder: r.sortOrder,
        })),
    };
    const ordered = await readDownloadLinks(lister);
    return ordered
      .filter((r) => isHttpsUrl(r.url))
      .map((r) => ({ platform: r.platform, label: r.label, url: r.url }));
  } catch {
    return null;
  }
}

export async function DownloadSection({ items }: DownloadSectionProps) {
  const fetched = items === undefined ? await getDownloadItems() : items;
  const list = (fetched ?? []).filter((item) => isHttpsUrl(item.url));

  return (
    <SectionShell id="unduh" tone="dark" className="border-t border-sand/15">
      <div className="max-w-3xl">
        <p className="eyebrow text-ember">Unduh</p>
        <h2 className="display-lg mt-4 text-sand">Unduh Baren</h2>
        <p className="mt-4 leading-7 text-sand/80">
          Pilih platform favoritmu untuk mengunduh dan mulai bermain.
        </p>
      </div>

      {list.length > 0 ? (
        <div className="mt-10">
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((item) => (
              <li
                key={`${item.platform}-${item.label}-${item.url}`}
                className="min-w-0 border border-sand/15 bg-ink-800 p-6"
              >
                <p className="eyebrow text-sand/50">{item.platform}</p>
                <p className="mt-2 min-w-0 break-words font-display text-xl uppercase tracking-wide text-sand">
                  {item.label}
                </p>
                <div className="mt-6">
                  <CtaButton
                    href={item.url}
                    external
                    variant="ember"
                    size="sm"
                    ariaLabel={`Unduh Baren untuk ${item.platform} — ${item.label} (membuka tab baru)`}
                  >
                    Unduh
                    <IconArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </CtaButton>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-3xl text-sm leading-6 text-sand/60">
            Semua tautan di atas adalah tautan resmi dan terbuka di tab baru.
          </p>
        </div>
      ) : (
        <div className="mt-10 max-w-3xl border border-sand/15 bg-ink-800 p-6 sm:p-8">
          <p
            role="status"
            className="inline-flex items-center border border-ember px-4 py-2 font-display text-lg uppercase tracking-wide text-ember"
          >
            Segera Hadir
          </p>
          <p className="mt-4 leading-7 text-sand/80">
            Game belum dirilis. Gabung wishlist agar mendapat kabar begitu
            unduhan tersedia.
          </p>
          <div className="mt-6">
            <CtaButton href="#daftar" variant="ember" size="sm">
              Gabung Wishlist
            </CtaButton>
          </div>
        </div>
      )}
    </SectionShell>
  );
}
