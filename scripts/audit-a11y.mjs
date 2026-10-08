/** Audit real rendered contrast + a11y basics on the built page. */
import { chromium } from "playwright";

const BASE = process.argv[2] || "http://localhost:3100";
const browser = await chromium.launch({ args: ["--no-sandbox"] });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(2000);

const audit = await page.evaluate(() => {
  const srgb = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = ([r, g, b]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
  const parse = (s) => {
    const m = s.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(",").map((x) => parseFloat(x));
    return { rgb: [p[0], p[1], p[2]], a: p.length > 3 ? p[3] : 1 };
  };
  const over = (fg, bg) => fg.rgb.map((c, i) => c * fg.a + bg[i] * (1 - fg.a));
  const effBg = (el) => {
    let n = el;
    while (n && n !== document.documentElement) {
      const s = getComputedStyle(n);
      const c = parse(s.backgroundColor);
      if (c && c.a > 0.85) return c.rgb;
      n = n.parentElement;
    }
    return [255, 255, 255];
  };
  const ratio = (a, b) => { const l1 = lum(a), l2 = lum(b); return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05); };

  const results = [];
  document.querySelectorAll("p,h1,h2,h3,a,span,li,button").forEach((el) => {
    const t = (el.innerText || "").trim();
    if (!t || t.length > 200 || el.children.length > 0) return;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return;
    const s = getComputedStyle(el);
    const fg = parse(s.color);
    if (!fg) return;
    const bg = effBg(el);
    const eff = fg.a < 1 ? over(fg, bg) : fg.rgb;
    const cr = ratio(eff, bg);
    const px = parseFloat(s.fontSize);
    const bold = parseInt(s.fontWeight, 10) >= 700;
    const large = px >= 24 || (px >= 18.66 && bold);
    const need = large ? 3.0 : 4.5;
    if (cr < need) results.push({ text: t.slice(0, 60), size: s.fontSize, weight: s.fontWeight, color: s.color, cr: +cr.toFixed(2), need });
  });

  // a11y basics
  const imgsNoAlt = Array.from(document.querySelectorAll("img")).filter((i) => i.alt === null).length;
  const btnsNoName = Array.from(document.querySelectorAll("button")).filter((b) => !(b.innerText || "").trim() && !b.getAttribute("aria-label")).length;
  const linksNoName = Array.from(document.querySelectorAll("a")).filter((a) => !(a.innerText || "").trim() && !a.getAttribute("aria-label")).length;
  const h1Count = document.querySelectorAll("h1").length;
  const landmarks = { header: !!document.querySelector("header"), main: !!document.querySelector("main"), footer: !!document.querySelector("footer"), nav: document.querySelectorAll("nav").length };
  const focusables = document.querySelectorAll("a[href],button,input,select,textarea,[tabindex]:not([tabindex='-1'])").length;
  const imgs = Array.from(document.querySelectorAll("img")).map((i) => ({ src: (i.currentSrc||i.src).split("/").pop(), nat: i.naturalWidth, rendered: Math.round(i.getBoundingClientRect().width), alt: i.alt }));
  const broken = imgs.filter((i) => i.nat === 0);
  return { contrastFailures: results, imgsNoAlt, btnsNoName, linksNoName, h1Count, landmarks, focusables, broken, imgCount: imgs.length };
});

await browser.close();
console.log(JSON.stringify(audit, null, 2));
