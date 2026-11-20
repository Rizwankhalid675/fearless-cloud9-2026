/**
 * capture.mjs — photograph the real app at 1080p, timed to the real narration.
 *
 *   node video/capture.mjs
 *   SITE=http://localhost:5174 node video/capture.mjs
 *
 * Every frame is the actual product in a real browser: no mock-ups, no
 * recreations. Playwright's own screencast does not work with the Chrome build
 * on this machine, so each beat is captured as full-resolution stills instead —
 * a burst of frames through any movement, then a hold. build.py turns the
 * manifest into the cut.
 *
 * Each beat is held for exactly as long as its narration file, read with
 * ffprobe, so the video needs no hand-syncing.
 */

import { chromium } from "playwright";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SITE = process.env.SITE ?? "https://rizwankhalid675.github.io/fearless-cloud9-2026/";
const REPO_RESULTS =
  "https://github.com/Rizwankhalid675/fearless-cloud9-2026/blob/main/docs/RESULTS.md";
const FRAMES = "video/frames";
const PAD_HEAD = 600;
const PAD_TAIL = 900;
const MOTION_MS = 50; // 20fps through movement

const CHROME = process.env.CHROME_PATH ??
  `${process.env.HOME}/Library/Caches/ms-playwright/chromium-1248/chrome-mac-arm64/` +
  `Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`;

const narrationMs = (n) =>
  Math.round(
    parseFloat(
      execFileSync("ffprobe", [
        "-v", "error", "-show_entries", "format=duration",
        "-of", "default=nw=1:nk=1", `video/audio/${String(n).padStart(2, "0")}.wav`,
      ]).toString().trim(),
    ) * 1000,
  );

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

rmSync(FRAMES, { recursive: true, force: true });
mkdirSync(FRAMES, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROME });
const context = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();

const shots = []; // { file, ms }
const beats = []; // { n, label, startMs, padHeadMs, narrationMs, totalMs }
let frameNo = 0;
let beatFrames = [];

/** One full-resolution still. `ms` is how long it holds in the cut. */
async function shoot(ms = MOTION_MS) {
  const file = join(FRAMES, `${String(frameNo++).padStart(4, "0")}.png`);
  await page.screenshot({ path: file });
  beatFrames.push({ file, ms });
  return file;
}

/**
 * Run a beat. Frames captured inside `work` play at 20fps as motion; the last
 * frame then holds for whatever the narration has left, so the beat always
 * ends exactly on its voice line.
 */
async function beat(n, label, work) {
  beatFrames = [];
  const total = PAD_HEAD + narrationMs(n) + PAD_TAIL;
  await work();
  if (beatFrames.length === 0) await shoot();

  const startMs = shots.reduce((a, x) => a + x.ms, 0);
  const motion = beatFrames.slice(0, -1).reduce((a, f) => a + f.ms, 0);
  const hold = Math.max(400, total - motion);
  beatFrames.forEach((f, i) => {
    shots.push({ file: f.file, ms: i === beatFrames.length - 1 ? hold : f.ms });
  });
  // The real total, which can exceed the narration when a beat has more
  // movement than its line has room for. build.py times the audio from this.
  beats.push({
    n, label, startMs,
    padHeadMs: PAD_HEAD,
    narrationMs: narrationMs(n),
    totalMs: motion + hold,
  });
  console.log(`  beat ${n} ${label} — ${beatFrames.length} frames, ${(total / 1000).toFixed(1)}s`);
}

/** Scroll an element in steps, photographing each one. */
async function pan(selector, toRatio, steps = 36) {
  for (let i = 1; i <= steps; i++) {
    const p = i / steps;
    const e = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
    await page.evaluate(
      ([sel, ratio]) => {
        const el = document.querySelector(sel);
        if (el) el.scrollTop = (el.scrollHeight - el.clientHeight) * ratio;
      },
      [selector, toRatio * e],
    );
    await shoot();
  }
}

console.log(`capturing ${SITE}`);
await page.goto(SITE, { waitUntil: "networkidle" });
await page.waitForSelector(".pool .champ");
await sleep(700);

// 1 — the problem, on an untouched board
await beat(0, "empty board", async () => {
  await shoot(3200);
  // The narration says "on a thirty second timer". Start one, and let it run
  // at real speed, rather than holding a dead frame for thirteen seconds.
  await page.getByRole("button", { name: "Start clock" }).click();
  for (let i = 0; i < 9; i++) {
    await sleep(800);
    await shoot(800);
  }
});

// 2 — load a real series
await beat(1, "load the demo", async () => {
  await page.evaluate(() => document.querySelector(".pool").scrollTop = 0);
  await shoot();
  await page.getByRole("button", { name: "Load a demo series" }).click();
  await page.waitForFunction(() => document.querySelectorAll(".pool .burn").length > 20);
  await sleep(250);
  await shoot();
});

// 3 — the burned pool: the product's whole argument
await beat(2, "burned champions", async () => {
  // The pool fits on one 1080p screen, so there is nothing to scroll. Push in
  // instead, with a transform rather than a zoom so the grid does not reflow,
  // until the strikethroughs and the game chips are plainly readable.
  await shoot(700);
  // A transformed element paints over its siblings and escapes its parent's
  // box, so without these two lines the magnified grid covers the side rails
  // and the controls show through it. Clip to the centre column, and make the
  // pool opaque.
  await page.evaluate(() => {
    document.querySelector(".centre").style.overflow = "hidden";
    const el = document.querySelector(".pool");
    el.style.background = "var(--ground)";
    // later siblings paint above a transformed element, so the controls row
    // below shows through the magnified grid without this
    el.style.position = "relative";
    el.style.zIndex = "5";
    el.style.transformOrigin = "6% 10%";
  });
  for (let i = 1; i <= 26; i++) {
    const z = 1 + 0.9 * (i / 26);
    await page.evaluate((scale) => {
      document.querySelector(".pool").style.transform = `scale(${scale})`;
    }, z);
    await shoot(70);
  }
  await shoot(700);
});

// 4 — ask the advisor
await beat(3, "ask the advisor", async () => {
  for (let i = 26; i >= 0; i--) {
    await page.evaluate((scale) => {
      document.querySelector(".pool").style.transform = `scale(${scale})`;
    }, 1 + 0.9 * (i / 26));
    if (i % 2 === 0) await shoot(40);
  }
  await page.evaluate(() => {
    document.querySelector(".centre").style.overflow = "";
    const el = document.querySelector(".pool");
    el.style.background = "";
    el.style.transform = "";
    el.style.position = "";
    el.style.zIndex = "";
  });
  await page.getByRole("button", { name: "Ask the advisor" }).click();
  await page.waitForSelector(".suggestion");
  await sleep(300);
  await shoot();
});

// 5 — four of five refused
await beat(4, "blocked count", async () => {
  await page.locator(".advisor").scrollIntoViewIfNeeded();
  await shoot();
});

// 6 — the reason stays on screen
await beat(5, "the reason", async () => {
  await page.locator('.suggestion[data-legal="false"]').first().scrollIntoViewIfNeeded();
  await shoot();
});

// 7 — type to search, enter to lock
await beat(6, "type to lock", async () => {
  const search = page.getByLabel("Search champions");
  await search.click();
  await shoot();
  for (const ch of "amb") {
    await search.press(ch);
    await sleep(120);
    await shoot();
    await shoot();
  }
  await search.press("Enter");
  await page.waitForTimeout(450);
  await shoot();
});

// 8 — export, reload, import
await beat(7, "export and import", async () => {
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export series" }).click();
  const saved = join(FRAMES, "..", "series.json");
  await (await download).saveAs(saved);
  await shoot();

  await page.reload({ waitUntil: "networkidle" });
  await page.waitForSelector(".pool .champ");
  await sleep(400);
  await shoot();

  await page.setInputFiles('input[type="file"]', saved);
  await page.waitForFunction(() => document.querySelectorAll(".pool .burn").length > 20);
  await sleep(400);
  await shoot();
});

// 9 — the measured numbers, on GitHub, where a judge can check them
await beat(8, "results on github", async () => {
  await page.goto(REPO_RESULTS, { waitUntil: "domcontentloaded" });
  await sleep(2200);
  await shoot();
  for (let i = 1; i <= 16; i++) {
    await page.evaluate((y) => window.scrollTo(0, y), i * 34);
    await shoot();
  }
});

await context.close();
await browser.close();

writeFileSync("video/shots.json", JSON.stringify({ shots, beats }, null, 1));
const total = shots.reduce((a, s) => a + s.ms, 0);
console.log(`\n${shots.length} frames, ${(total / 1000).toFixed(1)}s -> video/shots.json`);
