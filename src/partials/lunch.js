// Бизнес-ланч (п. 9, 10.15): цена крупно, состав, предзаказ, меню дня из ВК по клику
import { typo, icon, mainPhone, tel, price } from './_util.js';

export default ({ cafe, photos }) => {
  const L = cafe.business_lunch;
  const p = mainPhone(cafe);
  const ph = photos.photos['5643531'];
  return `
  <section class="section section--alt lunch" id="lunch" aria-labelledby="lunch-title">
    <div class="container">
      <header class="section__head">
        <p class="hand">каждый день новое меню</p>
        <h2 class="section__title" id="lunch-title">Обед за ${price(L.price_cafe)}</h2>
        <div class="divider" aria-hidden="true"></div>
      </header>
      <div class="lunch__grid">
        <div class="lunch__media">
          <div class="plate plate--l">
            <img src="${ph.file}-480.webp" width="480" height="480" alt="Бизнес-ланч на доставку: суп, горячее с гарниром и салат в контейнерах" loading="lazy" decoding="async">
          </div>
        </div>
        <div class="lunch__body">
          <ol class="lunch__steps">
            <li class="lunch__step">${icon('cat-soups')}<span><b>Первое</b> на&nbsp;выбор из&nbsp;меню дня</span></li>
            <li class="lunch__step">${icon('cat-hot')}<span><b>Горячее</b> с&nbsp;гарниром на&nbsp;выбор</span></li>
            <li class="lunch__step">${icon('cat-salads')}<span><b>Салат</b>, хлеб и&nbsp;чай</span></li>
          </ol>
          <div class="lunch__prices">
            <p class="price-tag"><span class="price-tag__value">${price(L.price_cafe)}</span><span class="price-tag__label">в&nbsp;кафе</span></p>
            <p class="price-tag"><span class="price-tag__value">${price(L.price_delivery)}</span><span class="price-tag__label">с&nbsp;доставкой</span></p>
          </div>
          <ul class="lunch__notes">
            <li>${icon('clock')}<span>${typo('Предзаказ — с вечера до 21:00 или утром с 9:00 до 10:30')}</span></li>
            <li>${icon('check')}<span>ПП-обед — ${price(L.pp_lunch.price)}, количество ограничено</span></li>
            <li>${icon('check')}<span>${typo('Блюда комплекса можно заказать отдельно: первые 190–220 ₽, вторые 210–220 ₽, салаты 170–190 ₽')}</span></li>
          </ul>
          <div class="lunch__actions">
            <a class="button button--primary" href="${tel(p)}" data-goal="call" data-goal-place="lunch">${icon('phone')}<span>Заказать обед</span></a>
            <button class="button button--outline" type="button" aria-expanded="false" aria-controls="lunch-today" data-lunch-today hidden>${icon('calendar')}<span>Показать меню на сегодня</span></button>
          </div>
          <p class="lunch__vk">
            <a href="${L.daily_menu_link}" target="_blank" rel="noopener" data-goal="vk-lunch">${icon('vk')}Меню дня — во&nbsp;ВКонтакте<span class="visually-hidden"> (откроется в новой вкладке)</span></a>
            <span class="lunch__vk-note">Публикуем каждое утро</span>
          </p>
        </div>
      </div>
      <div class="lunch__today" id="lunch-today" aria-live="polite" data-lunch-box hidden></div>
    </div>
  </section>`;
};
