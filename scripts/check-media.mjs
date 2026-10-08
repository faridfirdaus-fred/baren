/** Verify every image actually decodes (waits properly, no races). */
import { chromium } from "playwright";

const BASE = process.argv[2] || "http://localhost:3100";
const b = await chromium.launch({ args: ["--no-sandbox"] });
const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();

const failed = [];
p.on("response", (r) => {
  if (r.url().includes("/_next/image") || /\.(jpg|png|webp|svg|mp4)/.test(r.url())) {
    if (r.status() >= 400) failed.push(`${r.status()} ${r.url().slice(0, 120)}`);
  }
});

await p.goto(BASE, { waitUntil: "load", timeout: 90000 });
// scroll through so lazy images load
await p.evaluate(async () => {
  await new Promise((res) => { let t = 0; const i = setInterval(() => { scrollBy(0, 600); t += 600; if (t > document.body.scrollHeight + 1200) { clearInterval(i); res(); } }, 90); });
});
await p.waitForTimeout(4000);

const imgs = await p.evaluate(() =>
  Array.from(document.images).map((i) => ({
    src: (i.currentSrc || i.src).split("?")[0].split("/").pop(),
    nat: i.naturalWidth,
    complete: i.complete,
    rendered: Math.round(i.getBoundingClientRect().width),
  }))
);
const vids = await p.evaluate(() =>
  Array.from(document.querySelectorAll("video")).map((v) => ({ src: (v.currentSrc || v.src).split("/").pop(), ready: v.readyState, w: v.videoWidth, h: v.videoHeight }))
);

await b.close();
console.log("images:", imgs.length, "| broken(nat=0):", imgs.filter((i) => i.nat === 0).length);
imgs.forEach((i) => console.log(`  ${i.nat > 0 ? "OK    " : "BROKEN"} ${String(i.nat).padStart(5)}px complete=${i.complete} rendered=${i.rendered} ${i.src}`));
console.log("videos:", JSON.stringify(vids));
console.log("failed HTTP responses:", failed.length ? failed : "none");
