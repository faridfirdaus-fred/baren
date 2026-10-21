import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { formatDateTimeId, toDateTimeAttribute } = await import("./datetime.ts");

describe("formatDateTimeId", () => {
  it("memformat tanggal dalam locale Indonesia dan zona Asia/Jakarta", () => {
    const result = formatDateTimeId(new Date("2026-10-21T07:30:00.000Z"));
    assert.ok(result);
    assert.match(result, /Oktober 2026/);
    assert.match(result, /14\.30/);
    assert.match(result, /WIB/);
  });

  it("menerima string ISO", () => {
    const result = formatDateTimeId("2026-10-21T07:30:00.000Z");
    assert.match(result ?? "", /21 Oktober 2026/);
  });

  it("mengembalikan null untuk nilai kosong", () => {
    assert.equal(formatDateTimeId(null), null);
    assert.equal(formatDateTimeId(undefined), null);
    assert.equal(formatDateTimeId(""), null);
  });

  it("mengembalikan null untuk string rusak", () => {
    assert.equal(formatDateTimeId("bukan-tanggal"), null);
  });
});

describe("toDateTimeAttribute", () => {
  it("mengembalikan ISO untuk atribut time", () => {
    assert.equal(
      toDateTimeAttribute(new Date("2026-10-21T07:30:00.000Z")),
      "2026-10-21T07:30:00.000Z",
    );
  });

  it("mengembalikan undefined untuk nilai tidak valid", () => {
    assert.equal(toDateTimeAttribute("rusak"), undefined);
    assert.equal(toDateTimeAttribute(null), undefined);
  });
});
