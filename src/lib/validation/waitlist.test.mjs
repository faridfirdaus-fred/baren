import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { waitlistQuerySchema } from "./waitlist.ts";

describe("waitlistQuerySchema", () => {
  it("should default page to 1 when not provided", () => {
    const result = waitlistQuerySchema.parse({});
    assert.equal(result.page, 1);
  });

  it("should accept valid page numbers", () => {
    const result1 = waitlistQuerySchema.parse({ page: 1 });
    assert.equal(result1.page, 1);

    const result2 = waitlistQuerySchema.parse({ page: 5 });
    assert.equal(result2.page, 5);

    const result3 = waitlistQuerySchema.parse({ page: 100 });
    assert.equal(result3.page, 100);
  });

  it("should reject zero page", () => {
    assert.throws(() => {
      waitlistQuerySchema.parse({ page: 0 });
    }, /page/i);
  });

  it("should reject negative page", () => {
    assert.throws(() => {
      waitlistQuerySchema.parse({ page: -1 });
    }, /page/i);

    assert.throws(() => {
      waitlistQuerySchema.parse({ page: -10 });
    }, /page/i);
  });

  it("should reject decimal page", () => {
    assert.throws(() => {
      waitlistQuerySchema.parse({ page: 1.5 });
    }, /integer/i);

    assert.throws(() => {
      waitlistQuerySchema.parse({ page: 2.99 });
    }, /integer/i);
  });

  it("should reject non-numeric page values", () => {
    assert.throws(() => {
      waitlistQuerySchema.parse({ page: "abc" });
    });

    assert.throws(() => {
      waitlistQuerySchema.parse({ page: "1.5" });
    });

    assert.throws(() => {
      waitlistQuerySchema.parse({ page: null });
    });
  });

  it("should trim search query", () => {
    const result1 = waitlistQuerySchema.parse({ search: "  hello  " });
    assert.equal(result1.search, "hello");

    const result2 = waitlistQuerySchema.parse({ search: "\t\ntest\n\t" });
    assert.equal(result2.search, "test");
  });

  it("should convert empty search to undefined", () => {
    const result1 = waitlistQuerySchema.parse({ search: "" });
    assert.equal(result1.search, undefined);

    const result2 = waitlistQuerySchema.parse({ search: "   " });
    assert.equal(result2.search, undefined);

    const result3 = waitlistQuerySchema.parse({});
    assert.equal(result3.search, undefined);
  });

  it("should accept valid search queries", () => {
    const result1 = waitlistQuerySchema.parse({ search: "user@example.com" });
    assert.equal(result1.search, "user@example.com");

    const result2 = waitlistQuerySchema.parse({ search: "John Doe" });
    assert.equal(result2.search, "John Doe");
  });

  it("should reject search queries over 320 characters", () => {
    const longSearch = "a".repeat(321);
    assert.throws(() => {
      waitlistQuerySchema.parse({ search: longSearch });
    }, /320/);
  });

  it("should accept search queries at exactly 320 characters", () => {
    const maxSearch = "a".repeat(320);
    const result = waitlistQuerySchema.parse({ search: maxSearch });
    assert.equal(result.search, maxSearch);
  });

  it("should reject unknown keys", () => {
    assert.throws(() => {
      waitlistQuerySchema.parse({ page: 1, unknownKey: "value" });
    }, /unrecognized/i);

    assert.throws(() => {
      waitlistQuerySchema.parse({ search: "test", extra: 123 });
    }, /unrecognized/i);
  });

  it("should handle combined valid page and search", () => {
    const result = waitlistQuerySchema.parse({
      page: 3,
      search: "test@email.com",
    });
    assert.equal(result.page, 3);
    assert.equal(result.search, "test@email.com");
  });
});
