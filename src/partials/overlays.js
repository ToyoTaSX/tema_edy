// Плавающая кнопка звонка (10.12), cookie-плашка (10.13), лайтбокс (10.7), тост
import { icon, mainPhone, tel } from './_util.js';

export default ({ cafe }) => {
  const p = mainPhone(cafe);
  return `
  <a class="fab" href="${tel(p)}" data-fab data-goal="call" data-goal-place="fab" aria-label="Позвонить: ${p.display}">
    ${icon('phone')}<span class="fab__label" data-fab-label>Позвонить</span>
  </a>
  ${
    cafe.site?.metrika_id
      ? `<div class="cookie" data-cookie hidden>
    <p class="cookie__text">Мы используем cookies и&nbsp;Яндекс Метрику, чтобы сайт работал лучше. <a href="privacy.html">Подробнее</a></p>
    <button class="button button--brand button--s" type="button" data-cookie-ok>Понятно</button>
  </div>`
      : ''
  }
  <dialog class="lightbox" data-lightbox-dialog aria-labelledby="lightbox-caption">
    <figure class="lightbox__fig">
      <figcaption class="lightbox__caption" id="lightbox-caption" data-lightbox-caption></figcaption>
    </figure>
    <button class="lightbox__close" type="button" aria-label="Закрыть" data-lightbox-close>${icon('close')}</button>
  </dialog>
  <div class="toast" role="status" aria-live="polite" data-toast></div>`;
};
