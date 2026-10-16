export type WaitlistCsvRow = {
  id: number;
  email: string;
  name: string | null;
  createdAt: string | Date;
};

const FORMULA_PREFIXES = ["=", "+", "-", "@", "\t", "\r"];

export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '""';
  }
  let str = String(value);

  // Prevent spreadsheet formula injection (CSV Injection / CWE-1236)
  if (FORMULA_PREFIXES.some((prefix) => str.startsWith(prefix))) {
    str = `'${str}`;
  }

  // RFC 4180 double quotes escaping
  const escaped = str.replaceAll('"', '""');
  return `"${escaped}"`;
}

export function formatWishlistCsv(rows: WaitlistCsvRow[]): string {
  const header = ['"ID"', '"Email"', '"Nama"', '"Tanggal Terdaftar"'].join(",");
  const lines = [header];

  for (const row of rows) {
    const createdAtStr =
      row.createdAt instanceof Date
        ? row.createdAt.toISOString()
        : String(row.createdAt);
    const line = [
      escapeCsvCell(row.id),
      escapeCsvCell(row.email),
      escapeCsvCell(row.name),
      escapeCsvCell(createdAtStr),
    ].join(",");
    lines.push(line);
  }

  // UTF-8 BOM prefix for Excel compatibility + CRLF line endings per RFC 4180
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}
