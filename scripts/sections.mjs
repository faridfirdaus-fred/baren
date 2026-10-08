/** Capture a clipped screenshot for each major section. */
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const TARGET = "https://playvalorant.com/id-id/";
const OUT = path.resolve("scrape/sections");
await fs.mkdir(OUT, { recursive: true });

const b = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: "id-ID" });
const page = await ctx.newPage();
await page.goto(TARGET, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});
await page.waitForTimeout(3500);

// remove cookie overlay
await page.evaluate(() => {
  document.querySelectorAll('#onetrust-consent-sdk,[id*="osano" i],[class*="osano" i],[id*="cookie" i]').forEach(e=>e.remove());
});
await page.evaluate(async () => {
  await new Promise((r) => { let t = 0; const i = setInterval(() => { scrollBy(0, 400); t += 400; if (t > document.body.scrollHeight + 2000) { clearInterval(i); r(); } }, 100); });
});
await page.waitForTimeout(3000);
await page.evaluate(() => scrollTo(0, 0));
await page.waitForTimeout(1500);

const regions = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll("section").forEach((el, i) => {
    const r = el.getBoundingClientRect();
    if (r.height < 100) return;
    out.push({ i, y: Math.round(r.top + scrollY), h: Math.round(r.height) });
  });
  // header
  const hdr = document.querySelector('[class*="riotbar-header-wrapper"]');
  if (hdr) { const r = hdr.getBoundingClientRect(); out.unshift({ i: "header", y: 0, h: Math.round(r.height) }); }
  return out;
});
console.log("regions:", JSON.stringify(regions));

for (const r of regions) {
  const clip = { x: 0, y: r.y, width: 1440, height: Math.min(r.h, 2400) };
  const file = path.join(OUT, `${String(r.i).padStart(2, "0")}-y${r.y}.png`);
  await page.screenshot({ path: file, clip, fullPage: true }).catch((e) => console.log("fail", file, e.message));
  console.log("saved", file);
}

// footer region: bottom of page
const total = await page.evaluate(() => document.body.scrollHeight);
const fh = await page.evaluate(() => {
  const f = document.querySelector('[class*="riotbar-footer"], [class*="riotbar-legal"], footer');
  if (!f) return 300;
  const r = f.getBoundingClientRect();
  return Math.round(r.height);
});
await page.screenshot({ path: path.join(OUT, "99-footer.png"), clip: { x: 0, y: Math.max(0, total - fh - 20), width: 1440, height: fh + 20 }, fullPage: true }).catch(()=>{});
console.log("saved footer, total height", total, "footer h", fh);

await b.close();
