// Общие помощники партиалов (выполняются при сборке, в браузер не попадают)

/** Экранирование HTML */
export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Типографика: неразрывные пробелы после коротких слов и между числом и единицей (п. 6.3) */
export const typo = (s) =>
  esc(s)
    .replace(/(^|[\s(«])(в|и|с|к|о|у|на|по|из|за|от|до|не|или|а|но|без|для|при|со|об) /gi, '$1$2&nbsp;')
    .replace(/(\d) (г|гр|см|шт|мл|л|₽|кг|мин|минут|часов|человек|гостей)(?![а-яё])/gi, '$1&nbsp;$2')
    .replace(/№ (\d)/g, '№&nbsp;$1')
    .replace(/(\d)\s?[–-]\s?(\d)/g, '$1–$2');

/** Цена: 1400 → «1 400 ₽» с узким неразрывным пробелом */
export const price = (n) => `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}&nbsp;₽`;

/** Учебный режим (cafe.json → site.demo.enabled): сайт-портфолио, не официальный сайт кафе */
export const isDemo = (cafe) => !!cafe.site?.demo?.enabled;

/** Основной и дополнительные телефоны */
export const mainPhone = (cafe) => cafe.phones.find((p) => p.main);
export const extraPhones = (cafe) => cafe.phones.filter((p) => !p.main);
export const tel = (p) => `tel:${p.e164}`;

/** Иконка из SVG-спрайта (п. 10.10) */
export const icon = (name, cls = '') =>
  `<svg class="icon${cls ? ' ' + cls : ''}" aria-hidden="true" focusable="false"><use href="#i-${name}"></use></svg>`;

/** Часы работы в машиночитаемом виде для JS-статуса «Открыто / Закрыто» (п. 10.3) */
export const schedule = (cafe) => {
  const parse = (s) => s.split(/[–-]/).map((t) => t.trim());
  const [wdFrom, wdTo] = parse(cafe.hours.weekdays);
  const [weFrom, weTo] = parse(cafe.hours.weekends);
  // 0 — воскресенье … 6 — суббота
  const days = [0, 1, 2, 3, 4, 5, 6].map((d) => (d === 0 || d === 6 ? [weFrom, weTo] : [wdFrom, wdTo]));
  return JSON.stringify({ tz: 'Asia/Yekaterinburg', days });
};

/** Человекочитаемые часы */
export const hoursText = (cafe) => {
  const t = (s) => s.replace(/^0/, '').replace(/–0?/, '–');
  return `Пн–пт ${t(cafe.hours.weekdays)}, сб–вс ${t(cafe.hours.weekends)}`;
};

/** Картинка блюда (WebP 160/480) — п. 10.5, 11 */
export const dishImg = (img, size, { lazy = true, cls = '', alt } = {}) => {
  const src = `${img.src}-${size}.webp`;
  return `<img class="${cls}" src="${src}" width="${size}" height="${size}" alt="${esc(alt ?? img.alt)}"${
    lazy ? ' loading="lazy" decoding="async"' : ' fetchpriority="high"'
  }>`;
};

/** Ссылка на карту по адресу */
export const mapLinks = (cafe) => {
  const q = encodeURIComponent(`${cafe.city}, ${cafe.address}`);
  return {
    yandex: `https://yandex.ru/maps/?text=${q}`,
    route: `https://yandex.ru/maps/?rtext=~${q}&rtt=auto`,
    gis: `https://2gis.ru/search/${q}`,
    widget: `https://yandex.ru/map-widget/v1/?text=${q}&z=16`,
  };
};

/** Склонение: plural(22, ['блюдо','блюда','блюд']) */
export const plural = (n, [one, few, many]) => {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return one;
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
  return many;
};

/** Дата ISO → «11.10.2026» */
export const ruDate = (iso) => iso.split('-').reverse().join('.');
