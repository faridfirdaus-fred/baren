/**
 * Gaya kontrol formulir panel admin (E12-8 — audit visual).
 * Satu sumber untuk input, textarea, select, label, bantuan, dan pesan galat
 * agar seluruh formulir CMS tampil sebagai kontrol bertema ink/sand/ember,
 * bukan kontrol bawaan peramban (DG-02, DG-04, NFR-ACC-01).
 */

const fieldBase =
  "w-full rounded-none border border-line bg-ink py-2.5 text-sm text-sand transition-colors [color-scheme:dark] placeholder:text-sand/30 hover:border-sand/30 focus:border-ember focus:outline-none focus:ring-1 focus:ring-ember disabled:cursor-not-allowed disabled:opacity-60";

/** Input teks, email, URL, angka, pencarian, tanggal, dan sejenisnya. */
export const adminInputClass = `${fieldBase} min-h-11 px-3.5`;

/** Input dengan aksi di sisi kanan (mis. tombol lihat kata sandi). */
export const adminInputWithActionClass = `${fieldBase} min-h-11 py-2.5 pl-3.5 pr-11`;

/** Textarea; tinggi awal mengikuti atribut rows, dapat diubah pengguna. */
export const adminTextareaClass = `${fieldBase} min-h-24 resize-y px-3.5`;

/** Select dengan chevron kustom (lihat .admin-select di globals.css). */
export const adminSelectClass = `${fieldBase} admin-select min-h-11 cursor-pointer appearance-none pl-3.5 pr-11`;

/** Label formulir yang konsisten di seluruh CMS. */
export const adminLabelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-sand-600";

/** Teks bantuan di bawah kontrol. */
export const adminHelpClass = "mt-1.5 text-xs text-sand-600";

/** Pesan galat validasi. */
export const adminErrorClass = "mt-1.5 text-sm text-ember";

/** Checkbox/radio dengan aksen ember. */
export const adminCheckboxClass =
  "admin-checkbox h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-none border border-sand/40 bg-ink transition-colors checked:border-ember checked:bg-ember focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember";
