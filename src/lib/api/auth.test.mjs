import { describe, it } from "node:test";
import assert from "node:assert/strict";

const { checkAdmin } = await import("./auth.ts");

describe("checkAdmin", () => {
  it("401 bila tanpa sesi (anonim)", () => {
    assert.deepEqual(checkAdmin(undefined), {
      ok: false,
      status: 401,
      code: "UNAUTHORIZED",
    });
    assert.deepEqual(checkAdmin(null), {
      ok: false,
      status: 401,
      code: "UNAUTHORIZED",
    });
  });

  it("401 bila user tanpa id", () => {
    const r = checkAdmin({ user: { role: "admin" } });
    assert.equal(r.ok, false);
    assert.equal(r.status, 401);
  });

  it("403 bila login tetapi bukan admin", () => {
    assert.deepEqual(checkAdmin({ user: { id: "u1", role: "visitor" } }), {
      ok: false,
      status: 403,
      code: "FORBIDDEN",
    });
  });

  it("403 bila role tidak persis 'admin'", () => {
    const r = checkAdmin({ user: { id: "u1", role: "Admin" } });
    assert.equal(r.ok, false);
    assert.equal(r.status, 403);
  });

  it("lolos bila id dan role admin valid", () => {
    assert.deepEqual(checkAdmin({ user: { id: "u1", role: "admin" } }), {
      ok: true,
      userId: "u1",
    });
  });
});
