import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { describe, it } from "node:test";

describe("Admin Login Page & Form (Putih Modern Minimalis)", async () => {
  const pageSource = await readFile("src/app/admin/login/page.tsx", "utf8");
  const formSource = await readFile(
    "src/components/admin/login-form.tsx",
    "utf8",
  );

  it("menjaga kontrak input dan label untuk Playwright", () => {
    assert.match(formSource, /htmlFor="email"/);
    assert.match(formSource, />\s*Email\s*<\/label>/);
    assert.match(formSource, /htmlFor="password"/);
    assert.match(formSource, />\s*Kata sandi\s*<\/label>/);
    assert.match(formSource, /"Masuk"/);
    assert.match(formSource, /aria-label="Formulir masuk admin"/);
    assert.match(formSource, /"Email atau kata sandi salah\."/);
  });

  it("menyediakan toggle visibilitas kata sandi yang aksesibel", () => {
    assert.match(formSource, /setShowPassword/);
    assert.match(formSource, /Perlihatkan sandi/);
    assert.match(formSource, /Sembunyikan sandi/);
    assert.match(formSource, /aria-pressed={showPassword}/);
  });

  it("mendukung alert penolakan akses (AksesDitolak)", () => {
    assert.match(pageSource, /searchParams\?:\s*Promise/);
    assert.match(pageSource, /params\?\.error === "AksesDitolak"/);
    assert.match(formSource, /Akses Ditolak/);
    assert.match(formSource, /accessDenied/);
  });

  it("menerapkan desain putih minimalis dengan logo proporsional", () => {
    assert.match(pageSource, /Kembali ke Situs/);
    assert.match(pageSource, /baren-mark\.svg/);
    assert.doesNotMatch(pageSource, /baren-village-keyart/);
    assert.match(pageSource, /bg-white/);
  });
});
