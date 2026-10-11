// Страница 404 (п. 10.14)
import { icon, mainPhone, tel, typo } from './_util.js';

export default ({ cafe }) => {
  const p = mainPhone(cafe);
  return `
  <main class="simple simple--center" id="main">
    <svg class="simple__mark" aria-hidden="true" viewBox="0 0 64 64" width="96" height="96"><use href="#i-cat-lunch"></use></svg>
    <p class="hand">ой, пусто</p>
    <h1 class="simple__title">Такой страницы нет — но&nbsp;обед есть</h1>
    <p class="simple__text">${typo(`Кафе «Тема еды», г. ${cafe.city}, ${cafe.address}`)}</p>
    <div class="simple__actions">
      <a class="button button--outline" href="./">На главную</a>
      <a class="button button--primary" href="${tel(p)}">${icon('phone')}<span>${p.display}</span></a>
    </div>
  </main>`;
};
