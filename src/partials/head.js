// <head>: мета, Open Graph, иконки, предзагрузка шрифтов, JSON-LD (п. 14)
import { esc, mainPhone, isDemo } from './_util.js';

export default ({ cafe, menu, env }) => {
  const site = env.SITE_URL.replace(/\/?$/, '/');
  const abs = env.SITE_URL ? site : '';
  const desc = `Кафе «Тема еды» в Верхнем Уфалее, ${cafe.address}: бизнес-ланч за ${cafe.business_lunch.price_cafe} ₽, пицца, шашлык с мангала, доставка, банкеты до ${cafe.banquets.capacity_max} гостей.`;
  const p = mainPhone(cafe);
  const parseH = (s) => s.split(/[–-]/).map((t) => t.trim());
  const [wdF, wdT] = parseH(cafe.hours.weekdays);
  const [weF, weT] = parseH(cafe.hours.weekends);
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: 'Тема еды',
    description: desc,
    telephone: p.e164,
    servesCuisine: ['Русская', 'Пицца', 'Гриль', 'Фастфуд'],
    priceRange: '₽',
    acceptsReservations: true,
    address: {
      '@type': 'PostalAddress',
      streetAddress: cafe.address,
      addressLocality: cafe.city,
      addressRegion: cafe.region,
      addressCountry: 'RU',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: wdF,
        closes: wdT,
      },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Saturday', 'Sunday'], opens: weF, closes: weT },
    ],
    sameAs: [cafe.social.vk],
    ...(abs && { url: abs, hasMenu: `${abs}#menu`, image: `${abs}og-image.jpg`, logo: `${abs}icon-512.png` }),
  };
  return `
    ${isDemo(cafe) ? '<meta name="robots" content="noindex, nofollow">' : ''}
    <meta name="description" content="${esc(desc)}">
    <meta name="theme-color" content="#FBF3EA">
    <meta name="format-detection" content="telephone=no">
    ${abs ? `<link rel="canonical" href="${abs}">` : ''}
    <meta property="og:type" content="restaurant.restaurant">
    <meta property="og:locale" content="ru_RU">
    <meta property="og:site_name" content="Тема еды">
    <meta property="og:title" content="Кафе «Тема еды» — Верхний Уфалей">
    <meta property="og:description" content="${esc(desc)}">
    ${abs ? `<meta property="og:url" content="${abs}">` : ''}
    <meta property="og:image" content="${abs}og-image.jpg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="icon" href="favicon.svg" type="image/svg+xml">
    <link rel="icon" href="favicon-32.png" sizes="32x32" type="image/png">
    <link rel="apple-touch-icon" href="apple-touch-icon.png">
    <link rel="manifest" href="manifest.webmanifest">
    ${isDemo(cafe) ? '' : `<script type="application/ld+json">${JSON.stringify(ld)}</script>`}
    <!-- menu updated ${esc(menu.updated)} -->`;
};
