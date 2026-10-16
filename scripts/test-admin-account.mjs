import assert from "node:assert/strict";

import { chromium } from "playwright";

const baseUrl = process.argv[2] ?? "http://localhost:3100";
const email = required("E2_TEST_ADMIN_EMAIL");
const password = required("E2_TEST_ADMIN_PASSWORD");
const conflictEmail = required("E2_TEST_CONFLICT_EMAIL");
const temporaryPassword = required("E2_TEST_NEW_PASSWORD");
const originalName = process.env.E2_TEST_ADMIN_NAME ?? "Administrator";
const testName = `Admin Uji ${Date.now()}`;
const testEmail = `admin-uji-${Date.now()}@example.test`;

function required(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} wajib diisi.`);
  return value;
}

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await (await browser.newContext()).newPage();
let currentEmail = email;
let currentPassword = password;
let signedIn = false;

async function login(loginEmail, loginPassword) {
  await page.goto(`${baseUrl}/admin/login`, { waitUntil: "networkidle" });
  await page.getByLabel("Email").fill(loginEmail);
  await page.getByLabel("Kata sandi").fill(loginPassword);
  await page.getByRole("button", { name: "Masuk" }).click();
}

async function logout() {
  await page.getByRole("button", { name: "Keluar" }).click();
  await page.waitForURL(`${baseUrl}/admin/login`);
  signedIn = false;
}

async function restoreAccount() {
  if (!signedIn) {
    await login(currentEmail, currentPassword);
    await page.waitForURL(`${baseUrl}/admin`);
    signedIn = true;
  }
  if (currentPassword !== password) {
    await page.getByLabel("Kata sandi saat ini").fill(currentPassword);
    await page.getByLabel("Kata sandi baru").fill(password);
    await page.getByRole("button", { name: "Ubah kata sandi" }).click();
    await expectText("Kata sandi berhasil diubah.");
    currentPassword = password;
  }
  if (currentEmail !== email) {
    await page.getByLabel("Nama").fill(originalName);
    await page.getByLabel("Email akun").fill(email);
    await page.getByRole("button", { name: "Simpan profil" }).click();
    await expectText("Profil berhasil diperbarui.");
    currentEmail = email;
  }
}

try {
  await login(email, password);
  await page.waitForURL(`${baseUrl}/admin`);
  signedIn = true;

  await page.getByLabel("Nama").fill(testName);
  await page.getByLabel("Email akun").fill(testEmail);
  await page.getByRole("button", { name: "Simpan profil" }).click();
  await expectText("Profil berhasil diperbarui.");
  currentEmail = testEmail;
  await page.reload({ waitUntil: "networkidle" });
  await expectText(testEmail);

  await page.getByLabel("Email akun").fill(conflictEmail);
  await page.getByRole("button", { name: "Simpan profil" }).click();
  await expectText("Email sudah digunakan akun lain.");

  await page.getByLabel("Kata sandi saat ini").fill(password);
  await page.getByLabel("Kata sandi baru").fill(temporaryPassword);
  await page.getByRole("button", { name: "Ubah kata sandi" }).click();
  await expectText("Kata sandi berhasil diubah.");
  currentPassword = temporaryPassword;

  await logout();
  await login(testEmail, password);
  await expectText("Email atau kata sandi salah.");
  await login(testEmail, temporaryPassword);
  await page.waitForURL(`${baseUrl}/admin`);
  signedIn = true;

  await restoreAccount();
  console.log("E2 account checks passed");
} finally {
  try {
    await restoreAccount();
  } finally {
    await browser.close();
  }
}

async function expectText(text) {
  await assert.doesNotReject(() => page.getByText(text).waitFor());
}
