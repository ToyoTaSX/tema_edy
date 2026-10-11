// Плавающая кнопка звонка: после первого экрана, скрыта у контактов (п. 10.12)
export function initFab() {
  const fab = document.querySelector('[data-fab]');
  const hero = document.querySelector('.hero');
  const contacts = document.querySelector('[data-contacts]');
  const footer = document.querySelector('.footer');
  if (!fab || !hero || !('IntersectionObserver' in window)) return;
  const state = { hero: true, end: false };
  const apply = () => fab.classList.toggle('fab--visible', !state.hero && !state.end);
  new IntersectionObserver(([e]) => {
    state.hero = e.isIntersecting;
    apply();
  }).observe(hero);
  const endIo = new IntersectionObserver((entries) => {
    state.end = entries.some((e) => e.isIntersecting) || [contacts, footer].some((el) => el && isVisible(el));
    apply();
  });
  [contacts, footer].forEach((el) => el && endIo.observe(el));
}

const isVisible = (el) => {
  const r = el.getBoundingClientRect();
  return r.top < innerHeight && r.bottom > 0;
};
