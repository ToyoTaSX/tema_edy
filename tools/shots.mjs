// Скриншоты 11 тестовых экранов (STANDARTS.md п. 2) → tests/shots/
// Запуск: npm run build && npm run shots   (поднимает vite preview сам)
import fs from 'node:fs';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

export const SCREENS = [
  ['01-mobile-s', 320, 568],
  ['02-mobile-m-android', 360, 800],
  ['03-mobile-m-iphone', 390, 844],
  ['04-mobile-l', 430, 932],
  ['05-mobile-landscape', 844, 390],
  ['06-tablet', 768, 1024],
  ['07-tablet-l', 1180, 820],
  ['08-desktop-s', 1366, 768],
  ['09-desktop-m', 1440, 900],
  ['10-desktop-l', 1920, 1080],
  ['11-desktop-xl', 2560, 1440],
];

const only = process.argv.slice(2);
const port = 4174;
const server = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 2500));
fs.mkdirSync('tests/shots', { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const issues = [];
try {
  for (const [name, w, h] of SCREENS) {
    if (only.length && !only.some((o) => name.includes(o))) continue;
    const mobile = w < 768;
    const ctx = await browser.newContext({
      viewport: { width: w, height: h },
      deviceScaleFactor: 1,
      isMobile: mobile,
      hasTouch: mobile,
    });
    const page = await ctx.newPage();
    await page.goto(`http://localhost:${port}/`, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `tests/shots/${name}-first.png` });
    // прокрутка до конца, чтобы подгрузились ленивые фото, и обратно
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.8) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      scrollTo(0, 0);
    });
    await page.waitForLoadState('networkidle');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (overflow > 0) issues.push(`${name}: горизонтальный скролл ${overflow}px`);
    await page.screenshot({ path: `tests/shots/${name}-full.png`, fullPage: true });
    await ctx.close();
  }
} finally {
  await browser.close();
  server.kill();
}
console.log(issues.length ? issues.join('\n') : 'Горизонтального скролла нет ни на одном экране');
