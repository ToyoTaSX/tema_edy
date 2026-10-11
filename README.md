# Кафе «Тема еды» — лендинг

Одностраничный сайт кафе «Тема еды» (г. Верхний Уфалей, ул. Гагарина, 3).
Статический сайт на Vite, публикуется на GitHub Pages через GitHub Actions.

- Стандарты вёрстки и дизайна — [`STANDARTS.md`](STANDARTS.md)
- План работ — [`PLAN.md`](PLAN.md)
- Данные сайта (меню, контакты, отзывы, фото) — [`content/`](content/README.md)

## Быстрый старт

Нужны Node.js 22+ и Python 3 (для пересборки меню из выгрузки ВК).

```bash
npm install
npx playwright install chromium   # один раз — для PDF-меню, скриншотов и тестов
npm run dev                        # http://localhost:5173 — правки видны сразу
```

## Команды

| Команда | Что делает |
|---|---|
| `npm run dev` | Локальный сервер разработки |
| `npm run build` | Сборка в `dist/` |
| `npm run preview` | Посмотреть собранный сайт |
| `npm run check` | Все проверки: линтеры, сборка, валидатор HTML, доступность (axe), функциональные тесты, свежесть PDF |
| `npm run lhci` | Lighthouse (после `npm run build`): Performance ≥ 90, Accessibility ≥ 95, LCP < 2,5 с, CLS < 0,1 |
| `npm run shots` | Скриншоты 11 тестовых экранов из стандарта → `tests/shots/` |
| `npm run menu:data` | Пересобрать `content/menu.json` из выгрузки ВК (`content/raw/`) |
| `npm run menu:pdf` | Пересобрать PDF-меню `public/menu/tema-edy-menu.pdf` |

## Первая публикация на GitHub Pages

1. Создайте **публичный** репозиторий `tema_edy` на GitHub (Pages на приватных — только на платных тарифах).
2. В папке проекта:
   ```bash
   git init -b main
   git add .
   git commit -m "Лендинг кафе «Тема еды»"
   git remote add origin https://github.com/<github-user>/tema_edy.git
   git push -u origin main
   ```
3. На GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
4. **Settings → Secrets and variables → Actions → Variables → New variable**:
   `SITE_URL` = `https://<github-user>.github.io/tema_edy/` — нужен для canonical, Open Graph, sitemap и страницы 404.
5. **Actions → Deploy to GitHub Pages → Run workflow** (или любой следующий push в `main`).
   Через 1–2 минуты сайт откроется по адресу `https://<github-user>.github.io/tema_edy/`.

Каждый push в `main` публикует тестовую версию. **Релиз** — тег `v*`:

```bash
git tag v1.0.0 && git push --tags
```

Релизная сборка (`RELEASE=1`) с реквизитами-заглушкой (`legal.placeholder: true`) проходит **только в учебном режиме**.

### Учебный режим

Это учебный проект для портфолио, а не официальный сайт кафе. В `content/cafe.json → site.demo.enabled: true`:

- вверху страницы и в подвале — пометка «Учебный проект, не официальный сайт кафе», в PDF-меню — в верхнем колонтитуле;
- `noindex, nofollow`, `robots.txt` с `Disallow: /`, без sitemap и JSON-LD — сайт не попадёт в поиск под видом сайта кафе;
- реквизиты-заглушки (нули) показываются с пометкой «демо-данные»;
- Lighthouse: категория SEO — предупреждение (из-за `noindex` она ≈ 0,69), остальные SEO-аудиты — обязательные.

Чтобы превратить в боевой сайт: внести реквизиты, `legal.placeholder: false`, `site.demo.enabled: false`, вернуть `categories:seo` в `error` в `lighthouserc.json`.

## Как обновлять сайт

| Что изменилось | Что сделать |
|---|---|
| Телефон, часы работы, цена ланча, условия доставки | Поправить `content/cafe.json` (можно прямо на github.com — карандаш «Edit») → коммит → сайт обновится сам. Затем `npm run menu:pdf`, если менялись данные, которые есть в PDF |
| Цены и блюда | Выгрузить товары из ВК в `content/raw/vk_market_ГГГГ-ММ-ДД.txt` → `npm run menu:data` → `npm run menu:pdf` → коммит. Или поправить `content/menu.json` вручную → `npm run menu:pdf` |
| Новое фото блюда | Положить `public/images/menu/{id}-160.webp` и `{id}-480.webp` (квадрат), отметить `kind: "real"` в `content/photos.json` → `npm run menu:data` → `npm run menu:pdf` |
| Меню дня бизнес-ланча | Ничего — сайт показывает свежие записи группы ВК по кнопке «Показать меню на сегодня» |
| Реквизиты | `content/cafe.json → legal`: заполнить, `"placeholder": false` и выключить учебный режим `site.demo.enabled` |
| Яндекс Метрика | `content/cafe.json → site.metrika_id`: номер счётчика. Включит Метрику, цели (звонок, ВК, PDF, маршрут) и cookie-плашку |

CI проверяет, что PDF-меню пересобрано после изменения `menu.json` / `cafe.json`, — иначе проверки упадут с подсказкой `npm run menu:pdf`.

## Структура

```
index.html, privacy.html, 404.html   каркасы страниц с маркерами <!-- @section:имя -->
build/render.mjs                     Vite-плагин: content/*.json → HTML при сборке (+ проверки данных, robots, sitemap)
src/partials/                        HTML секций (выполняются при сборке)
src/styles/                          tokens.css (дизайн-токены), base, layout, blocks/ (БЭМ)
src/scripts/                         ~10 КБ JS: меню-бургер, статус «открыто», лайтбокс, карта, виджет ВК, Метрика
src/fonts/                           Oswald, Manrope, Caveat — woff2, кириллица + латиница + ₽
public/                              фото, PDF-меню, иконки, og-image (копируются как есть)
brand/logo/                          логотип в SVG: полный, без подписи, знак — 3 цвета
tools/                               PDF-меню, скриншоты, axe, e2e, favicon, og-image, векторизация логотипа
content/                             данные кафе, меню, отзывы, фото
```

## Результаты проверок (11.10.2026)

- Lighthouse (mobile): **Performance 99 · Accessibility 100 · Best Practices 100**; SEO 100 в боевом режиме (в учебном 69 — намеренный `noindex`); LCP 1,8–2,4 с, TBT 0–10 мс, CLS 0; вес первой загрузки ≈ 244 КБ
- axe (WCAG 2.2 AA): 0 нарушений на всех страницах, mobile и desktop
- html-validate: 0 ошибок
- 11 тестовых экранов (320–2560 px): горизонтального скролла нет
- Функциональные тесты: 26 проверок пройдены (меню, статус «открыто», лайтбокс, якоря, плавающая кнопка, работа без JS)
