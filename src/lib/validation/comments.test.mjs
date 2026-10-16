import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { commentBodySchema } from "./comments.ts";

describe("commentBodySchema", () => {
  it("menolak body kosong dan HTML", () => {
    assert.equal(commentBodySchema.safeParse({ body: "   " }).success, false);
    assert.equal(
      commentBodySchema.safeParse({ body: "<b>halo</b>" }).success,
      false,
    );
    assert.equal(commentBodySchema.safeParse({ body: "Seru!" }).success, true);
  });
});
