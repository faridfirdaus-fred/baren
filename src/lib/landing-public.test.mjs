import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { shouldShowNews } from "./landing-public.ts";

describe("shouldShowNews", () => {
  it("returns false for empty array", () => {
    assert.equal(shouldShowNews([]), false);
  });

  it("returns first 3 items when more than 3", () => {
    const items = [1, 2, 3, 4, 5];
    const result = shouldShowNews(items);
    assert.deepEqual(result, [1, 2, 3]);
  });

  it("returns all items when less than 3", () => {
    const items = [1, 2];
    const result = shouldShowNews(items);
    assert.deepEqual(result, [1, 2]);
  });
});
