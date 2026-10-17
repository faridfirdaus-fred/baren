import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { isEmail } = await import("./email.ts");

describe("isEmail", () => {
  it("menerima email valid", () => {
    assert.equal(isEmail("admin@baren.id"), true);
    assert.equal(isEmail("user.name+tag@domain.co.id"), true);
  });

  it("menolak nilai null, undefined, kosong, dan tidak valid", () => {
    assert.equal(isEmail(null), false);
    assert.equal(isEmail(undefined), false);
    assert.equal(isEmail(""), false);
    assert.equal(isEmail("   "), false);
    assert.equal(isEmail("admin"), false);
    assert.equal(isEmail("admin@"), false);
    assert.equal(isEmail("@baren.id"), false);
    assert.equal(isEmail("admin@baren"), false);
  });
});
