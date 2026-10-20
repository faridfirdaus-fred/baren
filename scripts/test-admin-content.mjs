#!/usr/bin/env node
// Playwright E2E regresi issue #2: admin berita dan komentar.

import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.argv[2] ?? "http://localhost:8787";
const email = required("E2_TEST_ADMIN_EMAIL");
const password = required("E2_TEST_ADMIN_PASSWORD");

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} wajib diisi.`);
  return value;
}

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const context = await browser.newContext();
const page = await context.newPage();
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error));

try {
  await page.goto(`${baseUrl}/admin/login`, { waitUntil: "networkidle" });
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Kata sandi").fill(password);
  await page.getByRole("button", { name: "Masuk" }).click();
  await page.waitForURL(`${baseUrl}/admin`);

  const title = `Berita Uji ${Date.now()}`;
  await page.goto(`${baseUrl}/admin/news`, { waitUntil: "networkidle" });
  await page.getByText("Daftar Berita").waitFor();
  assert.ok(!(await page.textContent("body")).includes("Gagal memuat berita"));
  await page.getByLabel("Judul").fill(title);
  assert.ok(
    (await page.getByLabel("Slug *").inputValue()).startsWith("berita-uji-"),
  );
  await page.getByLabel("Isi").fill("Konten berita uji regresi.");
  await page.getByLabel("Status").selectOption("draft");
  await page.getByRole("button", { name: "Simpan" }).click();
  await page.getByText("Berita ditambahkan").waitFor();
  await page.getByText(title).waitFor();

  const card = page
    .locator("div.p-4.border.rounded")
    .filter({ hasText: title });
  await card.getByRole("button", { name: "Edit" }).click();
  await page.getByLabel("Judul").fill(`${title} Edit`);
  await page.getByRole("button", { name: "Simpan" }).click();
  await page.getByText("Berita diperbarui").waitFor();

  const editedCard = page
    .locator("div.p-4.border.rounded")
    .filter({ hasText: `${title} Edit` });
  await editedCard.getByRole("button", { name: "Hapus" }).click();
  await page.getByRole("button", { name: "Hapus" }).last().click();
  await page.getByText("Berita dihapus").waitFor();

  await page.route("**/api/comments", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          comments: [
            {
              id: 9001,
              body: "Komentar uji",
              userName: "Penguji",
              userPhotoUrl: null,
              createdAt: new Date().toISOString(),
            },
          ],
        }),
      });
      return;
    }
    await route.continue();
  });
  await page.route("**/api/comments/9001", async (route) => {
    if (route.request().method() === "DELETE") {
      await route.fulfill({
        contentType: "application/json",
        body: '{"success":true}',
      });
      return;
    }
    await route.continue();
  });

  await page.goto(`${baseUrl}/admin/comments`, { waitUntil: "networkidle" });
  await page.getByText("Oleh: Penguji", { exact: false }).waitFor();
  await page.getByTestId("comment-avatar-fallback").waitFor();
  await page.getByRole("button", { name: "Hapus" }).first().click();
  await page.getByRole("button", { name: "Hapus" }).last().click();
  await page.getByText("Komentar dihapus").waitFor();

  assert.deepEqual(
    pageErrors,
    [],
    `Browser pageerror: ${pageErrors.join("; ")}`,
  );
  console.log("✅ Admin berita dan komentar E2E pass");
} catch (error) {
  console.error("❌ Admin berita dan komentar E2E fail:", error.message);
  process.exitCode = 1;
} finally {
  await browser.close();
}
