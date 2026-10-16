import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { formatWaitlistCsv, escapeCsvCell } = await import("./waitlist-csv.ts");

describe("escapeCsvCell", () => {
  it("handles null and undefined values", () => {
    assert.equal(escapeCsvCell(null), '""');
    assert.equal(escapeCsvCell(undefined), '""');
  });

  it("escapes spreadsheet formula injection characters", () => {
    assert.equal(escapeCsvCell("=1+1"), `"'=1+1"`);
    assert.equal(escapeCsvCell("+6281234"), `"'+6281234"`);
    assert.equal(escapeCsvCell("-100"), `"'-100"`);
    assert.equal(escapeCsvCell("@admin"), `"'@admin"`);
    assert.equal(escapeCsvCell("\tcmd"), `"'\tcmd"`);
    assert.equal(escapeCsvCell("\rcmd"), `"'\rcmd"`);
  });

  it("escapes quotes, commas, and newlines per RFC 4180", () => {
    assert.equal(escapeCsvCell('Halo "Dunia"'), '"Halo ""Dunia"""');
    assert.equal(escapeCsvCell("Jakarta, Indonesia"), '"Jakarta, Indonesia"');
    assert.equal(escapeCsvCell("Baris 1\nBaris 2"), '"Baris 1\nBaris 2"');
  });

  it("preserves unicode characters", () => {
    assert.equal(escapeCsvCell("🎮 Bäff 太郎"), '"🎮 Bäff 太郎"');
  });
});

describe("formatWaitlistCsv", () => {
  it("formats empty rows with BOM and header", () => {
    const csv = formatWaitlistCsv([]);
    assert.equal(csv, '\uFEFF"ID","Email","Nama","Tanggal Terdaftar"\r\n');
  });

  it("formats rows with proper escaping and carriage return newlines", () => {
    const rows = [
      {
        id: 1,
        email: "user@example.com",
        name: "Budi Santoso",
        createdAt: "2026-10-16T12:00:00.000Z",
      },
      {
        id: 2,
        email: "attacker@example.com",
        name: "=cmd|' /C calc'!A0",
        createdAt: "2026-10-16T12:05:00.000Z",
      },
      {
        id: 3,
        email: "anon@example.com",
        name: null,
        createdAt: new Date("2026-10-16T12:10:00.000Z"),
      },
      {
        id: 4,
        email: "multiline@example.com",
        name: 'Nama, dengan "kutip" & \nnewline',
        createdAt: "2026-10-16T12:15:00.000Z",
      },
    ];

    const csv = formatWaitlistCsv(rows);

    assert.ok(csv.startsWith("\uFEFF"));
    const lines = csv.replace(/^\uFEFF/, "").split("\r\n");

    assert.equal(lines[0], '"ID","Email","Nama","Tanggal Terdaftar"');
    assert.equal(
      lines[1],
      '"1","user@example.com","Budi Santoso","2026-10-16T12:00:00.000Z"',
    );
    assert.equal(
      lines[2],
      '"2","attacker@example.com","\'=cmd|\' /C calc\'!A0","2026-10-16T12:05:00.000Z"',
    );
    assert.equal(
      lines[3],
      '"3","anon@example.com","","2026-10-16T12:10:00.000Z"',
    );
    assert.ok(csv.includes('"Nama, dengan ""kutip"" & \nnewline"'));
  });
});
