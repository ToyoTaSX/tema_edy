// Функциональные проверки (STANDARTS.md п. 17.2 «Функциональность») на собранном сайте
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const port = 4177;
const url = `http://localhost:${port}/`;
const server = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 2500));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
const results = [];
const check = (name, ok, extra = '') =>
  results.push(`${ok ? '✓' : '✗'} ${name}${extra ? ' — ' + extra : ''}`);

try {
  // --- Mobile 390
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(url, { waitUntil: 'networkidle' });

  // Первый экран: H1, кнопка звонка и статус видны без прокрутки (п. 10.3)
  for (const [w, h] of [
    [360, 640],
    [320, 568],
  ]) {
    await page.setViewportSize({ width: w, height: h });
    const vis = await page.evaluate(() =>
      ['.hero__title', '.hero__actions .button--primary', '[data-status]'].map((s) => {
        const r = document.querySelector(s).getBoundingClientRect();
        return r.bottom <= innerHeight;
      }),
    );
    check(`Первый экран ${w}×${h}: H1, «Позвонить», статус видны`, vis.every(Boolean), JSON.stringify(vis));
  }
  await page.setViewportSize({ width: 390, height: 844 });

  // Бургер
  await page.click('[data-burger]');
  check(
    'Бургер открывает меню',
    await page.locator('[data-nav]').evaluate((n) => n.classList.contains('nav--open')),
  );
  check('aria-expanded = true', (await page.getAttribute('[data-burger]', 'aria-expanded')) === 'true');
  await page.keyboard.press('Escape');
  check(
    'Esc закрывает меню и возвращает фокус на бургер',
    await page.evaluate(
      () =>
        !document.querySelector('[data-nav]').classList.contains('nav--open') &&
        document.activeElement.matches('[data-burger]'),
    ),
  );

  // Якорь категории раскрывает аккордеон
  await page.click('a.cats__link[href="#menu-pizza"]');
  await page.waitForTimeout(600);
  check(
    'Иконка «Пицца» раскрывает категорию',
    await page.evaluate(() => document.getElementById('menu-pizza').open),
  );
  check(
    'Категория не под липкой шапкой',
    await page.evaluate(() => document.getElementById('menu-pizza').getBoundingClientRect().top >= 0),
  );

  // Лайтбокс
  const btn = page.locator('#menu-pizza [data-lightbox]').first();
  await btn.click();
  check(
    'Лайтбокс открывается',
    await page.evaluate(() => document.querySelector('[data-lightbox-dialog]').open),
  );
  check(
    'В лайтбоксе фото 480 и подпись',
    await page.evaluate(
      () =>
        /-480\.webp$/.test(document.querySelector('.lightbox__img').src) &&
        !!document.querySelector('[data-lightbox-caption]').textContent,
    ),
  );
  await page.keyboard.press('Escape');
  await page.waitForTimeout(100);
  check(
    'Esc закрывает лайтбокс, фокус возвращается на фото',
    await page.evaluate(
      () =>
        !document.querySelector('[data-lightbox-dialog]').open &&
        document.activeElement.matches('[data-lightbox]'),
    ),
  );

  // Отзывы
  const hiddenBefore = await page.locator('[data-review-extra][hidden]').count();
  await page.click('[data-reviews-more]');
  const hiddenAfter = await page.locator('[data-review-extra][hidden]').count();
  check(
    '«Ещё отзывы» показывает скрытые отзывы',
    hiddenBefore > 0 && hiddenAfter === 0,
    `${hiddenBefore} → ${hiddenAfter}`,
  );

  // Плавающая кнопка
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(800);
  const fabTop = await page.locator('[data-fab]').evaluate((f) => f.classList.contains('fab--visible'));
  await page.evaluate(() => document.getElementById('delivery').scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(800);
  const fabMid = await page.locator('[data-fab]').evaluate((f) => f.classList.contains('fab--visible'));
  await page.evaluate(() => document.getElementById('contacts').scrollIntoView({ behavior: 'instant' }));
  await page.waitForTimeout(800);
  const fabEnd = await page.locator('[data-fab]').evaluate((f) => f.classList.contains('fab--visible'));
  check(
    'Плавающая кнопка: скрыта на 1-м экране, видна в середине, скрыта у контактов',
    !fabTop && fabMid && !fabEnd,
    `${fabTop}/${fabMid}/${fabEnd}`,
  );

  // Все tel: ведут на основной номер
  const tels = await page.$$eval('a[href^="tel:"]', (as) => [
    ...new Set(as.map((a) => a.getAttribute('href'))),
  ]);
  check(
    'Кнопки звонка: основной номер (+ дополнительный только в контактах)',
    tels.length === 2 && tels.includes('tel:+79925004030'),
    tels.join(', '),
  );

  // Карта по клику
  await page.click('[data-map-load]');
  check(
    '«Показать карту» вставляет iframe Яндекс Карт',
    (await page.locator('[data-map] iframe').count()) === 1,
  );

  // Меню дня — кнопка есть, скрипт ВК заранее не грузится
  const vkBefore = await page.evaluate(() => !!document.querySelector('script[src*="vk.com/js/api"]'));
  check('Скрипт ВК не загружается до клика', !vkBefore);
  check('Кнопка «Показать меню на сегодня» видна', await page.locator('[data-lunch-today]').isVisible());

  check('Нет ошибок JS в консоли', errors.length === 0, errors.join(' | '));
  await ctx.close();

  // --- Статус открыто/закрыто (часовой пояс кафе UTC+5)
  const cases = [
    ['2026-10-12T08:30:00+05:00', 'Закрыто · откроемся сегодня в 9:00'], // пн утро
    ['2026-10-12T12:00:00+05:00', 'Открыто до 21:00'], // пн день
    ['2026-10-12T21:30:00+05:00', 'Закрыто · откроемся завтра в 9:00'], // пн вечер
    ['2026-10-10T09:30:00+05:00', 'Закрыто · откроемся сегодня в 10:00'], // сб утро
    ['2026-10-09T22:00:00+05:00', 'Закрыто · откроемся завтра в 10:00'], // пт вечер → сб
  ];
  const ctx2 = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const p2 = await ctx2.newPage();
  for (const [iso, expected] of cases) {
    await p2.goto(`${url}?now=${encodeURIComponent(iso)}`);
    const t = await p2.textContent('[data-status] .status__text');
    check(`Статус ${iso}`, t === expected, `«${t}»`);
  }
  // Desktop: все категории раскрыты, на кнопке звонка — номер
  await p2.goto(url);
  check(
    'Desktop: все категории меню раскрыты',
    await p2.evaluate(() => [...document.querySelectorAll('.menu-cat')].every((d) => d.open)),
  );
  check('Desktop: номер на кнопке в шапке', await p2.locator('.header__call-full').isVisible());
  await ctx2.close();

  // --- Без JS
  const ctx3 = await browser.newContext({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  const p3 = await ctx3.newPage();
  await p3.goto(url);
  const nojs = await p3.evaluate(() => ({
    dishes: document.querySelectorAll('.dish').length,
    nav: getComputedStyle(document.querySelector('.nav')).visibility,
    phone: !!document.querySelector('a[href="tel:+79925004030"]'),
    reviews: document.querySelectorAll('.review').length,
  }));
  check(
    'Без JS: 95 блюд в разметке, навигация и телефон доступны, все отзывы видны',
    nojs.dishes === 95 && nojs.nav === 'visible' && nojs.phone && nojs.reviews >= 5,
    JSON.stringify(nojs),
  );
  await ctx3.close();
} finally {
  await browser.close();
  server.kill();
}
console.log(results.join('\n'));
process.exit(results.some((r) => r.startsWith('✗')) ? 1 : 0);
