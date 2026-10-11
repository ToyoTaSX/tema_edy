// Шапка и навигация (п. 10.2)
import { icon, mainPhone, tel } from './_util.js';

export const NAV = [
  ['lunch', 'Обеды'],
  ['menu', 'Меню'],
  ['delivery', 'Доставка'],
  ['banquets', 'Банкеты'],
  ['contacts', 'Контакты'],
];

export default ({ cafe }) => {
  const p = mainPhone(cafe);
  return `
  <header class="header" data-header>
    <div class="container header__inner">
      <a class="header__logo" href="#top"><img class="header__logo-img" src="images/logo/logo-header.svg" width="160" height="104" alt="Тема еды — в начало страницы"></a>
      <nav class="nav" id="nav" aria-label="Основное меню" data-nav>
        <ul class="nav__list">
          ${NAV.map(([id, t]) => `<li><a class="nav__link" href="#${id}" data-nav-link>${t}</a></li>`).join('')}
        </ul>
        <a class="nav__phone" href="${tel(p)}" data-goal="call" data-goal-place="nav">${icon('phone')}${p.display}</a>
      </nav>
      <a class="button button--primary button--s header__call" href="${tel(p)}" data-goal="call" data-goal-place="header">
        ${icon('phone')}<span class="header__call-short">Позвонить</span><span class="header__call-full">${p.display}</span>
      </a>
      <button class="header__burger" type="button" aria-expanded="false" aria-controls="nav" aria-label="Открыть меню" data-burger>
        ${icon('menu', 'icon--open')}${icon('close', 'icon--close')}
      </button>
    </div>
  </header>`;
};
