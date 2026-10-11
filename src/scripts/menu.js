// Меню: на desktop все категории раскрыты; переход по иконке-якорю раскрывает категорию (п. 10.5)
export function initMenu() {
  const cats = [...document.querySelectorAll('.menu-cat')];
  if (!cats.length) return;
  if (window.matchMedia('(width >= 1024px)').matches) cats.forEach((d) => (d.open = true));

  const openFromHash = (hash) => {
    if (!hash || hash.length < 2) return null;
    const el = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (el?.classList.contains('menu-cat')) {
      el.open = true;
      return el;
    }
    return null;
  };
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#menu-"]');
    if (!a) return;
    const el = openFromHash(a.getAttribute('href'));
    if (el) {
      e.preventDefault();
      history.replaceState(null, '', a.getAttribute('href'));
      el.scrollIntoView({
        behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
      el.querySelector('summary')?.focus({ preventScroll: true });
    }
  });
  openFromHash(location.hash);
}
