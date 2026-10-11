// «Меню на сегодня»: виджет стены сообщества ВК по клику (п. 10.15). Скрипт ВК не грузится заранее.
const VK_API = 'https://vk.com/js/api/openapi.js?169';

const loadScript = (src) =>
  new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = resolve;
    s.onerror = reject;
    document.head.append(s);
  });

export function initLunchToday(config) {
  const btn = document.querySelector('[data-lunch-today]');
  const box = document.querySelector('[data-lunch-box]');
  if (!btn || !box || !config.vkGroupId) return;
  btn.hidden = false;
  let loaded = false;
  btn.addEventListener('click', async () => {
    const open = btn.getAttribute('aria-expanded') !== 'true';
    btn.setAttribute('aria-expanded', String(open));
    box.hidden = !open;
    if (!open || loaded) return;
    loaded = true;
    box.innerHTML = '<div class="lunch__today-skeleton">Загружаем записи группы…</div>';
    try {
      if (!window.VK) await loadScript(VK_API);
      box.innerHTML = '<div id="vk-lunch-widget"></div>';
      window.VK.Widgets.Group(
        'vk-lunch-widget',
        {
          mode: 4,
          wide: 1,
          no_cover: 1,
          width: 'auto',
          height: 560,
          color1: 'FFFFFF',
          color2: '3B2716',
          color3: '8A5A33',
        },
        config.vkGroupId,
      );
      box
        .querySelector('iframe')
        ?.setAttribute('title', 'Меню бизнес-ланча на сегодня — записи группы ВКонтакте');
    } catch {
      box.innerHTML =
        '<p class="lunch__today-skeleton">Не удалось загрузить ВКонтакте. <a href="https://vk.ru/wall-99941253?own=1" target="_blank" rel="noopener">Открыть меню дня в группе</a></p>';
    }
  });
}
