// Картинка для превью ссылок (Open Graph) 1200×630 → public/og-image.jpg
// Запуск: node tools/og-image.mjs
import fs from 'node:fs';
import { chromium } from 'playwright';

const b64 = (f) => fs.readFileSync(f).toString('base64');
const font = (f) => `url(data:font/woff2;base64,${b64(f)}) format('woff2')`;
const logo = fs.readFileSync('brand/logo/tema-edy-full-caramel.svg', 'utf8');
const html = `<!doctype html><html><head><style>
@font-face{font-family:Oswald;font-weight:200 700;src:${font('src/fonts/oswald-cyrillic-wght-normal.woff2')}}
@font-face{font-family:Oswald;font-weight:200 700;src:${font('src/fonts/oswald-latin-wght-normal.woff2')};unicode-range:U+0000-00FF}
@font-face{font-family:Oswald;font-weight:200 700;src:${font('src/fonts/oswald-rub-wght-normal.woff2')};unicode-range:U+20BD}
@font-face{font-family:Manrope;font-weight:200 800;src:${font('src/fonts/manrope-cyrillic-wght-normal.woff2')}}
@font-face{font-family:Manrope;font-weight:200 800;src:${font('src/fonts/manrope-latin-wght-normal.woff2')};unicode-range:U+0000-00FF}
@font-face{font-family:Manrope;font-weight:200 800;src:${font('src/fonts/manrope-rub-wght-normal.woff2')};unicode-range:U+20BD}
body{margin:0;width:1200px;height:630px;background:#FBF3EA;font-family:Manrope;color:#3B2716;display:grid;grid-template-columns:560px 1fr;align-items:center;overflow:hidden}
.l{padding:0 0 0 72px}.logo svg{width:270px;height:auto}
h1{font:700 60px/1.02 Oswald;text-transform:uppercase;margin:26px 0 16px}
p{font-size:28px;line-height:1.35;margin:0;color:#6E5643}.p b{color:#B4441F}
.r{position:relative;height:630px}
.plate{position:absolute;border-radius:50%;overflow:hidden;box-shadow:0 0 0 10px #fff,0 0 0 11px #E8D7C3,0 20px 50px rgba(59,39,22,.25)}
.plate img{width:100%;height:100%;object-fit:cover}
.a{width:430px;height:430px;left:110px;top:60px}.b{width:220px;height:220px;left:20px;top:380px}
</style></head><body><div class="l"><div class="logo">${logo}</div><h1>Кафе в Верхнем Уфалее</h1>
<p class="p">Обед за <b>410&nbsp;₽</b> · пицца · шашлык<br>доставка · банкеты до 38 гостей</p></div>
<div class="r"><div class="plate a"><img src="data:image/webp;base64,${b64('public/images/hero/pizza-540.webp')}"></div>
<div class="plate b"><img src="data:image/webp;base64,${b64('public/images/menu/6281107-480.webp')}"></div></div></body></html>`;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/og-image.jpg', type: 'jpeg', quality: 85 });
await browser.close();
console.log('og-image.jpg', fs.statSync('public/og-image.jpg').size, 'bytes');
