import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { commentCreateSchema } = await import("./comments.ts");

describe("commentCreateSchema", () => {
  it("lolos untuk komentar teks biasa", () => {
    assert.equal(
      commentCreateSchema.safeParse({ body: "Seru! Kapan rilis?" }).success,
      true,
    );
  });

  it("menolak body kosong dan kepanjangan", () => {
    assert.equal(commentCreateSchema.safeParse({ body: "   " }).success, false);
    assert.equal(
      commentCreateSchema.safeParse({ body: "a".repeat(501) }).success,
      false,
    );
    assert.equal(
      commentCreateSchema.safeParse({ body: "a".repeat(500) }).success,
      true,
    );
  });

  it("menolak HTML dan key asing", () => {
    assert.equal(
      commentCreateSchema.safeParse({ body: "<b>halo</b>" }).success,
      false,
    );
    assert.equal(
      commentCreateSchema.safeParse({ body: "halo", foo: 1 }).success,
      false,
    );
  });
});
