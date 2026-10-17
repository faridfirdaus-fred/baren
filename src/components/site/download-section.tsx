import { getDownloadItems } from "@/lib/links-content";
import { externalLinkProps } from "@/lib/external-link";
import { hero } from "@/content/baren";
import { SectionShell } from "@/components/site/section-shell";
import { ScrollRevealWrapper } from "@/components/site/scroll-reveal-wrapper";
import { IconArrowUpRight, IconDownload } from "@/components/site/icon";

export type DownloadSectionItem = {
  platform: string;
  label: string;
  url: string;
};

export type DownloadSectionProps = {
  /** Override dari integrator (mis. hasil fetch atau tes).
      `undefined` = baca DB; `[]` = belum rilis ("Segera Hadir"). */
  items?: DownloadSectionItem[];
};

function isHttpsUrl(value: string): boolean {
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * E7-4 & E7-6 — Seksi Unduhan (FR-PUB-13, FR-PUB-25, EI-07).
 * - Menampilkan tombol per platform dari CMS (`download_links`).
 * - Daftar kosong = status "Segera Hadir" per platform default (Steam,
 *   Play Store, App Store) + ajakan Wishlist.
 * - Tautan keluar wajib `target="_blank" rel="noopener noreferrer"`.
 */
export async function DownloadSection({ items }: DownloadSectionProps = {}) {
  const resolved = items !== undefined ? items : await getDownloadItems();
  const list = (resolved ?? []).filter((r) => isHttpsUrl(r.url));
  const belumRilis = list.length === 0;

  return (
    <ScrollRevealWrapper>
      <SectionShell id="unduh" tone="dark" className="border-t border-sand/15">
        <div className="flex flex-col items-center text-center">
          <p className="eyebrow text-ember">DISTRIBUSI</p>
          <h2 className="display-xl mt-4 text-sand">UNDUH GAME BAREN</h2>
          <p className="mt-4 max-w-2xl text-lg leading-7 text-sand/75">
            {belumRilis
              ? "Game BAREN saat ini sedang dalam tahap pengembangan aktif. Daftarkan diri Anda di Wishlist untuk mendapat pemberitahuan saat akses perdana dibuka."
              : "Pilih platform Anda dan unduh instalasi resmi game BAREN."}
          </p>

          {belumRilis ? (
            <div className="mt-10 w-full max-w-3xl">
              <div className="grid gap-4 sm:grid-cols-3">
                {hero.platforms.map((platform) => (
                  <div
                    key={platform}
                    className="flex flex-col items-center justify-between border border-sand/20 bg-ink-800 p-6 text-center"
                  >
                    <p className="font-display text-2xl uppercase tracking-wide text-sand">
                      {platform}
                    </p>
                    <span className="mt-4 inline-block bg-ember/20 px-3 py-1 font-sans text-xs font-bold uppercase tracking-wider text-ember">
                      {hero.platformsNote}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <a
                  href="#wishlist"
                  className="inline-flex min-h-11 items-center justify-center bg-ember px-8 py-3 font-sans text-sm font-bold uppercase tracking-wider text-sand shadow-lg transition hover:bg-ember/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                >
                  Gabung Wishlist
                </a>
              </div>
            </div>
          ) : (
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              {list.map((item, index) => (
                <a
                  key={`${item.platform}-${index}`}
                  href={item.url}
                  {...externalLinkProps(item.url)}
                  className="group flex min-h-12 items-center gap-3 border border-sand/25 bg-ink-800 px-6 py-3 font-sans text-sm font-semibold uppercase tracking-wider text-sand transition hover:border-ember hover:bg-ink-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
                >
                  <IconDownload className="h-4 w-4 text-ember transition group-hover:scale-110" />
                  <span>
                    {item.platform}: {item.label}
                  </span>
                  <IconArrowUpRight className="h-3.5 w-3.5 text-sand/60 transition group-hover:text-ember" />
                </a>
              ))}
            </div>
          )}
        </div>
      </SectionShell>
    </ScrollRevealWrapper>
  );
}
