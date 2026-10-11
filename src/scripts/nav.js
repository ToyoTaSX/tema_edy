// Шапка: мобильное меню, скрытие при скролле вниз, подсветка текущей секции (п. 10.2)
export function initNav() {
  const header = document.querySelector('[data-header]');
  const nav = document.querySelector('[data-nav]');
  const burger = document.querySelector('[data-burger]');
  if (!header || !nav || !burger) return;
  const mqDesktop = window.matchMedia('(width >= 1024px)');

  const setOpen = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    nav.classList.toggle('nav--open', open);
    document.body.classList.toggle('no-scroll', open);
    if (open) nav.querySelector('a')?.focus();
  };
  burger.addEventListener('click', () => setOpen(burger.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => {
    if (e.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('nav--open')) {
      setOpen(false);
      burger.focus();
    }
    // фокус-ловушка в открытом меню
    if (e.key === 'Tab' && nav.classList.contains('nav--open')) {
      const f = [burger, ...nav.querySelectorAll('a')];
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) {
        e.preventDefault();
        f.at(-1).focus();
      } else if (!e.shiftKey && i === f.length - 1) {
        e.preventDefault();
        f[0].focus();
      }
    }
  });
  mqDesktop.addEventListener('change', () => setOpen(false));

  // Тень при прокрутке; на mobile шапка прячется при скролле вниз
  let lastY = window.scrollY;
  let ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('header--scrolled', y > 8);
    const hide = !mqDesktop.matches && y > lastY && y > 240 && !nav.classList.contains('nav--open');
    header.classList.toggle('header--hidden', hide);
    lastY = y;
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
      }
    },
    { passive: true },
  );
  // не прятать шапку, когда в ней фокус
  header.addEventListener('focusin', () => header.classList.remove('header--hidden'));

  // Подсветка пункта меню текущей секции
  const links = [...document.querySelectorAll('[data-nav-link]')];
  const sections = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting) continue;
          for (const a of links) {
            if (a.getAttribute('href') === `#${en.target.id}`) a.setAttribute('aria-current', 'true');
            else a.removeAttribute('aria-current');
          }
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((s) => io.observe(s));
  }
}
