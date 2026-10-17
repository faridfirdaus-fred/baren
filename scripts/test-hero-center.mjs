import assert from "node:assert/strict";
import { chromium } from "playwright";

const browser = await chromium.launch({ args: ["--no-sandbox"] });
try {
  const page = await browser.newPage({
    viewport: { width: 1920, height: 933 },
  });
  await page.goto(process.env.BASE_URL ?? "http://localhost:3000");
  await page.setViewportSize({ width: 418, height: 779 });
  const logoOffset = await page
    .locator("section:has(h1) img")
    .evaluate(async (img) => {
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const context = canvas.getContext("2d");
      context.drawImage(img, 0, 0);
      const pixels = context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height,
      ).data;
      let left = canvas.width;
      let right = 0;
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          if (pixels[(y * canvas.width + x) * 4 + 3] > 13) {
            left = Math.min(left, x);
            right = Math.max(right, x + 1);
          }
        }
      }
      const rect = img.getBoundingClientRect();
      return (
        rect.left +
        ((left + right) / 2 / canvas.width) * rect.width -
        document.documentElement.clientWidth / 2
      );
    });
  assert.ok(
    Math.abs(logoOffset) <= 1,
    `Pusat tulisan BAREN bergeser ${logoOffset.toFixed(1)}px`,
  );
} finally {
  await browser.close();
}
