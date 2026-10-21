#!/usr/bin/env node
// Playwright E16: metrik dasbor, total komentar, CRUD fitur, dan regresi admin.

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
const loadedBodies = [];
let createdFeatureTitle = null;
let featureStillExists = false;

page.on("pageerror", (error) => pageErrors.push(error));

async function rememberBody() {
  loadedBodies.push((await page.textContent("body")) ?? "");
}

async function login(target) {
  await target.goto(`${baseUrl}/admin/login`, { waitUntil: "networkidle" });
  await target.getByLabel("Email").fill(email);
  await target.getByLabel("Kata sandi").fill(password);
  await target.getByRole("button", { name: "Masuk" }).click();
  await target.waitForURL(`${baseUrl}/admin`);
}

try {
  await login(page);

  // 1. Dasbor: enam kartu metrik, fokus keyboard, dan waktu lokal.
  const metricKeys = [
    "features",
    "galleryAssets",
    "news",
    "faq",
    "wishlist",
    "comments",
  ];
  for (const key of metricKeys) {
    const card = page.getByTestId(`metric-${key}`);
    await card.waitFor();
    await card.focus();
    assert.equal(
      await card.evaluate((element) => element === document.activeElement),
      true,
      `Kartu metrik ${key} harus dapat difokuskan.`,
    );
  }

  const dashboardComments = Number(
    (await page.getByTestId("metric-value-comments").textContent())?.trim(),
  );
  assert.ok(
    Number.isInteger(dashboardComments),
    "Angka kartu Komentar harus bilangan bulat.",
  );

  const dashboardBody = (await page.textContent("body")) ?? "";
  assert.doesNotMatch(
    dashboardBody,
    /T\d{2}:\d{2}:\d{2}/,
    "Dasbor tidak boleh menampilkan ISO mentah.",
  );
  loadedBodies.push(dashboardBody);

  for (const width of [360, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    assert.ok(
      overflow <= 1,
      `Dasbor tidak boleh menggulir horizontal pada ${width}px (selisih ${overflow}px).`,
    );
  }

  // 2. Klik kartu Komentar -> total harus sama dengan angka dasbor.
  await page.getByTestId("metric-comments").click();
  await page.waitForURL(`${baseUrl}/admin/comments`);
  const totalLocator = page.getByTestId("admin-comments-total");
  await totalLocator.waitFor();
  const realTotalText = (await totalLocator.textContent()) ?? "";
  assert.match(
    realTotalText,
    new RegExp(`Total ${dashboardComments} komentar\\.`),
    "Total di halaman komentar harus sama dengan kartu dasbor.",
  );
  await rememberBody();

  // 3. Komentar dengan mock: total, avatar fallback, waktu lokal, hapus.
  await page.route(/\/api\/comments\?scope=admin$/, async (route) => {
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
              createdAt: "2026-10-21T07:30:00.000Z",
            },
          ],
          total: 1,
        }),
      });
      return;
    }
    await route.continue();
  });
  await page.route(/\/api\/comments\/9001$/, async (route) => {
    if (route.request().method() === "DELETE") {
      await route.fulfill({
        contentType: "application/json",
        body: '{"success":true}',
      });
      return;
    }
    await route.continue();
  });

  await page.reload({ waitUntil: "networkidle" });
  await page.getByText("Total 1 komentar.", { exact: false }).waitFor();
  await page.getByText("Oleh: Penguji", { exact: false }).waitFor();
  await page.getByTestId("comment-avatar-fallback").waitFor();
  await page.getByText("WIB", { exact: false }).waitFor();
  await page.getByRole("button", { name: "Hapus" }).first().click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Hapus", exact: true })
    .click();
  await page.getByText("Komentar dihapus").waitFor();
  await rememberBody();

  // 4. Berita (regresi E15): create, edit, delete.
  const newsTitle = `Berita Uji ${Date.now()}`;
  await page.goto(`${baseUrl}/admin/news`, { waitUntil: "networkidle" });
  await page.getByText("Daftar Berita").waitFor();
  assert.ok(
    !(await page.textContent("body")).includes("Gagal memuat berita"),
    "Berita tidak boleh gagal dimuat.",
  );
  await page.getByLabel("Judul").fill(newsTitle);
  assert.ok(
    (await page.getByLabel("Slug *").inputValue()).startsWith("berita-uji-"),
  );
  await page.getByLabel("Isi").fill("Konten berita uji regresi.");
  await page.getByLabel("Status").selectOption("draft");
  await page.getByRole("button", { name: "Simpan" }).click();
  await page.getByText("Berita ditambahkan").waitFor();
  await page.getByText(newsTitle).waitFor();

  const newsCard = page
    .locator("div.p-4.border.rounded")
    .filter({ hasText: newsTitle });
  await newsCard.getByRole("button", { name: "Edit" }).click();
  await page.getByLabel("Judul").fill(`${newsTitle} Edit`);
  await page.getByRole("button", { name: "Simpan" }).click();
  await page.getByText("Berita diperbarui").waitFor();

  const editedNewsCard = page
    .locator("div.p-4.border.rounded")
    .filter({ hasText: `${newsTitle} Edit` });
  await editedNewsCard.getByRole("button", { name: "Hapus" }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Hapus", exact: true })
    .click();
  await page.getByText("Berita dihapus").waitFor();
  await rememberBody();

  // 5. Fitur: create, edit, delete.
  createdFeatureTitle = `Fitur Uji ${Date.now()}`;
  featureStillExists = true;

  await page.goto(`${baseUrl}/admin/features`, { waitUntil: "networkidle" });
  await page.getByText("Daftar Fitur").waitFor();
  await page.getByLabel("Judul *").fill(createdFeatureTitle);
  await page.getByLabel("Deskripsi").fill("Fitur uji regresi E16.");
  await page.getByLabel("Urutan").fill("7");
  await page.getByRole("button", { name: "Tambah Fitur" }).click();
  await page.getByText("Fitur ditambahkan").waitFor();
  await page.getByText(createdFeatureTitle).waitFor();

  const featureCard = page
    .getByTestId("feature-item")
    .filter({ hasText: createdFeatureTitle });
  await featureCard
    .getByRole("button", { name: `Edit fitur ${createdFeatureTitle}` })
    .click();
  const editedFeatureTitle = `${createdFeatureTitle} Edit`;
  await page.getByLabel("Judul *").fill(editedFeatureTitle);
  await page.getByRole("button", { name: "Simpan Perubahan" }).click();
  await page.getByText("Fitur diperbarui").waitFor();
  await page.getByText(editedFeatureTitle).waitFor();

  const editedFeatureCard = page
    .getByTestId("feature-item")
    .filter({ hasText: editedFeatureTitle });
  await editedFeatureCard
    .getByRole("button", { name: `Hapus fitur ${editedFeatureTitle}` })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Hapus", exact: true })
    .click();
  await page.getByText("Fitur dihapus").waitFor();
  await page
    .getByText(editedFeatureTitle)
    .waitFor({ state: "detached", timeout: 5000 });
  featureStillExists = false;
  await rememberBody();

  // 6. Konteks anonim: /admin/comments diarahkan ke login.
  const anonymous = await browser.newContext();
  const anonymousPage = await anonymous.newPage();
  anonymousPage.on("pageerror", (error) => pageErrors.push(error));
  await anonymousPage.goto(`${baseUrl}/admin/comments`, {
    waitUntil: "networkidle",
  });
  await anonymousPage.waitForURL(/\/admin\/login/);
  await anonymous.close();

  // 7. Tidak ada pageerror dan tidak ada pesan gagal muat.
  assert.deepEqual(
    pageErrors,
    [],
    `Browser pageerror: ${pageErrors.join("; ")}`,
  );
  assert.ok(
    !loadedBodies.some((body) => body.includes("Gagal memuat")),
    "Halaman admin tidak boleh menampilkan 'Gagal memuat'.",
  );

  console.log("✅ Dasbor, komentar, berita, dan fitur E2E pass");
} catch (error) {
  console.error("❌ Admin E16 E2E fail:", error.message);
  process.exitCode = 1;
} finally {
  if (createdFeatureTitle && featureStillExists) {
    try {
      const listResponse = await page.request.get(`${baseUrl}/api/features`);
      const list = await listResponse.json();
      if (Array.isArray(list?.data)) {
        for (const feature of list.data) {
          if (
            feature?.title === createdFeatureTitle ||
            feature?.title === `${createdFeatureTitle} Edit`
          ) {
            await page.request.delete(`${baseUrl}/api/features/${feature.id}`);
          }
        }
      }
    } catch (cleanupError) {
      console.error("Pembersihan fitur uji gagal:", cleanupError.message);
    }
  }
  await browser.close();
}
