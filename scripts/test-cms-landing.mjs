#!/usr/bin/env node
// Playwright E2E: CMS landing (admin login → CRUD hero/news/kartu → publik lihat)

import assert from "node:assert/strict";
import { chromium } from "playwright";

const baseUrl = process.argv[2] ?? "http://localhost:3100";
const email = required("E2_TEST_ADMIN_EMAIL");
const password = required("E2_TEST_ADMIN_PASSWORD");

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} wajib diisi.`);
  return value;
}

async function expectText(page, text) {
  const content = await page.textContent("body");
  assert.ok(content.includes(text), `Expected "${text}" in body`);
}

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const context = await browser.newContext();
const page = await context.newPage();

try {
  // 1. Admin login
  await page.goto(`${baseUrl}/admin/login`, { waitUntil: "networkidle" });
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Kata sandi").fill(password);
  await page.getByRole("button", { name: "Masuk" }).click();
  await page.waitForURL(`${baseUrl}/admin`);
  await expectText(page, "Dashboard Admin");

  // 2. Hero: ubah title
  await page.goto(`${baseUrl}/admin/hero`, { waitUntil: "networkidle" });
  await expectText(page, "Kelola Hero");
  const heroTitleInput = page.getByLabel("Judul");
  await heroTitleInput.fill("BAREN Test Hero");
  await page.getByRole("button", { name: "Simpan Hero" }).click();
  await expectText(page, "Hero disimpan");

  // 3. News: tambah berita test
  await page.goto(`${baseUrl}/admin/news`, { waitUntil: "networkidle" });
  await expectText(page, "Kelola Berita");
  await expectText(page, "maksimal 3");
  await page.getByLabel("Judul").fill("Berita Test E2E");
  await page
    .getByLabel("Isi")
    .fill("Konten berita untuk pengujian end-to-end.");
  await page.getByLabel("Status").selectOption("published");
  await page.getByRole("button", { name: "Simpan" }).click();
  await expectText(page, "Berita ditambahkan");

  // 4. Landing-cards: tambah kartu
  await page.goto(`${baseUrl}/admin/landing-cards`, {
    waitUntil: "networkidle",
  });
  await expectText(page, "Kelola Kartu Landing");
  await page.getByLabel("Judul").fill("Kartu Test E2E");
  await page.getByLabel("Tone").selectOption("dark");
  await page.getByRole("button", { name: "Simpan" }).click();
  await expectText(page, "Kartu ditambahkan");

  // 5. How-to-play: tambah langkah
  await page.goto(`${baseUrl}/admin/how-to-play`, { waitUntil: "networkidle" });
  await expectText(page, "Kelola How to Play");
  await page.getByLabel("Nomor Langkah").fill("99");
  await page.getByLabel("Judul").fill("Langkah Test E2E");
  await page.getByRole("button", { name: "Simpan" }).click();
  await expectText(page, "Langkah ditambahkan");

  // 6. Komentar admin: lihat daftar
  await page.goto(`${baseUrl}/admin/comments`, { waitUntil: "networkidle" });
  await expectText(page, "Kelola Komentar");

  // 7. Wishlist: lihat daftar
  await page.goto(`${baseUrl}/admin/wishlist`, { waitUntil: "networkidle" });
  await expectText(page, "Wishlist");

  // 8. Landing publik: hero title muncul
  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  await expectText(page, "BAREN Test Hero");

  console.log("✅ CMS landing E2E pass");
} catch (err) {
  console.error("❌ CMS landing E2E fail:", err.message);
  process.exit(1);
} finally {
  await browser.close();
}
