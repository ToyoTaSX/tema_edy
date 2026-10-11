# PLAN.md — сборка лендинга «Тема еды» и развёртывание на GitHub Pages

> Версия: 1.3 · 11.10.2026 · Опирается на `STANDARTS.md` v1.8 (в скобках — ссылки на его пункты)
>
> Принцип: **деплой с первого дня.** Пустая страница уезжает на GitHub Pages в конце этапа 0, дальше каждый этап — это коммиты в `main`, которые сразу видны по ссылке. Заказчик может смотреть прогресс, а проблемы деплоя всплывают в начале, а не перед сдачей.

---

## 0. Что уже готово

| Есть | Где |
|---|---|
| Стандарт: сетка, отступы, типографика, палитра, компоненты, критерии готовности | `STANDARTS.md` |
| Данные кафе, меню (97 позиций), отзывы, фото | `content/cafe.json`, `menu.json`, `reviews.json`, `photos.json` |
| Скрипт пересборки меню из выгрузки ВК | `content/raw/build_menu.py` |
| Фото блюд WebP 160/480 | `public/images/menu/` (194 файла) |
| PDF-меню + генератор | `public/menu/tema-edy-menu.pdf`, `tools/menu-pdf/make_menu_pdf.mjs` |

**Ответы заказчика (11.10.2026):**

| Вопрос | Решение |
|---|---|
| Основной номер | `+7 (992) 500-40-30` — подтверждён |
| Реквизиты | **Заглушка** в `cafe.json → legal` (`placeholder: true`). Проект **учебный, для портфолио** (решение 11.10.2026): в прод не идёт, включён учебный режим `site.demo.enabled` |
| Меню дня | Новый пост каждый день → виджет стены ВК по клику (п. 10.15) |
| Логотип | Вектора нет → **перерисовываем** в SVG |
| Права на фото | Подтверждены |
| Домен | Не нужен — `https://<github-user>.github.io/tema_edy/` |
| Расхождения в данных | Берём более высокую цену: ланч 410/450 ₽, сет «Люля-кебаб» 1400 ₽ (уже в `content/`) |

**Ещё нужно от заказчика:** ⛔ реквизиты (до этапа 8); открепить в группе ВК старый пост с меню от 31.08.

**Нужно от вас:** имя GitHub-аккаунта, на котором создаём репозиторий `tema_edy`.


## Статус выполнения (11.10.2026)

| Этап | Статус | Итог |
|---|---|---|
| 0. Репозиторий и инструменты | ✅ | `package.json`, Vite, ESLint/Stylelint/Prettier/html-validate, `deploy.yml`, `checks.yml` |
| 1. Фундамент | ✅ | Токены 1-в-1 со стандартом; шрифты self-host (Caveat урезан до 42 КБ, ₽ отдельными файлами по 1 КБ); fallback-метрики против CLS; логотип перерисован в SVG (векторизация оригинала) — полный, без подписи, 3 цвета; знак «вилка + ложка» и favicon-набор |
| 2. Данные → HTML | ✅ | `build/render.mjs`: 13 партиалов, проверка данных, защита `RELEASE=1`, robots/sitemap |
| 3. Компоненты | ✅ | Все 13 компонентов п. 10 |
| 4. Секции | ✅ | 10 секций в порядке П2 |
| 5. Доп. страницы и SEO | ✅ | 404 (с `<base>` для подпапок), политика, OG-картинка, JSON-LD `Restaurant` |
| 6. CI-проверки | ✅ | lint, validate, axe, e2e (26 проверок), Lighthouse CI, свежесть PDF |
| 7. QA | ✅ (автоматизированная часть) | 11 экранов без горизонтального скролла; Lighthouse 97/100/100/100. **Осталось вручную:** реальные iPhone и Android, коридорный тест на 3–5 людях |
| 8. Релиз | ⏳ | Учебный режим: плашка «Учебный проект», noindex, без JSON-LD/sitemap, демо-реквизиты — релиз с заглушками разрешён. Нужен только GitHub-аккаунт для публикации (инструкция — README). Метрика — необязательно |

**Отклонения от плана:** отдельная страница-styleguide не делалась — компоненты проверены на самой странице на 11 экранах и тестами. Знак для favicon нарисован заново (из оригинального логотипа его не вырезать: черенки приборов скрыты лентой).

---

## 1. Технические решения

| Вопрос | Решение | Почему |
|---|---|---|
| Сборщик | **Vite** (актуальная стабильная версия, vanilla, без фреймворка) | Стандарт п. 1; быстрая сборка, хеши в именах файлов (обход кеша GitHub Pages, п. 12) |
| Шаблоны | **Свой мини-плагин Vite** `build/render.mjs`: на этапе сборки читает `content/*.json` и подставляет секции-партиалы (JS template literals) в `index.html` | Меню, контакты, отзывы — статический HTML без JS в браузере (п. 0.5, п. 10.5); без лишних зависимостей вроде Handlebars |
| CSS | Обычный CSS + PostCSS (autoprefixer); файлы по БЭМ-блокам, `@import` собирает Vite | Стандарт п. 16 |
| JS | ES-модули, ~5–8 КБ: статус «открыто», шапка, копирование номера, лайтбокс, виджет ВК, cookie, цели Метрики | Прогрессивное улучшение |
| Шрифты | `@fontsource-variable/oswald`, `manrope`, `caveat` → копируем только `latin` + `cyrillic` woff2 в `src/fonts/` | Self-host (п. 6.1), те же файлы, что в PDF |
| Иконки | SVG-спрайт `src/icons/sprite.svg` (Lucide/Tabler + свои) | п. 10.10 |
| Хостинг | **GitHub Pages через GitHub Actions** (не ветка `gh-pages`) | Официальный способ, сборка в CI, никаких собранных файлов в репозитории |
| Репозиторий | Публичный `github.com/<github-user>/tema_edy` | Pages на приватном репозитории — только на платных тарифах |
| Пути | `base: './'` в Vite — относительные пути | Сайт в подпапке `/tema_edy/` на `github.io` (п. 14); если домен появится позже — без переделок |

---

## 2. Структура репозитория (итоговая)

```
tema_edy/
├── index.html                  # каркас: <head>, <!-- @section:hero --> … партиалы
├── privacy.html                # политика конфиденциальности
├── 404.html
├── content/                    # данные (уже есть)
├── src/
│   ├── partials/               # header.js, hero.js, lunch.js, menu.js, delivery.js, banquets.js, about.js, reviews.js, contacts.js, footer.js, jsonld.js
│   ├── styles/
│   │   ├── tokens.css          # п. 5–8 стандарта 1-в-1
│   │   ├── fonts.css           # @font-face + fallback с size-adjust
│   │   ├── base.css  layout.css  utilities.css
│   │   └── blocks/             # button.css, header.css, call.css, dish.css, menu.css, accordion.css, lightbox.css, review.css, map.css, cookie.css, divider.css, cat-icons.css, status.css, fab.css
│   ├── scripts/
│   │   ├── main.js             # точка входа, ленивые импорты
│   │   ├── open-status.js  header.js  copy-phone.js  lightbox.js  vk-lunch.js  cookie.js  metrika.js
│   ├── fonts/  icons/  images/ # hero, интерьер (после выгрузки/фотосессии)
├── public/                     # копируется как есть: images/menu/, menu/*.pdf, favicon*, og-image.jpg, robots.txt, sitemap.xml, CNAME (при домене)
├── build/
│   └── render.mjs              # Vite-плагин: content/*.json → HTML
├── tools/
│   ├── menu-pdf/               # генератор PDF (есть)
│   └── shots.mjs               # скриншоты 11 тестовых экранов (Playwright)
├── .github/workflows/
│   ├── deploy.yml              # сборка + деплой на Pages
│   └── checks.yml              # линтеры + Lighthouse + валидатор на PR
├── vite.config.js  package.json  .editorconfig  .gitignore
├── .stylelintrc.json  eslint.config.js  .htmlvalidate.json  lighthouserc.json  .prettierrc
├── STANDARTS.md  PLAN.md  README.md
```

---

## 3. Этапы

Оценка — в рабочих днях одного разработчика. Итого **≈ 8–9 дней** до релиза, без учёта ожидания ответов заказчика.

### Этап 0. Репозиторий, инструменты, первый деплой — 0,5 дня

1. `git init`, `.gitignore` (`node_modules/`, `dist/`, `build/photos_vk/`, `*.zip`), `.editorconfig`.
2. `npm init`, установить: `vite`, `postcss`, `autoprefixer`, `stylelint` + `stylelint-config-standard`, `eslint`, `prettier`, `html-validate`, `@lhci/cli`, `playwright`, `@fontsource-variable/{oswald,manrope,caveat}`.
3. Скрипты в `package.json`:
   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "preview": "vite preview",
       "lint": "eslint src build tools && stylelint \"src/**/*.css\" && prettier --check .",
       "validate": "html-validate dist/*.html",
       "menu:data": "python3 content/raw/build_menu.py",
       "menu:pdf": "node tools/menu-pdf/make_menu_pdf.mjs content public/menu/tema-edy-menu.pdf public/images/menu",
       "shots": "node tools/shots.mjs",
       "lhci": "lhci autorun"
     }
   }
   ```
4. `vite.config.js`: `base: './'`, `build.assetsInlineLimit: 0`, `rollupOptions.input: { main: 'index.html', privacy: 'privacy.html', 404: '404.html' }`.
5. Создать репозиторий на GitHub, `git push -u origin main`.
6. **Settings → Pages → Build and deployment → Source: GitHub Actions.**
7. Добавить `.github/workflows/deploy.yml` (см. раздел 4), запушить заглушку `index.html` («Скоро здесь будет сайт кафе «Тема еды»»).

**Готово, когда:** заглушка открывается по `https://<user>.github.io/tema_edy/` по HTTPS, и каждый пуш в `main` её обновляет за 1–2 минуты.

### Этап 1. Фундамент: токены, шрифты, сетка, логотип — 1 день

1. `tokens.css` — все токены из п. 5, 6.2, 7.1, 8 стандарта (один в один, без «магических чисел»).
2. `fonts.css` — `@font-face` для 3 шрифтов (latin + cyrillic) + fallback-гарнитуры с `size-adjust` (подобрать через Capsize/Fontaine), `<link rel="preload">` для Oswald и Manrope.
3. `base.css` — reset, `html { scroll-padding-top/bottom }`, ссылки с подчёркиванием, `:focus-visible`, `prefers-reduced-motion`.
4. `layout.css` — `.container`, сетка 4/8/12, `.stack`, брейкпоинты (п. 3–4).
5. Тестовая страница `/styleguide.html` (только в dev): палитра, шкала шрифтов, кнопки — сверить контраст и вид с заказчиком.
6. Логотип: **перерисовка в SVG** по обложке ВК (решение заказчика) → `brand/logo/` — 4 версии по п. 8.1, сверка наложением на оригинал; favicon-набор (`favicon.svg`, 32, 180, 192, 512), `manifest.webmanifest`. Согласовать с заказчиком вместе со styleguide.

**Готово, когда:** styleguide на Pages, стилистика согласована с заказчиком, линтеры зелёные.

### Этап 2. Данные → HTML на этапе сборки — 1 день

1. `build/render.mjs` — Vite-плагин (`transformIndexHtml`): читает `content/cafe.json`, `menu.json`, `reviews.json`, заменяет маркеры `<!-- @section:имя -->` результатом функций из `src/partials/*.js`.
2. Общие хелперы: экранирование HTML, `&nbsp;` после предлогов и в «410 ₽» (п. 6.3), форматирование телефона (`e164` → ссылка, `display` → текст), часы работы.
3. Партиал `jsonld.js` — `Restaurant` (п. 14) из `cafe.json`.
4. Проверка данных при сборке: у каждого блюда есть цена, категория, фото; основной номер ровно один; иначе сборка падает с понятной ошибкой.
5. **Защита от заглушек:** если `cafe.json → legal.placeholder === true`, обычная сборка выводит предупреждение и показывает в подвале «реквизиты уточняются», а сборка с `RELEASE=1` **падает**. Так тестовая версия публикуется спокойно, а релиз с нулевым ИНН невозможен. **Исключение — учебный режим** (`site.demo.enabled: true`): заглушки показываются с пометкой «демо-данные», релиз разрешён, сайт помечен как учебный и закрыт от индексации.

**Готово, когда:** `npm run build` выдаёт `dist/index.html` со всеми 95 блюдами и контактами в разметке; без JS страница читается полностью.

### Этап 3. Компоненты — 2 дня

По п. 10 стандарта, каждый — свой CSS-файл БЭМ-блока, со всеми состояниями (hover / focus-visible / active):

| Компонент | Пункт | Заметки |
|---|---|---|
| Кнопки `primary / brand / outline / ghost / light`, S/M/L | 10.1 | Oswald CAPS, pill, мин. 44px |
| Шапка + мобильное меню (бургер, `aria-expanded`, Esc, фокус-ловушка), скрытие при скролле вниз | 10.2 | |
| Статус «Открыто до 21:00 / Откроемся в 9:00» | 10.3, 0.7 | `Asia/Yekaterinburg`, расписание из `cafe.json` |
| Блок звонка + «Скопировать номер» на desktop | 10.6 | |
| Плавающая кнопка звонка (mobile) | 10.12 | Прячется у контактов, подпись вне часов работы |
| Строка блюда с круглым фото, карточка-хит | 10.4, 10.5 | `width/height`, `loading="lazy"` |
| Аккордеон категорий `<details>` + иконки-якоря | 10.5, 10.4.1 | Якорь раскрывает категорию |
| Лайтбокс на `<dialog>` для фото | 10.7 | Фокус возвращается на фото |
| Карточка отзыва + «Ещё отзывы» | 10.6.1 | |
| Фасад карты (превью → iframe Яндекс Карт по клику) | 10.9 | |
| Меню дня: кнопка → виджет стены ВК (`VK.Widgets.Group`, mode 4) | 10.15 | Новый пост каждый день; ссылка на стену всегда видна |
| Cookie-плашка | 10.13 | |
| Разделитель ◆, иконки категорий | 10.4.1–10.4.2 | |

**Готово, когда:** все компоненты на styleguide-странице, проверены с клавиатуры, на 320 и 1440 px.

### Этап 4. Секции страницы — 1,5 дня

В порядке п. 9: шапка → hero → бизнес-ланч → меню → доставка → банкеты → о кафе → отзывы → контакты → подвал. Для каждой секции:
- тексты по тону из п. 9.0 (короткие CAPS-заголовки, цифры вместо прилагательных);
- фон по ритму п. 7.3;
- проверка «резиной» 320 → 1920.

Фото для hero / банкетов / «О кафе» — только `kind: real` (пиццы, шашлык, обед, хачапури) до фотосессии; при необходимости выгрузить 6–9 фото интерьера из альбомов ВК (тем же способом, что фото меню).

**Готово, когда:** страница целиком на Pages, первый экран на 360×640 и 320×568 показывает H1, кнопку «Позвонить» и статус (п. 10.3).

### Этап 5. Остальные страницы и SEO — 0,5 дня

1. `privacy.html` — политика конфиденциальности (Метрика, cookies, виджет ВК); реквизиты подставляются из `cafe.json` (сейчас заглушка).
2. `404.html` — по п. 10.14.
3. `<title>`, description, Open Graph; `og-image.jpg` 1200×630 (фото пиццы + логотип на креме).
4. `robots.txt`, `sitemap.xml`, canonical (абсолютный URL `https://<github-user>.github.io/tema_edy/` — из переменной репозитория `SITE_URL`).
5. Яндекс Метрика: счётчик подключается после загрузки страницы; цели — `tel:`, ВК, PDF, «Маршрут», «Меню на сегодня».

### Этап 6. Автоматические проверки в CI — 0,5 дня

`.github/workflows/checks.yml` на каждый push и PR:
1. `npm run lint` — ESLint, Stylelint, Prettier.
2. `npm run build` + `npm run validate` — html-validate на `dist/`.
3. **Lighthouse CI** (`lighthouserc.json`, mobile): Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95, LCP < 2,5 с, CLS < 0,1, вес страницы ≤ 1 МБ на первой загрузке (п. 12, 17.2). Падение ниже порога = красный CI.
4. **axe** через Playwright — 0 критических ошибок.
5. Проверка ссылок (lychee) — внутренние якоря, `tel:`, PDF, ВК.
6. Сверка данных: цены в собранном HTML = `menu.json` = текст PDF (`pdftotext`).

### Этап 7. Ручное тестирование — 1 день

1. `npm run shots` — скриншоты всех **11 тестовых экранов** (п. 2) в `tests/shots/`, просмотр глазами.
2. Реальные устройства: iPhone (Safari) + Android (Chrome, Яндекс Браузер); зум 200%; крупный системный шрифт; альбомная ориентация.
3. Клавиатура: весь путь Tab-ом, фокус не уходит под шапку и плавающую кнопку.
4. Статус «открыто»: подмена времени — утро, день, после 21:00, выходные.
5. Звонок по `tel:` с телефона на основной номер; PDF открывается на iOS и Android.
6. **Коридорный тест** на 3–5 людях + 5-секундный тест первого экрана (п. 17.2, «Юзабилити»).
7. Все пункты Definition of Done (п. 17) отмечены.

### Этап 8. Релиз — 0,5 дня

1. Учебный проект: реквизиты остаются заглушкой, `site.demo.enabled: true` → `RELEASE=1 npm run build` проходит. *Для боевого сайта:* внести реквизиты, `placeholder: false`, `demo.enabled: false`.
2. Пересобрать меню и PDF: `npm run menu:data && npm run menu:pdf`.
3. В `deploy.yml` для тега включить `RELEASE=1`; тег `v1.0.0`, пуш → деплой.
4. Проверить сайт на `https://<github-user>.github.io/tema_edy/`: HTTPS, превью ссылки в Telegram и ВК (Open Graph), 404 на несуществующем адресе.
5. *(только для боевого сайта, в учебном режиме сайт закрыт от индексации)* Яндекс Вебмастер: добавить сайт (подтверждение мета-тегом в `index.html`), отправить sitemap, проверить JSON-LD. Яндекс Метрика: проверить цели.
6. *(только для боевого сайта)* Заказчик открепляет старый пост в ВК; ссылка на сайт — в описание и раздел «Ссылки» группы ВК.
7. *(только для боевого сайта)* Передача заказчику (п. 17.2): доступ к репозиторию (collaborator), Метрике, Вебмастеру; `README.md` «как обновить меню и PDF».

> Свой домен не нужен (решение 11.10.2026). Если появится позже: `public/CNAME`, DNS (`A` → `185.199.108–111.153`, `CNAME www → <github-user>.github.io`), домен в Settings → Pages, Enforce HTTPS, `SITE_URL`.

---

## 4. Деплой на GitHub Pages — workflow

`.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
    tags: ['v*']
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run build
        env:
          SITE_URL: ${{ vars.SITE_URL }}   # https://<github-user>.github.io/tema_edy/
          RELEASE: ${{ startsWith(github.ref, 'refs/tags/v') && '1' || '' }}
      - run: npm run validate
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

Примечания:
- PDF-меню собирается **локально** (`npm run menu:pdf`) и коммитится в `public/menu/` — Chromium в каждом деплое не нужен. В `checks.yml` есть сверка, что PDF не устарел относительно `menu.json`.
- Кеш GitHub Pages — 10 минут (`max-age=600`), CSS/JS с хешами в именах обновляются сразу; `index.html` и PDF — в течение 10 минут.
- Лимиты Pages: сайт ≤ 1 ГБ, ~100 ГБ трафика в месяц, ~10 сборок в час — для лендинга кафе с запасом.

---

## 5. Как обновлять сайт после сдачи

| Что изменилось | Действия |
|---|---|
| Цены / блюда в ВК | Повторить выгрузку товаров ВК → `content/raw/vk_market_ДАТА.txt` → `npm run menu:data` → `npm run menu:pdf` → коммит → деплой |
| Цена ланча, часы, телефон | Правка `content/cafe.json` (можно прямо в веб-интерфейсе GitHub) → деплой автоматически |
| Новое фото блюда | `public/images/menu/{id}-160.webp` и `-480.webp`, `kind: "real"` в `photos.json` → `npm run menu:data` → `npm run menu:pdf` |
| Меню дня бизнес-ланча | Ничего — показывается из поста ВК (п. 10.15) |

---

## 6. Риски

| Риск | Вероятность | Что делаем |
|---|---|---|
| Заказчик долго не даёт реквизиты | Средняя | Заглушка + защита `RELEASE=1`: тестовую версию показываем, релиз — только с настоящими реквизитами |
| Стоковые фото не совпадают с подачей — жалобы гостей | Низкая | Права подтверждены; оговорка «фото могут отличаться»; флаг сборки, чтобы скрыть `stock_likely`-фото, если понадобится |
| В виджете стены первым висит старый закреплённый пост | Средняя | Заказчик открепляет его; ссылка на стену видна всегда |
| Lighthouse < 90 из-за шрифтов / фото | Низкая | Fallback-метрики шрифтов, ленивые фото, бюджеты в Lighthouse CI ловят регресс сразу |
| ВК меняет вёрстку — сломается выгрузка товаров | Средняя | Выгрузка — ручной шаг раз в N месяцев; при поломке меню правится напрямую в `menu.json` |


---

## 7. Сводка по срокам

| Этап | Дней | Результат на Pages |
|---|---|---|
| 0. Репозиторий и первый деплой | 0,5 | Заглушка по HTTPS |
| 1. Фундамент | 1 | Styleguide: цвета, шрифты, кнопки |
| 2. Данные → HTML | 1 | Полное меню и контакты без JS |
| 3. Компоненты | 2 | Все компоненты на styleguide |
| 4. Секции | 1,5 | Вся страница |
| 5. Доп. страницы и SEO | 0,5 | 404, политика, OG, sitemap |
| 6. CI-проверки | 0,5 | Зелёный Lighthouse / линтеры |
| 7. Ручной QA | 1 | Чек-лист DoD закрыт |
| 8. Релиз | 0,5 | v1.0.0 на github.io, Метрика, Вебмастер, ссылка в ВК |
| **Итого** | **≈ 8,5** | |
