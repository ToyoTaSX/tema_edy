// Контакты (п. 9, 10.9): адрес с ориентиром, карта-фасад, телефоны, часы, ВК
import { typo, icon, mainPhone, extraPhones, tel, hoursText, mapLinks } from './_util.js';

export default ({ cafe }) => {
  const p = mainPhone(cafe);
  const m = mapLinks(cafe);
  const nt = '<span class="visually-hidden"> (откроется в новой вкладке)</span>';
  return `
  <section class="section contacts" id="contacts" aria-labelledby="contacts-title" data-contacts>
    <div class="container contacts__grid">
      <div class="contacts__info">
        <p class="hand">ждём в гости</p>
        <h2 class="section__title" id="contacts-title">Как нас найти</h2>
        <dl class="contacts__list">
          <div class="contacts__row">${icon('pin')}<dt>Адрес</dt><dd><a href="${m.yandex}" target="_blank" rel="noopener" data-goal="route">${typo(`г. ${cafe.city}, ${cafe.address}`)}${nt}</a><br><span class="contacts__muted">${typo(cafe.address_landmark)}</span></dd></div>
          <div class="contacts__row">${icon('phone')}<dt>Телефон</dt><dd><a class="contacts__phone" href="${tel(p)}" data-goal="call" data-goal-place="contacts">${p.display}</a>
            <button class="copy" type="button" data-copy="${p.display}" hidden>${icon('copy')}<span>Скопировать</span></button>
            ${extraPhones(cafe)
              .map(
                (x) =>
                  `<br><span class="contacts__muted">дополнительный: <a href="${tel(x)}">${x.display}</a></span>`,
              )
              .join('')}</dd></div>
          <div class="contacts__row">${icon('clock')}<dt>Часы работы</dt><dd>${hoursText(cafe)}<br><span class="contacts__muted">${typo('Режим можно продлить для мероприятий')}</span></dd></div>
          <div class="contacts__row">${icon('vk')}<dt>ВКонтакте</dt><dd><a href="${cafe.social.vk}" target="_blank" rel="noopener" data-goal="vk">${cafe.social.vk_short}${nt}</a><br><a href="${cafe.social.vk_message}" target="_blank" rel="noopener" data-goal="vk-message">Написать сообществу${nt}</a></dd></div>
        </dl>
        <div class="contacts__actions">
          <a class="button button--primary" href="${tel(p)}" data-goal="call" data-goal-place="contacts-btn">${icon('phone')}<span>Позвонить</span></a>
          <a class="button button--outline" href="${m.route}" target="_blank" rel="noopener" data-goal="route">${icon('route')}<span>Построить маршрут</span>${nt}</a>
        </div>
      </div>
      <div class="map" data-map data-src="${m.widget}">
        <div class="map__facade">
          ${icon('pin', 'map__pin')}
          <p class="map__address">${typo(`${cafe.address}, ${cafe.city}`)}</p>
          <button class="button button--brand button--s" type="button" data-map-load hidden>Показать карту</button>
          <p class="map__links"><a href="${m.yandex}" target="_blank" rel="noopener">Яндекс Карты${nt}</a> · <a href="${m.gis}" target="_blank" rel="noopener">2ГИС${nt}</a></p>
        </div>
      </div>
    </div>
  </section>`;
};
