/** Capture map section + footer region precisely. */
import { chromium } from "playwright";

const b = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: "id-ID" });
const page = await ctx.newPage();
await page.goto("https://playvalorant.com/id-id/", { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});
await page.waitForTimeout(3500);
await page.evaluate(() => document.querySelectorAll('#onetrust-consent-sdk,[id*="osano" i],[class*="osano" i]').forEach(e=>e.remove()));
await page.evaluate(async () => {
  await new Promise((r) => { let t = 0; const i = setInterval(() => { scrollBy(0, 500); t += 500; if (t > document.body.scrollHeight + 2000) { clearInterval(i); r(); } }, 100); });
});
await page.waitForTimeout(3500);
await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(2000);

// What's at the very bottom?
const info = await page.evaluate(() => {
  const out = { total: document.body.scrollHeight, candidates: [] };
  // find the last big blocks
  document.querySelectorAll("body > div, body > section, main > *").forEach((el) => {
    const r = el.getBoundingClientRect();
    if (r.height > 100) out.candidates.push({ tag: el.tagName, cls: (el.className||"").toString().slice(0,120), y: Math.round(r.top+scrollY), h: Math.round(r.height), text: (el.innerText||"").replace(/\s+/g," ").slice(0,200) });
  });
  // any element containing "Legal" / "Hak Cipta" / "Riot Games"
  const foot = Array.from(document.querySelectorAll("div,footer")).filter(el => /Hak Cipta|Copyright|Kebijakan|Legal|Syarat/i.test(el.innerText||"") && el.getBoundingClientRect().height > 40 && el.getBoundingClientRect().height < 800);
  out.footerCandidates = foot.slice(-3).map(el => {
    const r = el.getBoundingClientRect();
    return { cls:(el.className||"").toString().slice(0,120), y: Math.round(r.top+scrollY), h: Math.round(r.height), text: (el.innerText||"").replace(/\s+/g," ").slice(0,600) };
  });
  return out;
});
console.log(JSON.stringify(info, null, 1));

// map section
await page.screenshot({ path: "scrape/sections/06-map.png", clip: { x: 0, y: 3402, width: 1440, height: 736 }, fullPage: true });
// bottom region
const total = info.total;
await page.screenshot({ path: "scrape/sections/98-bottom.png", clip: { x: 0, y: Math.max(0, total - 900), width: 1440, height: 900 }, fullPage: true });
await page.screenshot({ path: "scrape/sections/97-bottomfold.png" });
console.log("done");
await b.close();
