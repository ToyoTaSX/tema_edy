// Яндекс Метрика + цели (п. 14) и cookie-уведомление (п. 10.13). Без metrikaId ничего не грузится.
const storage = {
  get(k) {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set(k, v) {
    try {
      localStorage.setItem(k, v);
    } catch {
      /* приватный режим */
    }
  },
};

export function initAnalytics(config) {
  const id = config.metrikaId;
  if (!id) return;

  const cookie = document.querySelector('[data-cookie]');
  if (cookie && !storage.get('cookie-ok')) {
    cookie.hidden = false;
    cookie.querySelector('[data-cookie-ok]')?.addEventListener('click', () => {
      storage.set('cookie-ok', '1');
      cookie.hidden = true;
    });
  }

  const start = () => {
    (function (m, e, t, r, i, k, a) {
      m[i] =
        m[i] ||
        function () {
          (m[i].a = m[i].a || []).push(arguments);
        };
      m[i].l = 1 * new Date();
      k = e.createElement(t);
      a = e.getElementsByTagName(t)[0];
      k.async = 1;
      k.src = r;
      a.parentNode.insertBefore(k, a);
    })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
    ym(id, 'init', { clickmap: true, trackLinks: true, accurateTrackBounce: true });
  };
  if (document.readyState === 'complete') setTimeout(start, 1500);
  else addEventListener('load', () => setTimeout(start, 1500), { once: true });

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-goal]');
    if (el && window.ym) ym(id, 'reachGoal', el.dataset.goal, { place: el.dataset.goalPlace || '' });
  });
}
