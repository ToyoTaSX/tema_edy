// Vite-плагин: на этапе сборки читает content/*.json и подставляет HTML секций
// вместо маркеров <!-- @section:имя --> в index.html / privacy.html / 404.html.
// STANDARTS.md п. 10.5 (меню рендерится при сборке, работает без JS), PLAN.md этап 2.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');
const readJson = (f) => JSON.parse(fs.readFileSync(path.join(root, 'content', f), 'utf8'));

export function loadData() {
  const cafe = readJson('cafe.json');
  const menu = readJson('menu.json');
  const reviews = readJson('reviews.json');
  const photos = readJson('photos.json');
  return {
    cafe,
    menu,
    reviews,
    photos,
    env: { SITE_URL: process.env.SITE_URL || '', RELEASE: !!process.env.RELEASE },
  };
}

/** Проверка данных: сборка падает с понятной ошибкой, если что-то не так. */
export function validate(data, { release }) {
  const errors = [];
  const warnings = [];
  const { cafe, menu } = data;
  const main = cafe.phones.filter((p) => p.main);
  if (main.length !== 1) errors.push(`Основной телефон должен быть ровно один (сейчас ${main.length})`);
  for (const p of cafe.phones)
    if (!/^\+7\d{10}$/.test(p.e164)) errors.push(`Телефон ${p.display}: e164 должен быть +7XXXXXXXXXX`);
  const cats = new Set(menu.categories.map((c) => c.id));
  for (const it of menu.items) {
    if (!it.name) errors.push(`Блюдо ${it.id}: нет названия`);
    if (!(it.price > 0)) errors.push(`Блюдо ${it.id} «${it.name}»: нет цены`);
    if (!cats.has(it.category)) errors.push(`Блюдо ${it.id}: неизвестная категория ${it.category}`);
    if (!it.image) warnings.push(`Блюдо ${it.id} «${it.name}»: нет фото`);
    else if (!fs.existsSync(path.join(root, 'public', `${it.image.src}-160.webp`)))
      errors.push(`Блюдо ${it.id}: нет файла public/${it.image.src}-160.webp`);
  }
  if (cafe.legal?.placeholder) {
    const msg = 'Реквизиты в content/cafe.json — заглушка (legal.placeholder = true)';
    if (cafe.site?.demo?.enabled)
      warnings.push(`${msg}. Учебный режим (site.demo.enabled) — показываются с пометкой «демо-данные».`);
    else if (release) errors.push(`${msg}. Релизная сборка (RELEASE=1) запрещена до замены на настоящие.`);
    else warnings.push(`${msg}. В подвале будет пометка «реквизиты уточняются».`);
  }
  if (!data.env.SITE_URL)
    warnings.push('SITE_URL не задан — canonical, og:url и sitemap будут без абсолютного адреса.');
  return { errors, warnings };
}

export default function render() {
  let data;
  const partialsDir = path.join(root, 'src', 'partials');
  const load = async (name, bust) => {
    const url = pathToFileURL(path.join(partialsDir, `${name}.js`)).href + (bust ? `?t=${Date.now()}` : '');
    return (await import(url)).default;
  };
  let isDev = false;

  return {
    name: 'tema-edy-render',
    configResolved(cfg) {
      isDev = cfg.command === 'serve';
    },
    buildStart() {
      data = loadData();
      const { errors, warnings } = validate(data, { release: data.env.RELEASE });
      for (const w of warnings) this.warn(w);
      if (errors.length) this.error('Ошибки в данных content/:\n  - ' + errors.join('\n  - '));
    },
    transformIndexHtml: {
      order: 'pre',
      async handler(html) {
        if (isDev) data = loadData();
        const names = [...new Set([...html.matchAll(/<!-- @section:([a-z0-9-]+) -->/g)].map((m) => m[1]))];
        for (const n of names) {
          const fn = await load(n, isDev);
          html = html.replaceAll(`<!-- @section:${n} -->`, fn(data));
        }
        return html;
      },
    },
    generateBundle() {
      // robots.txt и sitemap.xml: абсолютный адрес берётся из SITE_URL (п. 14)
      // В учебном режиме сайт закрыт от индексации: это не официальный сайт кафе
      const demo = !!data.cafe.site?.demo?.enabled;
      const site = data.env.SITE_URL ? data.env.SITE_URL.replace(/\/?$/, '/') : '';
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: demo
          ? 'User-agent: *\nDisallow: /\n'
          : `User-agent: *\nAllow: /\n${site ? `Sitemap: ${site}sitemap.xml\n` : ''}`,
      });
      if (site && !demo) {
        const urls = [site, `${site}privacy.html`];
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source:
            '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
            urls
              .map((u) => `  <url><loc>${u}</loc><lastmod>${data.menu.updated}</lastmod></url>`)
              .join('\n') +
            '\n</urlset>\n',
        });
      }
    },
    configureServer(server) {
      const watch = [path.join(root, 'content'), partialsDir];
      server.watcher.add(watch);
      server.watcher.on('change', (f) => {
        if (watch.some((w) => f.startsWith(w))) server.ws.send({ type: 'full-reload' });
      });
    },
  };
}
