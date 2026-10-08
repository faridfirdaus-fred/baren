/**
 * Screenshot our own BAREN landing page for visual comparison against the reference.
 * Usage: node scripts/verify-visual.mjs [baseUrl]
 */
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const BASE = process.argv[2] || "http://localhost:3000";
const OUT = path.resolve("verify");
await fs.mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const results = [];

for (const [name, vp] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport: vp, locale: "id-ID", deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text().slice(0, 200)); });
  page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message.slice(0, 200)));

  const resp = await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 }).catch((e) => ({ status: () => "ERR " + e.message }));
  await page.waitForTimeout(1500);

  // scroll through the whole page so lazy images decode, then return to top
  await page.evaluate(async () => {
    await new Promise((res) => {
      let t = 0;
      const i = setInterval(() => {
        scrollBy(0, 600);
        t += 600;
        if (t > document.body.scrollHeight + 1200) { clearInterval(i); res(); }
      }, 90);
    });
  });
  await page.waitForTimeout(3000);
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(1500);

  const info = await page.evaluate(() => {
    const txt = (el) => (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
    const h1 = document.querySelector("h1");
    const h2s = Array.from(document.querySelectorAll("h2")).map(txt);
    const ctaStyles = Array.from(document.querySelectorAll("a,button"))
      .filter((el) => /MAIN GRATIS|TONTON|LIHAT SEMUA|LOGIN|BUKA HALAMAN/i.test(txt(el)))
      .map((el) => {
        const s = getComputedStyle(el);
        return { text: txt(el).slice(0, 40), radius: s.borderRadius, bg: s.backgroundColor, color: s.color, transform: s.textTransform };
      });
    const sections = Array.from(document.querySelectorAll("main > *, main section, main > div > section")).map((el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      return { tag: el.tagName.toLowerCase(), h: Math.round(r.height), bg: s.backgroundColor, y: Math.round(r.top + scrollY) };
    }).filter((s) => s.h > 60);
    const imgs = Array.from(document.querySelectorAll("img")).map((i) => ({ src: i.currentSrc || i.src, alt: i.alt, w: i.naturalWidth }));
    const vids = Array.from(document.querySelectorAll("video")).map((v) => ({ src: v.currentSrc || v.src, poster: v.poster, autoplay: v.autoplay, loop: v.loop }));
    const extLinks = Array.from(document.querySelectorAll("a[href]"))
      .map((a) => a.href).filter((h) => /playvalorant|rgpub|riotgames/i.test(h));
    const fontUsed = getComputedStyle(document.body).fontFamily;
    return {
      title: document.title, lang: document.documentElement.lang,
      docHeight: document.body.scrollHeight,
      h1: h1 ? txt(h1) : null, h2s, ctaStyles, sections, imgs, vids, extLinks, fontUsed,
      imgCount: imgs.length, imgNoAlt: imgs.filter((i) => !i.alt).length,
    };
  });
  info.viewport = name;
  info.status = typeof resp?.status === "function" ? resp.status() : "?";
  info.consoleErrors = errors.slice(0, 15);

  await page.screenshot({ path: path.join(OUT, `baren-${name}-full.png`), fullPage: true });
  await page.screenshot({ path: path.join(OUT, `baren-${name}-fold.png`) });

  // per-section
  const regions = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll("main > section, main > div > section, main > div").forEach((el, i) => {
      const r = el.getBoundingClientRect();
      if (r.height > 120) out.push({ i, y: Math.round(r.top + scrollY), h: Math.round(r.height) });
    });
    return out;
  });
  for (const r of regions) {
    await page.screenshot({
      path: path.join(OUT, `baren-${name}-sec${String(r.i).padStart(2, "0")}.png`),
      clip: { x: 0, y: r.y, width: vp.width, height: Math.min(r.h, 2400) },
      fullPage: true,
    }).catch(() => {});
  }

  results.push(info);
  await ctx.close();
}

await browser.close();
await fs.writeFile(path.join(OUT, "report.json"), JSON.stringify(results, null, 2));

for (const r of results) {
  console.log(`\n===== ${r.viewport} (HTTP ${r.status}) =====`);
  console.log("title:", r.title, "| lang:", r.lang, "| docHeight:", r.docHeight);
  console.log("h1:", r.h1);
  console.log("h2s:", JSON.stringify(r.h2s));
  console.log("images:", r.imgCount, "| missing alt:", r.imgNoAlt);
  console.log("videos:", JSON.stringify(r.vids));
  console.log("cta radius/bg/color/transform:");
  r.ctaStyles.forEach((c) => console.log(`   "${c.text}" r=${c.radius} bg=${c.bg} c=${c.color} ${c.transform}`));
  console.log("sections:", r.sections.map((s) => `${s.tag}(${s.h}px,${s.bg})`).join(" "));
  console.log("external refs (should be empty):", JSON.stringify(r.extLinks));
  console.log("console errors:", JSON.stringify(r.consoleErrors));
  console.log("body font:", r.fontUsed);
}
