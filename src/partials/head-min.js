// Минимальный <head> для служебных страниц (404, политика)
import { isDemo } from './_util.js';

export default ({ cafe, env }) => {
  // 404.html GitHub Pages отдаёт по любому адресу (/tema_edy/a/b/…) — относительные пути ломаются,
  // поэтому для неё задаём <base> из SITE_URL. Для политики base не мешает.
  const base = env.SITE_URL ? new URL(env.SITE_URL).pathname.replace(/\/?$/, '/') : '';
  // 404 GitHub Pages отдаёт со статусом 404 — в индекс она не попадёт и без noindex
  return `${base ? `<base href="${base}">` : ''}
    ${isDemo(cafe) ? '<meta name="robots" content="noindex, nofollow">' : ''}
    <meta name="theme-color" content="#FBF3EA">
    <link rel="icon" href="favicon.svg" type="image/svg+xml">
    <link rel="icon" href="favicon-32.png" sizes="32x32" type="image/png">
    <link rel="apple-touch-icon" href="apple-touch-icon.png">`;
};
