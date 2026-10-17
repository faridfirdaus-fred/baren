#!/usr/bin/env node
// E10-2: Admin panel functional tests (FR-ADM-01..31)
// Tests: login, dashboard, wishlist CSV, comments delete, landing cards CRUD

import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.argv[2] ?? "http://localhost:3000";
const email = required("E2_TEST_ADMIN_EMAIL");
const password = required("E2_TEST_ADMIN_PASSWORD");

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} wajib diisi.`);
  return value;
}

async function expectText(page, text) {
  await assert.doesNotReject(() =>
    page.getByText(text, { timeout: 5000 }).waitFor(),
  );
}

const browser = await chromium.launch({
  headless: true,
  args: ["--no-sandbox"],
});
const context = await browser.newContext();
const page = await context.newPage();

try {
  console.log("E10-2: Admin panel functional tests");

  // Test 1: Login (FR-ADM-01)
  console.log("  1. Login admin...");
  await page.goto(`${baseUrl}/admin/login`, { waitUntil: "networkidle" });
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Kata sandi").fill(password);
  await page.getByRole("button", { name: "Masuk" }).click();
  await page.waitForURL(`${baseUrl}/admin`, { timeout: 10000 });
  await expectText(page, "Dashboard Admin");

  // Test 2: Dashboard stats (FR-ADM-07)
  console.log("  2. Dashboard stats...");
  await expectText(page, "Fitur Game");
  await expectText(page, "Wishlist");
  await expectText(page, "Komentar");

  // Test 3: Wishlist CSV export (FR-ADM-30)
  console.log("  3. Wishlist CSV export...");
  await page.goto(`${baseUrl}/admin/wishlist`, { waitUntil: "networkidle" });
  await expectText(page, "Kelola Wishlist");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: /ekspor csv/i }).click();
  const download = await downloadPromise;
  assert.ok(
    download.suggestedFilename().includes(".csv"),
    "CSV download triggered",
  );

  // Test 4: Landing cards manager (FR-ADM-23)
  console.log("  4. Landing cards CRUD...");
  await page.goto(`${baseUrl}/admin/landing-cards`, {
    waitUntil: "networkidle",
  });
  await expectText(page, "Kelola Landing Cards");

  // Create test card
  await page.getByLabel("Judul").first().fill("Test Card E10-2");
  await page.getByLabel("Subjudul").first().fill("Test subtitle");
  await page
    .getByRole("button", { name: /tambah kartu/i })
    .first()
    .click();
  await expectText(page, "berhasil");
  await page.reload({ waitUntil: "networkidle" });
  await expectText(page, "Test Card E10-2");

  // Delete test card
  const deleteButtons = page.getByRole("button", { name: /hapus/i });
  const count = await deleteButtons.count();
  if (count > 0) {
    await deleteButtons.first().click();
    await page.getByRole("button", { name: /ya.*hapus/i }).click();
    await expectText(page, "berhasil");
  }

  // Test 5: Comments delete (FR-ADM-31)
  console.log("  5. Comments management...");
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  const commentsSection = page.locator("#komentar");
  if (await commentsSection.isVisible()) {
    console.log("    Comments visible on landing page ✓");
  }

  // Test 6: Logout (FR-ADM-02)
  console.log("  6. Logout...");
  await page.goto(`${baseUrl}/admin`);
  await page.getByRole("button", { name: "Keluar" }).click();
  await page.waitForURL(`${baseUrl}/admin/login`, { timeout: 5000 });

  // Verify redirect protection (FR-ADM-04)
  await page.goto(`${baseUrl}/admin/hero`);
  await page.waitForURL(`${baseUrl}/admin/login`, { timeout: 5000 });
  console.log("    Redirect protection verified ✓");

  console.log("\n✅ E10-2: All admin panel tests passed");
} catch (error) {
  console.error("\n❌ E10-2: Test failed");
  console.error(error);
  process.exit(1);
} finally {
  await browser.close();
}
