// Генерация PNG-иконок из src/icons/logo-mark.svg → public/
// Запуск: node tools/favicons.mjs
import fs from 'node:fs';
import { chromium } from 'playwright';

const svg = fs.readFileSync('src/icons/logo-mark.svg', 'utf8');
const sizes = [
  { file: 'favicon-32.png', size: 32, bg: 'transparent', scale: 1 },
  { file: 'apple-touch-icon.png', size: 180, bg: '#FBF3EA', scale: 0.86 },
  { file: 'icon-192.png', size: 192, bg: 'transparent', scale: 1 },
  { file: 'icon-512.png', size: 512, bg: 'transparent', scale: 1 },
  { file: 'icon-maskable-512.png', size: 512, bg: '#8A5A33', scale: 0.8 },
];
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage();
for (const s of sizes) {
  await page.setViewportSize({ width: s.size, height: s.size });
  await page.setContent(
    `<html><body style="margin:0;background:${s.bg};display:grid;place-items:center;width:${s.size}px;height:${s.size}px">` +
      `<div style="width:${s.size * s.scale}px;height:${s.size * s.scale}px">${svg}</div></body></html>`,
  );
  await page.screenshot({ path: `public/${s.file}`, omitBackground: s.bg === 'transparent' });
}
await browser.close();
console.log('favicons:', sizes.map((s) => s.file).join(', '));
