import { getDownloadItems } from "@/lib/links-content";
import { externalLinkProps } from "@/lib/external-link";
import { hero } from "@/content/baren";
import { SectionShell } from "@/components/site/section-shell";
import { IconArrowUpRight, IconDownload } from "@/components/site/icon";

/**
 * E7-4 & E7-6 — Seksi Unduhan (FR-PUB-13, FR-PUB-25, EI-07).
 * - Menampilkan tombol per platform dari CMS (`download_links`).
 * - Daftar kosong = status "Segera Hadir" per platform default (Steam,
 *   Play Store, App Store) + ajakan Wishlist.
 * - Tautan keluar wajib `target="_blank" rel="noopener noreferrer"`.
 */
export async function DownloadSection() {
  const items = await getDownloadItems();
  const belumRilis = items.length === 0;

  return (
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
                className="inline-flex items-center gap-2 bg-ember-700 px-8 py-4 font-sans text-base font-semibold uppercase tracking-wider text-sand transition-colors hover:bg-ember-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
              >
                Gabung Wishlist Sekarang
              </a>
            </div>
          </div>
        ) : (
          <div className="mt-10 grid w-full max-w-4xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex flex-col justify-between border border-sand/20 bg-ink-800 p-6 text-left"
              >
                <div>
                  <p className="eyebrow text-ember">{item.platform}</p>
                  <h3 className="mt-2 font-display text-xl uppercase text-sand">
                    {item.label}
                  </h3>
                </div>
                <div className="mt-6">
                  <a
                    href={item.url}
                    {...externalLinkProps(item.url)}
                    className="inline-flex w-full items-center justify-center gap-2 bg-ember-700 px-5 py-3 font-sans text-sm font-semibold uppercase tracking-wider text-sand transition-colors hover:bg-ember-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sand"
                  >
                    <IconDownload className="h-4 w-4 shrink-0" />
                    <span>Unduh</span>
                    <IconArrowUpRight className="h-4 w-4 shrink-0" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionShell>
  );
}
