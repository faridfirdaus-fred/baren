/** Functional interaction test: header scroll state, FAQ accordion, mobile menu. */
import { chromium } from "playwright";

const BASE = process.argv[2] || "http://localhost:3100";
const b = await chromium.launch({ args: ["--no-sandbox"] });
const out = {};

/* ---------- desktop: header transparent -> solid ---------- */
{
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  await p.waitForTimeout(1500);

  const atTop = await p.evaluate(() => {
    const h = document.querySelector("header");
    const s = getComputedStyle(h);
    return { bg: s.backgroundColor, border: s.borderBottomWidth, pos: s.position, h: Math.round(h.getBoundingClientRect().height) };
  });
  await p.evaluate(() => scrollTo(0, 1200));
  await p.waitForTimeout(900);
  const scrolled = await p.evaluate(() => {
    const h = document.querySelector("header");
    const s = getComputedStyle(h);
    return { bg: s.backgroundColor, border: s.borderBottomWidth, backdrop: s.backdropFilter };
  });
  out.header = { atTop, scrolled, changed: atTop.bg !== scrolled.bg || atTop.border !== scrolled.border };
  await p.close();
}

/* ---------- FAQ accordion ---------- */
{
  const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await p.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  await p.waitForTimeout(1200);

  const triggers = await p.$$("#faq button[aria-controls]");
  const before = await p.evaluate(() =>
    Array.from(document.querySelectorAll("#faq button[aria-controls]")).map((b) => b.getAttribute("aria-expanded"))
  );

  // click the 3rd question
  await triggers[2].click();
  await p.waitForTimeout(800);
  const after = await p.evaluate(() =>
    Array.from(document.querySelectorAll("#faq button[aria-controls]")).map((b) => b.getAttribute("aria-expanded"))
  );
  const panelVisible = await p.evaluate(() => {
    const dd = document.querySelector("#faq-panel-2");
    return dd ? Math.round(dd.getBoundingClientRect().height) : -1;
  });
  out.faq = { count: triggers.length, before, after, onlyOneOpen: after.filter((x) => x === "true").length === 1, panelHeight: panelVisible };
  await p.close();
}

/* ---------- mobile menu ---------- */
{
  const p = await (await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
  await p.goto(BASE, { waitUntil: "networkidle", timeout: 60000 });
  await p.waitForTimeout(1200);

  const toggle = await p.$('header button[aria-controls="mobile-menu"]');
  const closed = await p.evaluate(() => !!document.querySelector("#mobile-menu"));
  await toggle.click();
  await p.waitForTimeout(700);
  const opened = await p.evaluate(() => {
    const m = document.querySelector("#mobile-menu");
    const btn = document.querySelector('header button[aria-controls="mobile-menu"]');
    return { exists: !!m, expanded: btn?.getAttribute("aria-expanded"), links: m ? m.querySelectorAll("a").length : 0 };
  });
  // Escape should close
  await p.keyboard.press("Escape");
  await p.waitForTimeout(700);
  const afterEsc = await p.evaluate(() => !!document.querySelector("#mobile-menu"));
  out.mobileMenu = { closedInitially: !closed, opened, closedAfterEscape: !afterEsc };
  await p.close();
}

await b.close();
console.log(JSON.stringify(out, null, 2));
