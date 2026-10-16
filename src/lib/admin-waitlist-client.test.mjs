import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { parseWaitlistApiResponse, buildExportUrl, formatRegistrationDate } =
  await import("./admin-waitlist-client.ts");

describe("parseWaitlistApiResponse", () => {
  it("parses success envelope", () => {
    const raw = {
      ok: true,
      data: {
        items: [
          {
            id: 1,
            email: "gamer@example.com",
            name: "Gamer",
            createdAt: "2026-10-16T12:00:00.000Z",
          },
        ],
        page: 1,
        perPage: 25,
        total: 1,
        totalPages: 1,
      },
    };

    const parsed = parseWaitlistApiResponse(raw);
    assert.equal(parsed.ok, true);
    if (parsed.ok) {
      assert.equal(parsed.data.total, 1);
      assert.equal(parsed.data.items[0]?.email, "gamer@example.com");
    }
  });

  it("extracts error from failure envelope", () => {
    const raw = {
      ok: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Sesi tidak valid.",
      },
    };

    const parsed = parseWaitlistApiResponse(raw);
    assert.equal(parsed.ok, false);
    if (!parsed.ok) {
      assert.equal(parsed.error.message, "Sesi tidak valid.");
    }
  });

  it("handles malformed response gracefully", () => {
    const parsed = parseWaitlistApiResponse(null);
    assert.equal(parsed.ok, false);
    if (!parsed.ok) {
      assert.equal(parsed.error.message, "Format data server tidak valid.");
    }
  });
});

describe("buildExportUrl", () => {
  it("returns base url when search is absent or empty", () => {
    assert.equal(buildExportUrl(), "/api/waitlist/export");
    assert.equal(buildExportUrl(""), "/api/waitlist/export");
    assert.equal(buildExportUrl("   "), "/api/waitlist/export");
  });

  it("appends encoded search query parameter", () => {
    assert.equal(
      buildExportUrl("john doe"),
      "/api/waitlist/export?search=john%20doe",
    );
    assert.equal(
      buildExportUrl("  budi@example.com  "),
      "/api/waitlist/export?search=budi%40example.com",
    );
  });
});

describe("formatRegistrationDate", () => {
  it("formats ISO string into readable date", () => {
    const formatted = formatRegistrationDate("2026-10-16T10:30:00.000Z");
    assert.ok(formatted.includes("2026"));
    assert.ok(typeof formatted === "string");
  });

  it("falls back to original string for invalid date", () => {
    assert.equal(formatRegistrationDate("invalid-date"), "invalid-date");
  });
});
