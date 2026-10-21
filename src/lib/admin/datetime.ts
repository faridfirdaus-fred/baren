/**
 * E16-2: format waktu admin dalam zona Indonesia.
 * Server, browser, dan Cloudflare Workers harus menghasilkan string yang sama,
 * sehingga zona waktu ditulis eksplisit (bukan zona perangkat).
 */

const formatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Asia/Jakarta",
  timeZoneName: "short",
});

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Contoh keluaran: "21 Oktober 2026 pukul 14.30 WIB". */
export function formatDateTimeId(
  value: Date | string | null | undefined,
): string | null {
  const date = toDate(value);
  return date ? formatter.format(date) : null;
}

/** Nilai untuk atribut `<time dateTime>`; undefined bila tanggal tidak valid. */
export function toDateTimeAttribute(
  value: Date | string | null | undefined,
): string | undefined {
  return toDate(value)?.toISOString();
}
