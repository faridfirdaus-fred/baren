/**
 * Scrape https://playvalorant.com/id-id/ with Playwright.
 * Outputs raw HTML, structured content, design tokens, screenshots, assets.
 */
import { chromium, devices } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const TARGET = process.env.TARGET_URL || "https://playvalorant.com/id-id/";
const OUT = path.resolve("scrape");
const ASSETS = path.join(OUT, "assets");
const SHOTS = path.join(OUT, "screenshots");

async function ensureDirs() {
  for (const d of [OUT, ASSETS, SHOTS]) await fs.mkdir(d, { recursive: true });
}

async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0;
      const step = 400;
      const timer = setInterval(() => {
        window.scrollBy(0, step);
        total += step;
        if (total >= document.body.scrollHeight + 2000) {
          clearInterval(timer);
          resolve();
        }
      }, 120);
    });
  });
  await page.waitForTimeout(2500);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1500);
}

async function dismissOverlays(page) {
  const labels = [
    "Accept All Cookies", "Accept All", "Terima Semua Cookie", "Terima Semua",
    "Accept", "Terima", "I Accept", "Setuju", "OK", "Got it",
  ];
  for (const label of labels) {
    try {
      const btn = page.getByRole("button", { name: new RegExp(`^\\s*${label}\\s*$`, "i") }).first();
      if (await btn.isVisible({ timeout: 700 })) {
        await btn.click({ timeout: 1500 });
        await page.waitForTimeout(700);
      }
    } catch { /* not present */ }
  }
  // Kill residual modal/cookie backdrops that would block screenshots
  await page.evaluate(() => {
    const kill = ["#onetrust-consent-sdk", '[id*="cookie" i]', '[class*="cookie" i]', '[id*="gdpr" i]'];
    for (const sel of kill) {
      document.querySelectorAll(sel).forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.height > 80 && r.width > 200) el.style.display = "none";
      });
    }
  });
}

const EXTRACT = () => {
  const vis = (el) => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.width > 0 && r.height > 0 && s.visibility !== "hidden" && s.display !== "none" && s.opacity !== "0";
  };
  const box = (el) => {
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) };
  };
  const txt = (el) => (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
  const abs = (u) => { try { return new URL(u, location.href).href; } catch { return u; } };

  const styleOf = (el) => {
    const s = getComputedStyle(el);
    return {
      fontFamily: s.fontFamily,
      fontSize: s.fontSize,
      fontWeight: s.fontWeight,
      lineHeight: s.lineHeight,
      letterSpacing: s.letterSpacing,
      textTransform: s.textTransform,
      color: s.color,
      background: s.backgroundColor,
      backgroundImage: s.backgroundImage === "none" ? null : s.backgroundImage.slice(0, 400),
      padding: s.padding,
      margin: s.margin,
      borderRadius: s.borderRadius,
      textAlign: s.textAlign,
      display: s.display,
      gap: s.gap,
      gridTemplateColumns: s.gridTemplateColumns === "none" ? null : s.gridTemplateColumns,
      flexDirection: s.flexDirection,
      justifyContent: s.justifyContent,
      alignItems: s.alignItems,
      maxWidth: s.maxWidth,
      position: s.position,
    };
  };

  const q = (sel, mapFn) => Array.from(document.querySelectorAll(sel)).filter(vis).map(mapFn);

  const headings = q("h1,h2,h3,h4,h5,h6", (el) => ({
    tag: el.tagName.toLowerCase(), text: txt(el), box: box(el), style: styleOf(el),
  }));

  const images = q("img", (el) => ({
    src: abs(el.currentSrc || el.src), alt: el.alt, box: box(el),
    naturalWidth: el.naturalWidth, naturalHeight: el.naturalHeight,
    srcset: (el.srcset || "").slice(0, 600),
  }));

  const videos = Array.from(document.querySelectorAll("video")).map((el) => ({
    src: el.currentSrc || el.src || abs(el.querySelector("source")?.src || ""),
    poster: el.poster ? abs(el.poster) : null,
    autoplay: el.autoplay, loop: el.loop, muted: el.muted,
    box: box(el),
    sources: Array.from(el.querySelectorAll("source")).map((s) => abs(s.src)),
  }));

  const links = q("a[href]", (el) => ({
    href: abs(el.getAttribute("href")), text: txt(el), box: box(el), style: styleOf(el),
  }));

  const buttons = q("button,[role=button]", (el) => ({
    text: txt(el), box: box(el), style: styleOf(el),
    ariaLabel: el.getAttribute("aria-label"),
  }));

  const paragraphs = q("p,li", (el) => ({ text: txt(el), box: box(el), style: styleOf(el) }))
    .filter((p) => p.text.length > 0);

  // Elements that paint a background-image (hero art, section art)
  const bgImages = Array.from(document.querySelectorAll("body *")).filter((el) => {
    if (!vis(el)) return false;
    const bi = getComputedStyle(el).backgroundImage;
    return bi && bi !== "none" && bi.includes("url(");
  }).map((el) => {
    const s = getComputedStyle(el);
    return {
      box: box(el), backgroundImage: s.backgroundImage.slice(0, 400),
      backgroundSize: s.backgroundSize, backgroundPosition: s.backgroundPosition,
      tag: el.tagName.toLowerCase(), class: (el.className || "").toString().slice(0, 160),
    };
  }).slice(0, 120);

  // Section-level outline of the whole document, in visual order
  const sectionSel = 'main section, body > section, main > div > section, [class*="Section" i], [class*="section" i]';
  const sections = Array.from(document.querySelectorAll(sectionSel)).filter(vis).map((el) => {
    const s = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      class: (el.className || "").toString().slice(0, 200),
      id: el.id || null,
      box: box(el),
      text: txt(el).slice(0, 1200),
      headings: Array.from(el.querySelectorAll("h1,h2,h3,h4,h5,h6")).map((h) => ({ tag: h.tagName.toLowerCase(), text: txt(h) })).slice(0, 12),
      imageCount: el.querySelectorAll("img").length,
      videoCount: el.querySelectorAll("video").length,
      backgroundColor: s.backgroundColor,
      backgroundImage: s.backgroundImage === "none" ? null : s.backgroundImage.slice(0, 300),
      padding: s.padding,
    };
  }).filter((s) => s.box.h > 60).slice(0, 60);

  // Design tokens sampled from every visible element
  const fontCount = {}, colorCount = {}, bgCount = {};
  const bump = (o, k) => { if (k && k !== "rgba(0, 0, 0, 0)") o[k] = (o[k] || 0) + 1; };
  Array.from(document.querySelectorAll("body *")).forEach((el) => {
    if (!vis(el)) return;
    const s = getComputedStyle(el);
    bump(fontCount, s.fontFamily);
    if (txt(el)) bump(colorCount, s.color);
    bump(bgCount, s.backgroundColor);
  });
  const top = (o, n = 25) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => ({ value: k, count: v }));

  const bodyStyle = styleOf(document.body);
  const htmlStyle = styleOf(document.documentElement);

  return {
    url: location.href,
    title: document.title,
    lang: document.documentElement.lang,
    metaDescription: document.querySelector('meta[name="description"]')?.content || null,
    viewport: { width: window.innerWidth, height: window.innerHeight, dpr: window.devicePixelRatio },
    documentHeight: document.body.scrollHeight,
    bodyStyle, htmlStyle,
    headings, images, videos, links, buttons, paragraphs, bgImages, sections,
    tokens: { fonts: top(fontCount, 15), colors: top(colorCount, 25), backgrounds: top(bgCount, 25) },
    counts: {
      headings: headings.length, images: images.length, videos: videos.length,
      links: links.length, buttons: buttons.length, paragraphs: paragraphs.length, sections: sections.length,
    },
  };
};

async function downloadAssets(assetUrls) {
  const manifest = [];
  for (const url of assetUrls) {
    try {
      const u = new URL(url);
      let name = decodeURIComponent(path.basename(u.pathname)).replace(/[^a-zA-Z0-9._-]/g, "_");
      if (!name || name.length < 3) continue;
      if (!/\.(png|jpe?g|webp|gif|svg|avif)$/i.test(name)) name += ".png";
      if (name.length > 90) name = name.slice(0, 60) + "_" + name.slice(-25);
      const dest = path.join(ASSETS, name);
      try { await fs.access(dest); manifest.push({ url, file: name, skipped: true }); continue; } catch {}
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } });
      if (!res.ok) { manifest.push({ url, error: `HTTP ${res.status}` }); continue; }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 300 || buf.length > 12 * 1024 * 1024) { manifest.push({ url, error: `size ${buf.length}` }); continue; }
      await fs.writeFile(dest, buf);
      manifest.push({ url, file: name, bytes: buf.length });
    } catch (e) { manifest.push({ url, error: e.message }); }
  }
  return manifest;
}

async function scrapeViewport(browser, name, viewport, isMobile) {
  const ctx = await browser.newContext({
    ...(isMobile ? devices["iPhone 13"] : {}),
    viewport,
    locale: "id-ID",
    userAgent: isMobile ? undefined : "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  const consoleErrors = [];
  page.on("console", (m) => { if (m.type() === "error") consoleErrors.push(m.text().slice(0, 200)); });

  await page.goto(TARGET, { waitUntil: "domcontentloaded", timeout: 90000 });
  await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(4000);
  await dismissOverlays(page);
  await autoScroll(page);
  await dismissOverlays(page);
  await page.waitForTimeout(2000);

  const data = await page.evaluate(EXTRACT);
  data.consoleErrors = consoleErrors.slice(0, 20);
  data.viewportName = name;

  await page.screenshot({ path: path.join(SHOTS, `${name}-full.png`), fullPage: true }).catch((e) => console.error("shot full", e.message));
  await page.screenshot({ path: path.join(SHOTS, `${name}-fold.png`), fullPage: false }).catch(() => {});

  if (!isMobile) {
    const html = await page.content();
    await fs.writeFile(path.join(OUT, "raw.html"), html, "utf8");
    const scripts = await page.evaluate(() =>
      Array.from(document.querySelectorAll("script[src]")).map((s) => s.src).slice(0, 60)
    );
    data.scripts = scripts;
    const cssLinks = await page.evaluate(() =>
      Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map((l) => l.href)
    );
    data.cssLinks = cssLinks;
  }

  await ctx.close();
  return data;
}

async function main() {
  await ensureDirs();
  const browser = await chromium.launch({ args: ["--no-sandbox", "--disable-dev-shm-usage"] });

  console.log("→ scraping desktop 1440x900 ...");
  const desktop = await scrapeViewport(browser, "desktop", { width: 1440, height: 900 }, false);

  console.log("→ scraping mobile 390x844 ...");
  const mobile = await scrapeViewport(browser, "mobile", { width: 390, height: 844 }, true);

  await browser.close();

  await fs.writeFile(path.join(OUT, "desktop.json"), JSON.stringify(desktop, null, 2));
  await fs.writeFile(path.join(OUT, "mobile.json"), JSON.stringify(mobile, null, 2));

  // Collect asset URLs: images + video posters + bg images
  const urls = new Set();
  for (const d of [desktop, mobile]) {
    d.images.forEach((i) => i.src && urls.add(i.src));
    d.videos.forEach((v) => { if (v.poster) urls.add(v.poster); });
    d.bgImages.forEach((b) => {
      const m = [...b.backgroundImage.matchAll(/url\(["']?(.*?)["']?\)/g)];
      m.forEach((x) => x[1] && urls.add(x[1]));
    });
  }
  const list = [...urls].filter((u) => u.startsWith("http"));
  console.log(`→ downloading ${list.length} asset URLs ...`);
  const manifest = await downloadAssets(list);
  await fs.writeFile(path.join(OUT, "assets-manifest.json"), JSON.stringify(manifest, null, 2));

  console.log("\n=== SUMMARY ===");
  console.log("title:", desktop.title);
  console.log("doc height:", desktop.documentHeight, "| mobile:", mobile.documentHeight);
  console.log("counts:", JSON.stringify(desktop.counts));
  console.log("videos:", JSON.stringify(desktop.videos.map((v) => ({ src: v.src, poster: v.poster, box: v.box })), null, 1));
  console.log("downloaded:", manifest.filter((m) => m.bytes).length, "| failed:", manifest.filter((m) => m.error).length);
  console.log("fonts:", desktop.tokens.fonts.slice(0, 6).map((f) => f.value).join(" | "));
  console.log("headings:");
  desktop.headings.forEach((h) => console.log(`  [${h.tag}] ${h.text.slice(0, 110)}`));
}

main().catch((e) => { console.error("FATAL", e); process.exit(1); });
