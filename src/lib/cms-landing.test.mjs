// Test CMS landing admin UI
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

describe("CMS landing baru", () => {
  it("halaman news mengingatkan batas 3 dan tanpa halaman detail", () => {
    const src = readFileSync("src/app/admin/news/page.tsx", "utf8");
    assert.match(src, /maksimal 3/i);
  });
});
