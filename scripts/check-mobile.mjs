/**
 * Mobile regression check.
 *
 * Drives the production build on emulated Android devices with real touch input. This exists
 * because unit tests and a desktop playthrough both passed while the game was completely
 * unplayable on a phone: input was keyboard-only, so nothing moved the turtle.
 *
 * Usage: npm run test:mobile
 */
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { chromium, devices } from 'playwright';

const PORT = Number(process.env.PORT ?? 4183);
const URL = `http://127.0.0.1:${PORT}/`;
const DEVICES = ['Pixel 5', 'Galaxy S9+'];

const failures = [];
const check = (device, label, ok, detail = '') => {
  console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures.push(`${device}: ${label}${detail ? ` (${detail})` : ''}`);
};

async function waitForServer(url, timeoutMs = 30000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url);
      if (response.ok) return;
    } catch {
      // Server not up yet.
    }
    await sleep(250);
  }
  throw new Error(`Preview server never became reachable at ${url}`);
}

/** Horizontal position of the turtle as a fraction of canvas width, read from rendered pixels. */
const turtleFraction = (page) =>
  page.evaluate(() => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let sum = 0;
    let count = 0;
    for (let y = Math.floor(height * 0.82); y < height; y += 2) {
      for (let x = 0; x < width; x += 2) {
        const i = (y * width + x) * 4;
        if (data[i] < 150 && data[i + 1] > 140 && data[i + 2] < 150) {
          sum += x;
          count++;
        }
      }
    }
    return count ? sum / count / width : null;
  });

/** Press and hold one side of the board, the way a thumb would, then release. */
const holdSide = async (page, side, ms) => {
  await page.evaluate(
    ([whichSide]) => {
      const canvas = document.getElementById('gameCanvas');
      const rect = canvas.getBoundingClientRect();
      const x = whichSide === 'left' ? rect.left + rect.width * 0.2 : rect.left + rect.width * 0.8;
      canvas.dispatchEvent(
        new PointerEvent('pointerdown', {
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: rect.top + rect.height * 0.5,
          pointerId: 1,
          pointerType: 'touch',
        })
      );
    },
    [side]
  );
  await page.waitForTimeout(ms);
  await page.evaluate(() => {
    document
      .getElementById('gameCanvas')
      .dispatchEvent(new PointerEvent('pointerup', { bubbles: true, pointerId: 1 }));
  });
};

const server = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['vite', 'preview', '--port', String(PORT), '--strictPort'],
  { stdio: 'ignore' }
);

let browser;
try {
  await waitForServer(URL);
  browser = await chromium.launch();

  for (const name of DEVICES) {
    console.log(`\n${name}`);
    const context = await browser.newContext({ ...devices[name] });
    const page = await context.newPage();

    const errors = [];
    page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));

    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    const layout = await page.evaluate(() => {
      const canvas = document.getElementById('gameCanvas');
      const rect = canvas.getBoundingClientRect();
      return {
        dpr: window.devicePixelRatio,
        cssWidth: rect.width,
        cssHeight: rect.height,
        backingWidth: canvas.width,
        touchAction: getComputedStyle(canvas).touchAction,
        keyHintShown: getComputedStyle(document.querySelector('.hint-keys')).display !== 'none',
        overflows: document.documentElement.scrollWidth > window.innerWidth,
      };
    });

    check(name, 'no horizontal overflow', !layout.overflows);
    check(
      name,
      'canvas keeps 4:3',
      Math.abs(layout.cssWidth / layout.cssHeight - 4 / 3) < 0.02,
      `${Math.round(layout.cssWidth)}x${Math.round(layout.cssHeight)}`
    );
    check(
      name,
      'backing store matches devicePixelRatio',
      Math.abs(layout.backingWidth - layout.cssWidth * layout.dpr) < 2,
      `${layout.backingWidth}px @ dpr ${layout.dpr}`
    );
    check(name, 'canvas opts out of browser gestures', layout.touchAction === 'none');
    check(name, 'keyboard-only hints hidden on touch', !layout.keyHintShown);

    // Steering must follow the side pressed, not the finger's absolute position.
    const start = await turtleFraction(page);

    await holdSide(page, 'right', 1200);
    const afterRight = await turtleFraction(page);
    check(
      name,
      'holding the RIGHT side moves the turtle right',
      start !== null && afterRight > start + 0.05,
      `${start?.toFixed(2)} -> ${afterRight?.toFixed(2)}`
    );

    await holdSide(page, 'left', 1600);
    const afterLeft = await turtleFraction(page);
    check(
      name,
      'holding the LEFT side moves the turtle left',
      afterLeft !== null && afterLeft < afterRight - 0.05,
      `${afterRight?.toFixed(2)} -> ${afterLeft?.toFixed(2)}`
    );

    // A press on the left half must steer left even though the finger sits right of the turtle.
    await holdSide(page, 'left', 900);
    const stillLeft = await turtleFraction(page);
    check(
      name,
      'direction follows the side pressed, not the finger position',
      stillLeft !== null && stillLeft <= afterLeft + 0.02,
      `${afterLeft?.toFixed(2)} -> ${stillLeft?.toFixed(2)}`
    );

    await page.waitForTimeout(200);
    const idle = await turtleFraction(page);
    await page.waitForTimeout(600);
    const stillIdle = await turtleFraction(page);
    check(
      name,
      'turtle stops when the press is released',
      idle !== null && Math.abs(stillIdle - idle) < 0.01
    );

    const pauseBefore = await page.locator('#pauseButton').textContent();
    await page.locator('#pauseButton').tap();
    await page.waitForTimeout(250);
    const pauseAfter = await page.locator('#pauseButton').textContent();
    check(
      name,
      'pause button toggles',
      pauseBefore !== pauseAfter,
      `${pauseBefore} -> ${pauseAfter}`
    );
    await page.locator('#pauseButton').tap();

    await page.locator('#restartButton').tap();
    await page.waitForTimeout(250);
    check(
      name,
      'restart button resets lives',
      (await page.locator('#lives').textContent()) === '3'
    );

    check(name, 'no console or page errors', errors.length === 0, errors.join(' | '));

    await context.close();
  }
} finally {
  await browser?.close();
  server.kill();
}

if (failures.length) {
  console.error(`\n${failures.length} mobile check(s) failed:`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log('\nAll mobile checks passed.');
