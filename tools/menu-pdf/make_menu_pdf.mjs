// Генерация PDF-меню «Тема еды» из content/menu.json + content/cafe.json
// Запуск: node make_menu_pdf.mjs <content_dir> <out.pdf> [<images_dir>]
// Пример из корня проекта: node tools/menu-pdf/make_menu_pdf.mjs content public/menu/tema-edy-menu.pdf public/images/menu
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from 'playwright';

const contentDir = path.resolve(process.argv[2] || '../../content');
export function sourceHash(dir) {
  const h = crypto.createHash('sha256');
  for (const f of ['menu.json', 'cafe.json']) h.update(fs.readFileSync(path.join(dir, f)));
  return h.digest('hex');
}
const outPdf = path.resolve(process.argv[3] || 'tema-edy-menu.pdf');
const menu = JSON.parse(fs.readFileSync(path.join(contentDir, 'menu.json'), 'utf8'));
const cafe = JSON.parse(fs.readFileSync(path.join(contentDir, 'cafe.json'), 'utf8'));

const fontDir = path.resolve('node_modules/@fontsource-variable');
const font = (fam, file) => `url("file://${fontDir}/${fam}/files/${file}") format("woff2")`;
const ff = (name, fam, w) =>
  ['latin', 'cyrillic']
    .map(
      (sub) => `
@font-face{font-family:"${name}";font-style:normal;font-weight:${w};font-display:block;
src:${font(fam, `${fam}-${sub}-wght-normal.woff2`)};}`,
    )
    .join('');

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
const nb = (s) =>
  esc(s)
    .replace(/ (в|и|с|к|о|у|на|по|из|за|от|до|не|или|а) /gi, ' $1&nbsp;')
    .replace(/(\d) (г|гр|см|шт|мл|л|₽|кг)\b/g, '$1&nbsp;$2');
const date = menu.updated.split('-').reverse().join('.');
const phones = cafe.phones.map((p) => p.display);
const L = cafe.business_lunch;
// Фото: те же файлы, что на сайте (public/images/menu/{id}-160.webp)
const imgDir = path.resolve(process.argv[4] || '../../public/images/menu');
const thumbCache = {};
const thumb = (id) => {
  const f = path.join(imgDir, id + '-160.webp');
  if (!fs.existsSync(f)) return null;
  return (thumbCache[id] ??= 'data:image/webp;base64,' + fs.readFileSync(f).toString('base64'));
};

const itemHtml = (it) => {
  const badges = [];
  if (it.preorder) badges.push('<span class="badge">предзаказ</span>');
  const unit = it.price_unit ? `<small>${esc(it.price_unit)}</small>` : '';
  const meta = [
    it.portion ? `<span class="portion">${nb(it.portion)}</span>` : '',
    it.composition ? nb(it.composition) : '',
  ]
    .filter(Boolean)
    .join(' · ');
  const t = thumb(it.id);
  return `<div class="item${t ? ' has-thumb' : ''}">
    ${t ? `<img class="thumb" src="${t}" alt="">` : ''}
    <div class="body"><div class="row"><span class="name">${nb(it.name)}${badges.join('')}</span><span class="dots"></span><span class="price">${it.price}&nbsp;₽${unit}</span></div>
    ${meta ? `<div class="meta">${meta}</div>` : ''}</div>
  </div>`;
};

const cats = menu.categories.filter((c) => c.id !== 'lunch' && c.count > 0);
const sections = cats
  .map((c) => {
    const items = menu.items.filter((i) => i.category === c.id);
    return `<section class="cat"><h2>${esc(c.title)}</h2>${items.map(itemHtml).join('')}</section>`;
  })
  .join('');

const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><title>Меню кафе «Тема еды»</title>
<style>
${ff('Oswald', 'oswald', '200 700')}${ff('Manrope', 'manrope', '200 800')}${ff('Caveat', 'caveat', '400 700')}
:root{--bg:#FBF3EA;--alt:#F4E6D6;--text:#3B2716;--muted:#6E5643;--brand:#8A5A33;--brand-l:#B08560;
--accent:#B4441F;--gold:#D9A441;--dark:#2E1F12;--on-dark:#FBF3EA;--on-dark-m:#CDB9A3;--border:#E8D7C3;--green:#4D6B35}
@page{size:A4;margin:12mm 0 16mm}
*{box-sizing:border-box}
html{background:var(--bg);-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0;padding:0 13mm;font:400 9.4pt/1.38 Manrope,sans-serif;color:var(--text)}
.nw{white-space:nowrap}
h1,h2,h3{font-family:Oswald,sans-serif;text-transform:uppercase;margin:0;font-weight:600;letter-spacing:.01em}
.head{text-align:center;padding:2mm 0 4mm}
.hand{font-family:Caveat,cursive;font-weight:600;color:var(--brand);font-size:17pt;line-height:1}
.head h1{font-size:46pt;line-height:1;font-weight:700;letter-spacing:.02em;margin:1mm 0 0}
.divider{display:flex;align-items:center;justify-content:center;gap:3mm;color:var(--brand-l);margin:2.5mm auto}
.divider:before,.divider:after{content:"";width:28mm;height:.6pt;background:var(--brand-l)}
.divider i{font-style:normal;font-size:7pt}
.info{font-size:9pt;color:var(--muted)}
.info b{color:var(--text);font-weight:700}
.lunch{background:var(--dark);color:var(--on-dark);border-radius:5mm;padding:5mm 6mm;margin:3mm 0 6mm;
 display:grid;grid-template-columns:30mm 1fr auto;gap:2mm 8mm;align-items:center;break-inside:avoid;
 background-image:radial-gradient(60% 70% at 85% 120%,rgba(180,68,31,.45),transparent 70%)}
.lunch h2{font-size:20pt;color:var(--on-dark)}
.lunch .hand{color:var(--gold);font-size:15pt}
.lunch p{margin:1.5mm 0 0;color:var(--on-dark-m);font-size:8.8pt}
.lunch p b{color:var(--on-dark)}
.lunch-photo{width:30mm;height:30mm;border-radius:50%;object-fit:cover;box-shadow:0 0 0 1.2pt var(--brand-l)}
.prices{display:flex;gap:6mm;text-align:center}
.prices div{font-family:Oswald;font-size:26pt;line-height:1;color:var(--gold);font-weight:600}
.prices span{display:block;font-family:Manrope;font-size:7.5pt;color:var(--on-dark-m);text-transform:none;margin-top:1mm;font-weight:500}
.cols{column-count:2;column-gap:9mm}
.cat{margin:0 0 4mm}
.cat h2{font-size:15pt;color:var(--brand);padding-bottom:1.2mm;margin-bottom:2mm;border-bottom:.8pt solid var(--brand-l);break-after:avoid}
.item{break-inside:avoid;margin:0 0 2.1mm}
.item.has-thumb{display:grid;grid-template-columns:13mm 1fr;gap:2.6mm;align-items:start}
.thumb{width:13mm;height:13mm;border-radius:50%;object-fit:cover;box-shadow:0 0 0 .7pt var(--border),0 .6mm 1.2mm rgba(59,39,22,.18)}
.body{min-width:0}
.row{display:flex;align-items:baseline;gap:1.5mm}
.name{font-weight:700;font-size:9.6pt}
.dots{flex:1;border-bottom:.8pt dotted var(--brand-l);transform:translateY(-1mm);min-width:4mm}
.price{font-weight:800;white-space:nowrap;font-variant-numeric:tabular-nums}
.price small{font-weight:500;color:var(--muted);font-size:7.5pt;margin-left:1mm}
.meta{color:var(--muted);font-size:8.2pt;line-height:1.32;margin-top:.4mm;padding-right:6mm}
.portion{color:var(--brand);font-weight:600}
.badge{display:inline-block;font-size:6.6pt;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--brand);
 border:.7pt solid var(--brand);border-radius:9pt;padding:0 1.6mm;margin-left:1.5mm;vertical-align:1.2pt}
.back{break-inside:avoid;margin-top:2mm;display:grid;grid-template-columns:1fr 1fr;gap:5mm}
.card{background:var(--alt);border-radius:4mm;padding:3mm 4.5mm}
.card h3{font-size:12.5pt;color:var(--text);margin-bottom:1.5mm}
.card p{margin:0 0 1mm;font-size:8.8pt}
.card.dark{background:var(--dark);color:var(--on-dark)}
.card.dark h3{color:var(--gold)}
.card.dark p{color:var(--on-dark-m)}
.note{text-align:center;color:var(--muted);font-size:7.8pt;margin-top:4mm}
.foot{position:fixed;bottom:-13mm;left:0;right:0;display:flex;justify-content:space-between;align-items:center;
 font-size:7.6pt;color:var(--muted);border-top:.6pt solid var(--border);padding-top:2mm}
.foot b{color:var(--text);font-family:Oswald;font-weight:600;font-size:9pt;letter-spacing:.03em}
</style></head><body>

<header class="head">
  <div class="hand">кафе-ресторан в Верхнем Уфалее</div>
  <h1>Тема еды</h1>
  <div class="divider"><i>◆</i></div>
  <div class="info"><b>${esc(cafe.address)}</b> (${esc(cafe.address_landmark)}) · будни ${esc(cafe.hours.weekdays)}, сб–вс ${esc(cafe.hours.weekends)}<br>
  Заказ, доставка и бронь: <b>${phones.join('</b> · <b>')}</b> · vk.ru/club99941253</div>
</header>

<section class="lunch">
  ${thumb('5643531') ? `<img class="lunch-photo" src="${thumb('5643531')}" alt="">` : '<div></div>'}
  <div>
    <div class="hand">каждый день новое меню</div>
    <h2>Бизнес-ланч</h2>
    <p><b>Первое + горячее с гарниром + салат</b>, хлеб и чай. Меню дня — в нашей группе ВКонтакте.</p>
    <p>Предзаказ: с вечера до 21:00 или утром <span class=nw>9:00–10:30</span>. ПП-обед — <b>${L.pp_lunch.price}&nbsp;₽</b>.<br>
    Блюда комплекса можно заказать отдельно: первые <span class=nw>190–220&nbsp;₽</span>, вторые <span class=nw>210–220&nbsp;₽</span>, салаты <span class=nw>170–190&nbsp;₽</span>.</p>
  </div>
  <div class="prices"><div>${L.price_cafe}&nbsp;₽<span>в кафе</span></div><div>${L.price_delivery}&nbsp;₽<span>с доставкой</span></div></div>
</section>

<main class="cols">${sections}</main>

<div class="back">
  <div class="card"><h3>Доставка</h3>
    <p><b>Бесплатно</b> при заказе от ${cafe.delivery.free_from}&nbsp;₽, до ${cafe.delivery.free_from}&nbsp;₽ — ${cafe.delivery.fee_below_free}&nbsp;₽.</p>
    <p>Приём заказов ${esc(cafe.hours.orders)} по телефонам: <b>${phones.join(', ')}</b>.</p>
    <p>В выходные при большой загрузке доставка может занять больше времени — уточняйте у оператора.</p></div>
  <div class="card dark"><h3>Банкеты до ${cafe.banquets.capacity_max} гостей</h3>
    <p>Юбилеи, дни рождения, свадьбы, корпоративы, поминальные обеды. Фирменное банкетное меню, режим работы можно продлить.</p>
    <p>Обсудить дату и меню: <b style="color:var(--on-dark)">${phones[0]}</b></p></div>
</div>
<p class="note">Меню актуально на ${date}. ${esc(menu.disclaimer)}</p>
</body></html>`;

const tmpHtml = path.join(os.tmpdir(), 'tema-edy-menu.html');
fs.writeFileSync(tmpHtml, html);
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const page = await browser.newPage();
await page.goto('file://' + tmpHtml, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);
// WebP встраивается в PDF без сжатия — перекодируем фото в JPEG (размер x2 для чёткости печати)
await page.evaluate(async () => {
  const imgs = [...document.querySelectorAll('img')];
  await Promise.all(
    imgs.map((i) =>
      i.complete
        ? null
        : new Promise((r) => {
            i.onload = i.onerror = r;
          }),
    ),
  );
  for (const i of imgs) {
    const px = Math.round(i.getBoundingClientRect().width * 2.2);
    const c = document.createElement('canvas');
    c.width = c.height = px;
    const x = c.getContext('2d');
    x.fillStyle = '#FBF3EA';
    x.fillRect(0, 0, px, px);
    x.drawImage(i, 0, 0, px, px);
    i.src = c.toDataURL('image/jpeg', 0.78);
  }
  await Promise.all(imgs.map((i) => i.decode()));
});
const box = (h, inner) =>
  `<div style="-webkit-print-color-adjust:exact;print-color-adjust:exact;background:#FBF3EA;width:100%;height:${h};margin:0;padding:0 13mm;box-sizing:border-box;font-family:Arial,sans-serif;font-size:7.5pt;color:#6E5643;display:flex;align-items:center;justify-content:space-between">${inner}</div>`;
await page.pdf({
  path: outPdf,
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: true,
  tagged: true,
  displayHeaderFooter: true,
  headerTemplate:
    `<style>html,body{margin:0!important;padding:0!important}#header{padding:0!important}</style>` +
    box(
      '12mm',
      cafe.site?.demo?.enabled
        ? '<span style="flex:1;text-align:right;color:#B4441F">Учебный проект для портфолио · не официальное меню кафе</span>'
        : '',
    ),
  footerTemplate:
    `<style>html,body{margin:0!important;padding:0!important}#footer{padding:0!important}</style>` +
    box(
      '16mm',
      `<span style="border-top:.6pt solid #E8D7C3;padding-top:2mm;flex:1;display:flex;justify-content:space-between"><span><b style="color:#3B2716">ТЕМА ЕДЫ</b> · ${esc(cafe.city)}, ${esc(cafe.address)} · заказ и бронь: <b style="color:#3B2716">${phones.join(' · ')}</b></span><span>стр. <span class="pageNumber"></span> из <span class="totalPages"></span></span></span>`,
    ),
});
await browser.close();
// Отпечаток исходных данных — по нему CI проверяет, что PDF не устарел (tools/check-pdf.mjs)
fs.writeFileSync(outPdf.replace(/\.pdf$/, '.source.sha256'), sourceHash(contentDir) + '\n');
console.log('OK', outPdf, (fs.statSync(outPdf).size / 1024).toFixed(0) + ' KB');
