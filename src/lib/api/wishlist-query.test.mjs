import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { parseWishlistQuery } = await import("./wishlist-query.ts");

describe("parseWishlistQuery", () => {
  it("defaults page and omits blank trimmed search", () => {
    assert.deepEqual(parseWishlistQuery({}), {
      ok: true,
      data: { page: 1 },
    });
    assert.deepEqual(parseWishlistQuery({ page: "3", search: "  " }), {
      ok: true,
      data: { page: 3 },
    });
  });

  it("trims search", () => {
    assert.deepEqual(parseWishlistQuery({ search: "  Rani  " }), {
      ok: true,
      data: { page: 1, search: "Rani" },
    });
  });

  it("rejects invalid pages, overlong search, and unknown parameters", () => {
    for (const query of [
      { page: "0" },
      { page: "-1" },
      { page: "1.5" },
      { page: "abc" },
      { page: "" },
      { search: "x".repeat(321) },
      { nope: "value" },
    ]) {
      const result = parseWishlistQuery(query);
      assert.equal(result.ok, false);
      assert.equal(result.status, 400);
      assert.equal(result.code, "VALIDATION_ERROR");
    }
  });
});
