import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { parseWishlistApiResponse, buildExportUrl, formatRegistrationDate } =
  await import("./admin-wishlist-client.ts");

describe("parseWishlistApiResponse", () => {
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

    const parsed = parseWishlistApiResponse(raw);
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

    const parsed = parseWishlistApiResponse(raw);
    assert.equal(parsed.ok, false);
    if (!parsed.ok) {
      assert.equal(parsed.error.message, "Sesi tidak valid.");
    }
  });

  it("handles malformed response gracefully", () => {
    const parsed = parseWishlistApiResponse(null);
    assert.equal(parsed.ok, false);
    if (!parsed.ok) {
      assert.equal(parsed.error.message, "Format data server tidak valid.");
    }
  });
});

describe("buildExportUrl", () => {
  it("returns base url when search is absent or empty", () => {
    assert.equal(buildExportUrl(), "/api/wishlist/export");
    assert.equal(buildExportUrl(""), "/api/wishlist/export");
    assert.equal(buildExportUrl("   "), "/api/wishlist/export");
  });

  it("appends encoded search query parameter", () => {
    assert.equal(
      buildExportUrl("john doe"),
      "/api/wishlist/export?search=john%20doe",
    );
    assert.equal(
      buildExportUrl("  budi@example.com  "),
      "/api/wishlist/export?search=budi%40example.com",
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
