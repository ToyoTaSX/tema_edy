// Доставка (п. 9): 3 шага, условия, честное время
import { typo, icon, mainPhone, tel, price } from './_util.js';

export default ({ cafe }) => {
  const p = mainPhone(cafe);
  const d = cafe.delivery;
  const t = (s) => s.replace(/^0/, '').replace(/–0?/, '–');
  return `
  <section class="section section--alt delivery" id="delivery" aria-labelledby="delivery-title">
    <div class="container">
      <header class="section__head">
        <p class="hand">привезём горячим</p>
        <h2 class="section__title" id="delivery-title">Доставка</h2>
        <div class="divider" aria-hidden="true"></div>
      </header>
      <ol class="steps">
        <li class="steps__item">${icon('file', 'steps__icon')}<h3 class="steps__title">Выберите</h3><p>${typo('Блюда из меню выше или бизнес-ланч дня')}</p></li>
        <li class="steps__item">${icon('phone', 'steps__icon')}<h3 class="steps__title">Позвоните</h3><p>${typo(`Приём заказов ${t(cafe.hours.orders)}`)}: <a href="${tel(p)}" data-goal="call" data-goal-place="delivery-step">${p.display}</a></p></li>
        <li class="steps__item">${icon('truck', 'steps__icon')}<h3 class="steps__title">Привезём</h3><p>${typo('Адрес и время доставки уточнит оператор')}</p></li>
      </ol>
      <div class="delivery__terms">
        <p class="price-tag price-tag--light"><span class="price-tag__value">0&nbsp;₽</span><span class="price-tag__label">доставка от&nbsp;${price(d.free_from)}</span></p>
        <p class="price-tag price-tag--light"><span class="price-tag__value">${price(d.fee_below_free)}</span><span class="price-tag__label">при заказе до&nbsp;${price(d.free_from)}</span></p>
        <p class="price-tag price-tag--light"><span class="price-tag__value">${price(cafe.business_lunch.price_delivery)}</span><span class="price-tag__label">бизнес-ланч с&nbsp;доставкой</span></p>
      </div>
      <p class="delivery__note">${icon('clock')}<span>${typo('В выходные и в часы пик доставка может занять до 2 часов — точное время подскажет оператор.')}</span></p>
      <div class="section__cta">
        <a class="button button--primary button--l" href="${tel(p)}" data-goal="call" data-goal-place="delivery">${icon('phone')}<span>Заказать доставку</span></a>
      </div>
    </div>
  </section>`;
};
