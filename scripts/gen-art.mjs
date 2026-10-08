/**
 * BAREN brand art generator — benteng-bentengan inspired tactical art.
 * Generates: section art stills, article covers, feature tiles, brand marks.
 * All artwork is generated from scratch (no third-party copyrighted assets).
 */
import { chromium } from "playwright";
import fs from "node:fs/promises";
import path from "node:path";

const PUBLIC = path.resolve("public");
const ART = path.join(PUBLIC, "art");
const BRAND = path.join(PUBLIC, "brand");
for (const d of [ART, BRAND]) await fs.mkdir(d, { recursive: true });

const INK = "#0B1220", SAND = "#F2EDE4", EMBER = "#E4572E";

/** Fort (benteng) silhouette with crenellations + rim light. */
function fort(cx, baseY, w, h, side, accent) {
  const teeth = 7, tw = w / (teeth * 2 - 1);
  let cren = "";
  for (let i = 0; i < teeth; i++) {
    cren += `<rect x="${(cx - w / 2 + i * tw * 2).toFixed(1)}" y="${(baseY - h - 22).toFixed(1)}" width="${tw.toFixed(1)}" height="22" fill="${INK}"/>`;
  }
  const rimX = side === "left" ? cx - w / 2 : cx + w / 2;
  const win = `${cx - w * 0.1},${baseY - h * 0.52} ${cx + w * 0.1},${baseY - h * 0.52} ${cx + w * 0.06},${baseY - h * 0.34} ${cx - w * 0.06},${baseY - h * 0.34}`;
  const flagX = side === "left" ? cx - w / 2 + 6 : cx + w / 2 - 6;
  return `<g>
    <rect x="${(cx - w / 2).toFixed(1)}" y="${(baseY - h).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="${INK}"/>
    ${cren}
    <rect x="${rimX.toFixed(1)}" y="${(baseY - h).toFixed(1)}" width="3" height="${h.toFixed(1)}" fill="${accent}" opacity="0.9"/>
    <polygon points="${win}" fill="${accent}" opacity="0.62"/>
    <rect x="${flagX.toFixed(1)}" y="${(baseY - h - 46).toFixed(1)}" width="2.5" height="46" fill="${SAND}" opacity="0.5"/>
    <polygon points="${flagX + 2.5},${(baseY - h - 46).toFixed(1)} ${flagX + 34},${(baseY - h - 38).toFixed(1)} ${flagX + 2.5},${(baseY - h - 30).toFixed(1)}" fill="${accent}" opacity="0.85"/>
  </g>`;
}

function art(w, h, seed, accent, variant = 0) {
  const R = (s => () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff)(seed);
  // variant shifts composition so cards never look like the same image
  const horizon = h * (variant === 1 ? 0.62 : variant === 2 ? 0.84 : 0.74);
  const glowY = variant === 2 ? 0.34 : variant === 1 ? 0.66 : 0.5;
  const glowR = variant === 1 ? 0.44 : variant === 2 ? 0.78 : 0.62;

  // structured dot grid
  const gap = Math.max(22, Math.round(Math.min(w, h) / 26));
  let dots = "";
  for (let x = gap; x < w; x += gap) {
    for (let y = gap; y < h; y += gap) {
      const o = 0.05 + R() * 0.10;
      dots += `<rect x="${x}" y="${y}" width="1.7" height="1.7" fill="${SAND}" opacity="${o.toFixed(2)}"/>`;
    }
  }

  // diagonal hatch
  let hatch = "";
  const step = Math.max(46, Math.round(w / 22));
  for (let i = -2; i < Math.ceil(w / step) + 2; i++) {
    const x = i * step;
    hatch += `<line x1="${x}" y1="-20" x2="${x + h * 0.62}" y2="${h + 20}" stroke="${SAND}" stroke-width="1" opacity="${(0.028 + R() * 0.035).toFixed(3)}"/>`;
  }

  // low-poly shards
  let shards = "";
  for (let i = 0; i < 11; i++) {
    const x = R() * w, y = R() * horizon * 0.95, s = (0.10 + R() * 0.22) * Math.min(w, h);
    shards += `<polygon points="${x.toFixed(0)},${y.toFixed(0)} ${(x + s).toFixed(0)},${(y + s * 0.4).toFixed(0)} ${(x + s * 0.6).toFixed(0)},${(y + s).toFixed(0)}" fill="${accent}" opacity="${(0.05 + R() * 0.09).toFixed(2)}"/>`;
  }

  // ground bands
  let ground = "";
  for (let i = 0; i < 4; i++) {
    const y = horizon + i * (h - horizon) / 4;
    ground += `<rect x="0" y="${y.toFixed(1)}" width="${w}" height="1.4" fill="${SAND}" opacity="${(0.05 - i * 0.008).toFixed(3)}"/>`;
  }

  // two opposing forts + contested middle
  const fw = Math.round(w * 0.20), fh = Math.round(h * 0.30);
  const forts =
    fort(w * 0.17, horizon + h * 0.05, fw, fh, "left", accent) +
    fort(w * 0.83, horizon + h * 0.02, fw * 0.92, fh * 0.88, "right", accent);

  // defense line + capture nodes (benteng-bentengan motif)
  const y1 = horizon - h * 0.10, y2 = horizon - h * 0.16, y3 = horizon - h * 0.11;
  const nodes = [
    [w * 0.17, y1], [w * 0.38, y2], [w * 0.5, y2 - h * 0.03], [w * 0.62, y2], [w * 0.83, y3],
  ].map(([x, y], i) =>
    `<g><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${i === 2 ? 9 : 6}" fill="none" stroke="${accent}" stroke-width="2" opacity="0.85"/>
     <circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${i === 2 ? 3.4 : 2.2}" fill="${accent}" opacity="0.95"/></g>`
  ).join("");

  const poly = [[w * 0.17, y1], [w * 0.38, y2], [w * 0.5, y2 - h * 0.03], [w * 0.62, y2], [w * 0.83, y3]]
    .map(([x, y]) => `${x.toFixed(0)},${y.toFixed(0)}`).join(" ");

  // embers
  let embers = "";
  for (let i = 0; i < 70; i++) {
    const x = R() * w, y = R() * h, r = 0.8 + R() * 2.2;
    embers += `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="${r.toFixed(1)}" fill="#FF9A6B" opacity="${(0.16 + R() * 0.5).toFixed(2)}"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0.35" y2="1">
    <stop offset="0" stop-color="#16233A"/><stop offset="0.5" stop-color="#101A2C"/><stop offset="1" stop-color="#060A12"/>
  </linearGradient>
  <radialGradient id="horizonGlow" cx="0.5" cy="${glowY}" r="${glowR}">
    <stop offset="0" stop-color="${accent}" stop-opacity="0.62"/>
    <stop offset="0.45" stop-color="${accent}" stop-opacity="0.20"/>
    <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="vig" cx="0.5" cy="0.5" r="0.76">
    <stop offset="0.42" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.70"/>
  </radialGradient>
  <linearGradient id="floorG" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${accent}" stop-opacity="0.16"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/>
  </linearGradient>
</defs>
<rect width="${w}" height="${h}" fill="url(#sky)"/>
${shards}
<rect width="${w}" height="${h}" fill="url(#horizonGlow)"/>
${hatch}${dots}
<rect x="0" y="${horizon.toFixed(1)}" width="${w}" height="${(h - horizon).toFixed(1)}" fill="url(#floorG)"/>
${ground}
<polyline points="${poly}" fill="none" stroke="${accent}" stroke-width="2.2" stroke-dasharray="12 10" opacity="0.72"/>
${nodes}
${forts}
${embers}
<rect width="${w}" height="${h}" fill="url(#vig)"/>
</svg>`;
}

const stills = [
  ["about-art", 1600, 900, 7, EMBER, "BAREN"],
  ["agents-art", 1232, 1232, 21, EMBER, "PEMAIN"],
  ["maps-art", 1232, 1232, 33, EMBER, "ARENA"],
  ["event-art", 3440, 1020, 55, EMBER, "TURNAMEN"],
  ["cover-1", 1920, 1080, 101, EMBER, 1],
  ["cover-2", 1920, 1080, 202, EMBER, 2],
  ["cover-3", 1920, 1080, 303, EMBER, 0],
  ["feature-1", 800, 800, 404, EMBER, "01"],
  ["feature-2", 800, 800, 505, EMBER, "02"],
  ["feature-3", 800, 800, 606, EMBER, "03"],
];

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await browser.newContext({ deviceScaleFactor: 1 });
const page = await ctx.newPage();

for (const [name, w, h, seed, accent, variant = 0] of stills) {
  const svg = art(w, h, seed, accent, variant);
  await fs.writeFile(path.join(ART, `${name}.svg`), svg);
  await page.setViewportSize({ width: w, height: h });
  await page.goto("data:text/html," + encodeURIComponent(`<body style="margin:0">${svg}</body>`));
  await page.waitForTimeout(140);
  await page.screenshot({ path: path.join(ART, `${name}.jpg`), type: "jpeg", quality: 84 });
  console.log("  art:", name, `${w}x${h}`);
}

/* ------------------------------------------------------------------ brand marks */
const wordmark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 140" width="760" height="140" role="img" aria-label="BAREN">
  <text x="0" y="114" font-family="Arial Black, Arial, sans-serif" font-size="134" font-weight="900" letter-spacing="7" fill="${SAND}">BAREN</text>
</svg>`;

const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="Baren">
  <rect width="64" height="64" fill="${INK}"/>
  <path d="M11 27 L11 15 L20 15 L20 20 L27 20 L27 15 L37 15 L37 20 L44 20 L44 15 L53 15 L53 27 L56 27 L56 53 L8 53 L8 27 Z" fill="${SAND}"/>
  <rect x="28" y="33" width="8" height="13" fill="${EMBER}"/>
  <rect x="8" y="53" width="48" height="3" fill="${EMBER}"/>
</svg>`;

const markLight = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="Baren">
  <rect width="64" height="64" fill="${SAND}"/>
  <path d="M11 27 L11 15 L20 15 L20 20 L27 20 L27 15 L37 15 L37 20 L44 20 L44 15 L53 15 L53 27 L56 27 L56 53 L8 53 L8 27 Z" fill="${INK}"/>
  <rect x="28" y="33" width="8" height="13" fill="${EMBER}"/>
  <rect x="8" y="53" width="48" height="3" fill="${EMBER}"/>
</svg>`;

await fs.writeFile(path.join(BRAND, "baren-wordmark.svg"), wordmark);
await fs.writeFile(path.join(BRAND, "baren-mark.svg"), mark);
await fs.writeFile(path.join(BRAND, "baren-mark-light.svg"), markLight);
await fs.writeFile(path.join(PUBLIC, "icon.svg"), mark);

await page.setViewportSize({ width: 760, height: 140 });
await page.goto("data:text/html," + encodeURIComponent(`<body style="margin:0;background:transparent">${wordmark}</body>`));
await page.waitForTimeout(160);
await page.screenshot({ path: path.join(BRAND, "baren-wordmark.png"), omitBackground: true });

await browser.close();

console.log("\n=== brand ===");
for (const f of await fs.readdir(BRAND)) {
  const s = await fs.stat(path.join(BRAND, f));
  console.log(`  ${f}  ${(s.size / 1024).toFixed(1)} KB`);
}
