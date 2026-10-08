/**
 * Generate BAREN's own brand assets procedurally (no third-party copyrighted material):
 *  - hero loop video (mp4) + poster
 *  - section art stills
 *  - article cover placeholders
 * All art is generated from scratch with canvas/SVG + ffmpeg.
 */
import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";

const PUBLIC = path.resolve("public");
const MEDIA = path.join(PUBLIC, "media");
const ART = path.join(PUBLIC, "art");
const BRAND = path.join(PUBLIC, "brand");
const FRAMES = path.resolve(".asset-tmp/frames");

for (const d of [MEDIA, ART, BRAND, FRAMES]) await fs.mkdir(d, { recursive: true });

const ff = (args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args], { stdio: "inherit" });

/* ---------------------------------------------------------------- hero video */
const FPS = 24, SECONDS = 6, FRAMES_N = FPS * SECONDS;

const browser = await chromium.launch({ args: ["--no-sandbox"] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
const page = await ctx.newPage();
await page.goto("file://" + path.resolve("scripts/hero-scene.html"));
await page.waitForTimeout(500);

console.log(`→ rendering ${FRAMES_N} hero frames @ ${FPS}fps ...`);
for (let i = 0; i < FRAMES_N; i++) {
  await page.evaluate((t) => window.__draw(t), i / FPS);
  const file = path.join(FRAMES, `f${String(i).padStart(4, "0")}.png`);
  await page.screenshot({ path: file, clip: { x: 0, y: 0, width: 1280, height: 720 } });
}
console.log("→ encoding mp4 ...");
ff(["-framerate", String(FPS), "-i", path.join(FRAMES, "f%04d.png"),
    "-c:v", "libx264", "-profile:v", "high", "-pix_fmt", "yuv420p",
    "-crf", "30", "-movflags", "+faststart", "-an",
    path.join(MEDIA, "hero-loop.mp4")]);
console.log("→ poster + webp ...");
ff(["-i", path.join(FRAMES, "f0000.png"), "-vf", "scale=1920:-2", "-q:v", "4", path.join(MEDIA, "hero-poster.jpg")]);
ff(["-i", path.join(MEDIA, "hero-loop.mp4"), "-vf", "scale=1280:-2", "-c:v", "libwebp", "-q:v", "62", "-loop", "0", "-an", path.join(MEDIA, "hero-loop.webp")]);

/* ------------------------------------------------- section art + card covers */
const ART_SVG = (w, h, seed, accent, label) => {
  const r = (s => () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff)(seed);
  const dots = Array.from({ length: 90 }, () => `<rect x="${(r()*w).toFixed(1)}" y="${(r()*h).toFixed(1)}" width="1.6" height="1.6" fill="#F2EDE4" opacity="${(0.05+r()*0.16).toFixed(2)}"/>`).join("");
  const shards = Array.from({ length: 9 }, () => {
    const x = r()*w, y = r()*h, s = 60 + r()*230;
    return `<polygon points="${x.toFixed(0)},${y.toFixed(0)} ${(x+s).toFixed(0)},${(y+s*0.42).toFixed(0)} ${(x+s*0.62).toFixed(0)},${(y+s).toFixed(0)}" fill="${accent}" opacity="${(0.04+r()*0.10).toFixed(2)}"/>`;
  }).join("");
  const towers = Array.from({ length: 4 }, (_, i) => {
    const bw = 46 + r()*70, bh = 90 + r()*180, bx = 40 + i*(w/4.4) + r()*40, by = h - bh - 24;
    const teeth = 5, tw = bw/(teeth*2-1);
    let t = "";
    for (let k = 0; k < teeth; k++) t += `<rect x="${(bx+k*tw*2).toFixed(1)}" y="${(by-16).toFixed(1)}" width="${tw.toFixed(1)}" height="16" fill="#080D16"/>`;
    return `<g opacity="0.9"><rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" fill="#080D16"/>${t}<rect x="${(bx+2).toFixed(1)}" y="${by.toFixed(1)}" width="2.4" height="${bh.toFixed(1)}" fill="${accent}" opacity="0.75"/></g>`;
  }).join("");
  const lines = Array.from({ length: 16 }, (_, i) => `<line x1="${-80+i*(w/13)}" y1="-30" x2="${-80+i*(w/13)+h*0.72}" y2="${h+30}" stroke="#F2EDE4" stroke-width="1" opacity="0.05"/>`).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0.6" y2="1">
    <stop offset="0" stop-color="#14203A"/><stop offset="0.55" stop-color="#0E1728"/><stop offset="1" stop-color="#070B12"/>
  </linearGradient>
  <radialGradient id="glow" cx="0.5" cy="0.42" r="0.62">
    <stop offset="0" stop-color="${accent}" stop-opacity="0.42"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/>
  </radialGradient>
  <radialGradient id="vig" cx="0.5" cy="0.5" r="0.78">
    <stop offset="0.45" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.66"/>
  </radialGradient>
</defs>
<rect width="${w}" height="${h}" fill="url(#bg)"/>
<rect width="${w}" height="${h}" fill="url(#glow)"/>
${lines}${shards}${dots}${towers}
<rect width="${w}" height="${h}" fill="url(#vig)"/>
<g opacity="0.5"><text x="${w/2}" y="${h/2}" text-anchor="middle" font-family="Arial Black, Arial, sans-serif" font-size="${Math.round(h*0.16)}" font-weight="900" letter-spacing="${Math.round(h*0.02)}" fill="#F2EDE4" opacity="0.07">${label}</text></g>
</svg>`;
};

const stills = [
  ["about-art", 1600, 900, 7, "#E4572E", "BAREN"],
  ["agents-art", 1232, 1232, 21, "#F2EDE4", "PEMAIN"],
  ["maps-art", 1232, 1232, 33, "#E4572E", "ARENA"],
  ["event-art", 3440, 1020, 55, "#E4572E", "TURNAMEN"],
  ["cover-1", 1920, 1080, 101, "#E4572E", "BERITA"],
  ["cover-2", 1920, 1080, 202, "#F2EDE4", "KABAR"],
  ["cover-3", 1920, 1080, 303, "#E4572E", "UPDATE"],
  ["feature-1", 800, 800, 404, "#E4572E", "01"],
  ["feature-2", 800, 800, 505, "#F2EDE4", "02"],
  ["feature-3", 800, 800, 606, "#E4572E", "03"],
];

const svgPage = await ctx.newPage();
for (const [name, w, h, seed, accent, label] of stills) {
  const svg = ART_SVG(w, h, seed, accent, label);
  const svgPath = path.join(ART, `${name}.svg`);
  await fs.writeFile(svgPath, svg);
  await svgPage.setViewportSize({ width: w, height: h });
  await svgPage.goto("data:text/html," + encodeURIComponent(
    `<body style="margin:0">${svg}</body>`));
  await svgPage.waitForTimeout(120);
  await svgPage.screenshot({ path: path.join(ART, `${name}.jpg`), type: "jpeg", quality: 82 });
  console.log("  art:", name, `${w}x${h}`);
}

/* ------------------------------------------------------------------ brand SVGs */
const wordmark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 736 138" width="736" height="138" role="img" aria-label="BAREN">
  <text x="0" y="112" font-family="Arial Black, Arial, sans-serif" font-size="132" font-weight="900" letter-spacing="6" fill="#F2EDE4">BAREN</text>
</svg>`;

const mark = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="Baren">
  <rect width="64" height="64" fill="#0B1220"/>
  <path d="M12 26 L12 16 L20 16 L20 20 L26 20 L26 16 L34 16 L34 20 L40 20 L40 16 L48 16 L48 26 L52 26 L52 52 L12 52 Z" fill="#F2EDE4"/>
  <rect x="28" y="32" width="8" height="12" fill="#E4572E"/>
  <rect x="12" y="52" width="40" height="3" fill="#E4572E"/>
</svg>`;

await fs.writeFile(path.join(BRAND, "baren-wordmark.svg"), wordmark);
await fs.writeFile(path.join(BRAND, "baren-mark.svg"), mark);
const markLight = mark
  .replace(/fill="#0B1220"/g, "fill=\"#TMP\"")
  .replace(/fill="#F2EDE4"/g, "fill=\"#0B1220\"")
  .replace(/fill="#TMP"/g, "fill=\"#F2EDE4\"");
await fs.writeFile(path.join(BRAND, "baren-mark-light.svg"), markLight);

// wordmark png (for hero, transparent bg)
const wmPage = await ctx.newPage();
await wmPage.setViewportSize({ width: 736, height: 138 });
await wmPage.goto("data:text/html," + encodeURIComponent(`<body style="margin:0;background:transparent">${wordmark}</body>`));
await wmPage.waitForTimeout(150);
await wmPage.screenshot({ path: path.join(BRAND, "baren-wordmark.png"), omitBackground: true });

// favicon
await fs.writeFile(path.join(PUBLIC, "icon.svg"), mark);

await browser.close();
await fs.rm(path.resolve(".asset-tmp"), { recursive: true, force: true });

console.log("\n=== generated ===");
for (const d of [BRAND, MEDIA, ART]) {
  for (const f of await fs.readdir(d)) {
    const s = await fs.stat(path.join(d, f));
    console.log(`  ${path.relative(PUBLIC, path.join(d, f))}  ${(s.size / 1024).toFixed(1)} KB`);
  }
}
