/**
 * Focused second pass: typography, header nav, footer, section internals.
 */
import { chromium } from "playwright";
import fs from "node:fs/promises";

const TARGET = "https://playvalorant.com/id-id/";

const DETAIL = () => {
  const txt = (el) => (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
  const box = (el) => { const r = el.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y + scrollY), w: Math.round(r.width), h: Math.round(r.height) }; };
  const typo = (el) => {
    const s = getComputedStyle(el);
    return {
      tag: el.tagName.toLowerCase(),
      text: txt(el).slice(0, 120),
      box: box(el),
      font: s.fontFamily.split(",")[0].replace(/"/g, ""),
      size: s.fontSize, weight: s.fontWeight, lh: s.lineHeight, ls: s.letterSpacing,
      transform: s.textTransform, color: s.color, align: s.textAlign,
      maxW: s.maxWidth, mb: s.marginBottom, mt: s.marginTop,
    };
  };

  // All elements with visible text, deduped by (text, font, size)
  const seen = new Set();
  const typeSamples = [];
  document.querySelectorAll("h1,h2,h3,h4,h5,h6,p,a,span,button,li,time,div").forEach((el) => {
    const t = txt(el);
    if (!t || t.length > 200) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    // only leaf-ish nodes
    if (el.children.length > 0 && !["h1","h2","h3","h4","h5","h6","button","a"].includes(el.tagName.toLowerCase())) {
      const own = Array.from(el.childNodes).filter((n) => n.nodeType === 3).map((n) => n.textContent.trim()).join("").trim();
      if (!own) return;
    }
    const k = `${t}|${getComputedStyle(el).fontSize}|${getComputedStyle(el).fontFamily.split(",")[0]}`;
    if (seen.has(k)) return;
    seen.add(k);
    typeSamples.push(typo(el));
  });

  // Header
  const headerEl = document.querySelector("header, [class*='riotbar'], nav")?.closest("header,div,nav") || document.querySelector("header");
  let header = null;
  if (headerEl) {
    const hs = getComputedStyle(headerEl);
    header = {
      box: box(headerEl), height: hs.height, background: hs.backgroundColor, position: hs.position,
      zIndex: hs.zIndex, padding: hs.padding,
      navItems: Array.from(headerEl.querySelectorAll("a,button")).map((el) => ({
        text: txt(el), href: el.getAttribute("href"), box: box(el),
        font: getComputedStyle(el).fontFamily.split(",")[0], size: getComputedStyle(el).fontSize,
        weight: getComputedStyle(el).fontWeight, transform: getComputedStyle(el).textTransform,
        color: getComputedStyle(el).color, bg: getComputedStyle(el).backgroundColor,
        pad: getComputedStyle(el).padding, radius: getComputedStyle(el).borderRadius,
      })).filter((n) => n.box.w > 0),
      logo: Array.from(headerEl.querySelectorAll("img,svg")).map((el) => ({ tag: el.tagName, src: el.src || null, box: box(el) })).slice(0, 6),
    };
  }

  // Footer
  const footerEl = document.querySelector("footer");
  let footer = null;
  if (footerEl) {
    const fs_ = getComputedStyle(footerEl);
    footer = {
      box: box(footerEl), background: fs_.backgroundColor, padding: fs_.padding,
      text: txt(footerEl).slice(0, 900),
      links: Array.from(footerEl.querySelectorAll("a")).map((el) => ({
        text: txt(el), href: el.getAttribute("href"), size: getComputedStyle(el).fontSize,
        transform: getComputedStyle(el).textTransform, color: getComputedStyle(el).color,
      })),
      images: Array.from(footerEl.querySelectorAll("img")).map((el) => ({ src: el.src, box: box(el) })).slice(0, 10),
    };
  }

  // Section-by-section detailed internals
  const sections = Array.from(document.querySelectorAll("section")).map((sec) => {
    const s = getComputedStyle(sec);
    const r = sec.getBoundingClientRect();
    if (r.width === 0 || r.height < 60) return null;
    const inner = sec.querySelector("div,ul,article");
    return {
      box: box(sec), class: sec.className.toString().slice(0, 160),
      bg: s.backgroundColor, pad: s.padding, minH: s.minHeight,
      textColor: s.color,
      fontFamily: s.fontFamily.split(",")[0],
      media: Array.from(sec.querySelectorAll("img,video")).map((m) => ({
        tag: m.tagName.toLowerCase(), box: box(m),
        src: (m.currentSrc || m.src || "").slice(0, 150),
        objectFit: getComputedStyle(m).objectFit,
        position: getComputedStyle(m).position,
      })),
      // text blocks with their own styles
      textBlocks: Array.from(sec.querySelectorAll("h1,h2,h3,h4,p,span,button,a,time")).filter((el) => {
        const t = txt(el);
        return t && el.children.length === 0;
      }).map((el) => {
        const es = getComputedStyle(el);
        return {
          text: txt(el).slice(0, 200), box: box(el),
          font: es.fontFamily.split(",")[0], size: es.fontSize, weight: es.fontWeight,
          lh: es.lineHeight, ls: es.letterSpacing, transform: es.textTransform,
          color: es.color, bg: es.backgroundColor, pad: es.padding, radius: es.borderRadius,
          maxW: es.maxWidth, align: es.textAlign,
        };
      }).slice(0, 30),
      innerMaxWidth: inner ? getComputedStyle(inner).maxWidth : null,
    };
  }).filter(Boolean);

  // CSS custom properties on :root
  const rootCS = getComputedStyle(document.documentElement);
  const vars = {};
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) {
        if (rule.selectorText === ":root" || rule.selectorText === "html") {
          for (const p of Array.from(rule.style)) {
            if (p.startsWith("--")) vars[p] = rule.style.getPropertyValue(p).trim();
          }
        }
      }
    } catch {}
  }

  return { typeSamples, header, footer, sections, vars, rootFontSize: rootCS.fontSize };
};

const b = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, locale: "id-ID" });
const page = await ctx.newPage();
await page.goto(TARGET, { waitUntil: "domcontentloaded", timeout: 90000 });
await page.waitForLoadState("networkidle", { timeout: 60000 }).catch(() => {});
await page.waitForTimeout(4000);
await page.evaluate(async () => {
  await new Promise((r) => { let t = 0; const i = setInterval(() => { scrollBy(0, 400); t += 400; if (t > document.body.scrollHeight + 2000) { clearInterval(i); r(); } }, 120); });
});
await page.waitForTimeout(2500);
await page.evaluate(() => scrollTo(0, 0));
await page.waitForTimeout(1500);
const detail = await page.evaluate(DETAIL);
await fs.writeFile("scrape/detail.json", JSON.stringify(detail, null, 2));
await b.close();

console.log("=== TYPOGRAPHY SAMPLES ===");
detail.typeSamples.forEach((t) => console.log(`  ${t.tag} ${t.size}/${t.weight} lh=${t.lh} ls=${t.ls} ${t.transform} "${t.font}" ${t.color} | ${JSON.stringify(t.text.slice(0, 70))}`));
console.log("\n=== HEADER ===");
console.log(JSON.stringify(detail.header, null, 1).slice(0, 3000));
console.log("\n=== FOOTER ===");
console.log(JSON.stringify(detail.footer, null, 1).slice(0, 2500));
console.log("\n=== ROOT VARS ===");
console.log(JSON.stringify(detail.vars, null, 1).slice(0, 2500));
console.log("\nroot font size:", detail.rootFontSize);
