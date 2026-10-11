// Первый экран (п. 10.3): H1 с городом, CTA, статус «открыто», фото в круге
import { typo, icon, mainPhone, tel, hoursText, schedule, mapLinks, price } from './_util.js';

export default ({ cafe }) => {
  const p = mainPhone(cafe);
  const m = mapLinks(cafe);
  return `
  <section class="hero" id="top" aria-labelledby="hero-title">
    <div class="container hero__inner">
      <div class="hero__text">
        <h1 class="hero__title" id="hero-title">
          <span class="hand hero__kicker">кафе в&nbsp;Верхнем Уфалее</span>
          <span class="hero__name">Тема еды</span>
        </h1>
        <p class="hero__lead">${typo(`Вкусно покормим каждый день — обеды, пицца, шашлык с мангала и банкеты до ${cafe.banquets.capacity_max} гостей`)}</p>
        <p class="status" data-status data-schedule='${schedule(cafe)}'>
          <span class="status__dot" aria-hidden="true"></span><span class="status__text">${hoursText(cafe)}</span>
        </p>
        <div class="hero__actions">
          <a class="button button--primary button--l" href="${tel(p)}" data-goal="call" data-goal-place="hero">
            ${icon('phone')}<span>Позвонить<span class="button__extra"> ${p.display}</span></span>
          </a>
          <a class="button button--outline button--l" href="#menu">Смотреть меню</a>
        </div>

        <ul class="hero__facts">
          <li>${icon('pin')}<a href="${m.yandex}" target="_blank" rel="noopener" data-goal="route">${typo(cafe.address)}<span class="visually-hidden"> (откроется в новой вкладке)</span></a></li>
          <li>${icon('truck')}<span>Доставка бесплатно от&nbsp;${price(cafe.delivery.free_from)}</span></li>
        </ul>
      </div>
      <div class="hero__media">
        <div class="plate plate--hero">
          <img src="images/hero/pizza-540.webp" width="540" height="540" alt="Пицца «Пепперони» из кафе «Тема еды»" fetchpriority="high">
        </div>
      </div>
    </div>
  </section>`;
};
