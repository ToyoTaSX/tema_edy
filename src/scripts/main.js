// Точка входа: прогрессивное улучшение (п. 0.5). Без JS сайт полностью читаем.
import { initNav } from './nav.js';
import { initStatus } from './status.js';
import { initFab } from './fab.js';
import { initMenu } from './menu.js';
import { initLightbox } from './lightbox.js';
import { initReviews } from './reviews.js';
import { initCopy } from './copy.js';
import { initLunchToday } from './vk-lunch.js';
import { initMap } from './map.js';
import { initAnalytics } from './analytics.js';

// класс .js ставится встроенным скриптом в <head> — до первой отрисовки, без пересчёта стилей

const config = (() => {
  try {
    return JSON.parse(document.getElementById('site-config')?.textContent || '{}');
  } catch {
    return {};
  }
})();

for (const init of [initNav, initStatus, initFab, initMenu, initLightbox, initReviews, initCopy, initMap]) {
  try {
    init();
  } catch (e) {
    console.error(e);
  }
}
initLunchToday(config);
initAnalytics(config);
