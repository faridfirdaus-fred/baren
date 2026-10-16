import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { wishlist } from "./schema.ts";

describe("wishlist table", () => {
  it("tere definisi dengan email unik", () => {
    assert.ok(wishlist, "tabel wishlist harus ada");
  });
});
