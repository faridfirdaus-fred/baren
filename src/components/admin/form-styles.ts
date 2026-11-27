/**
 * Gaya kontrol formulir panel admin (E19-2 — Putih Modern Minimalis).
 * Satu sumber untuk input, textarea, select, label, bantuan, dan pesan galat
 * agar seluruh formulir CMS bersih, terang, dan mudah dibaca.
 */

const fieldBase =
  "w-full rounded-xl border border-zinc-200 bg-white py-2.5 text-sm text-zinc-900 transition-all [color-scheme:light] placeholder:text-zinc-400 hover:border-zinc-300 focus:border-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:opacity-60";

/** Input teks, email, URL, angka, pencarian, tanggal, dan sejenisnya. */
export const adminInputClass = `${fieldBase} min-h-11 px-3.5`;

/** Input dengan aksi di sisi kanan (mis. tombol lihat kata sandi). */
export const adminInputWithActionClass = `${fieldBase} min-h-11 py-2.5 pl-3.5 pr-11`;

/** Textarea; tinggi awal mengikuti atribut rows, dapat diubah pengguna. */
export const adminTextareaClass = `${fieldBase} min-h-24 resize-y px-3.5`;

/** Select dengan chevron kustom (lihat .admin-select di globals.css). */
export const adminSelectClass = `${fieldBase} admin-select min-h-11 cursor-pointer appearance-none pl-3.5 pr-11`;

/** Label formulir yang konsisten dan mudah dipindai di seluruh CMS. */
export const adminLabelClass =
  "mb-1.5 block text-xs font-semibold text-zinc-700";

/** Teks bantuan di bawah kontrol. */
export const adminHelpClass = "mt-1.5 text-xs text-zinc-500";

/** Pesan galat validasi. */
export const adminErrorClass = "mt-1.5 text-xs font-medium text-red-600";

/** Checkbox/radio bersih. */
export const adminCheckboxClass =
  "admin-checkbox h-5 w-5 shrink-0 cursor-pointer appearance-none rounded-md border border-zinc-300 bg-white transition-colors checked:border-zinc-900 checked:bg-zinc-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900";
