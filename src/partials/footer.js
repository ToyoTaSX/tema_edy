// Подвал (п. 10.11, 15): светлый логотип, контакты, реквизиты, политика
import { esc, typo, mainPhone, tel, hoursText, isDemo } from './_util.js';

export default ({ cafe }) => {
  const p = mainPhone(cafe);
  const L = cafe.legal;
  const demo = isDemo(cafe);
  const req = `${esc(L.entity)}, ИНН&nbsp;${esc(L.inn)}, ОГРНИП&nbsp;${esc(L.ogrnip)}`;
  const legal = !L.placeholder
    ? `<p class="footer__legal">${req}</p>`
    : demo
      ? `<p class="footer__legal footer__legal--todo">${req} — демо-данные</p>`
      : `<p class="footer__legal footer__legal--todo">Реквизиты уточняются</p>`;
  const demoNote = demo
    ? `<p class="footer__demo">Учебный проект для портфолио. Сайт не&nbsp;является официальным сайтом кафе «Тема еды»; актуальные цены, меню и&nbsp;часы работы — в&nbsp;<a href="${cafe.social.vk}" target="_blank" rel="noopener">группе ВКонтакте<span class="visually-hidden"> (откроется в новой вкладке)</span></a>.</p>`
    : '';
  return `
  <footer class="footer on-dark">
    <div class="container footer__grid">
      <div class="footer__brand"><img class="footer__logo-img" src="images/logo/logo-footer-light.svg" width="200" height="169" alt="Тема еды — кафе-ресторан" loading="lazy"></div>
      <div class="footer__col">
        <p class="footer__title">Кафе «Тема еды»</p>
        <p>${typo(`г. ${cafe.city}, ${cafe.address}`)}</p>
        <p>${hoursText(cafe)}</p>
        <p><a href="${tel(p)}" data-goal="call" data-goal-place="footer">${p.display}</a></p>
      </div>
      <div class="footer__col">
        <p class="footer__title">Мы на связи</p>
        <p><a href="${cafe.social.vk}" target="_blank" rel="noopener">ВКонтакте<span class="visually-hidden"> (откроется в новой вкладке)</span></a></p>
        <p><a href="menu/tema-edy-menu.pdf" target="_blank" rel="noopener">Меню для печати (PDF)<span class="visually-hidden"> (откроется в новой вкладке)</span></a></p>
        <p><a href="privacy.html">Политика конфиденциальности</a></p>
      </div>
    </div>
    <div class="container footer__bottom">
      ${demoNote}
      ${legal}
      <p>© ${new Date().getFullYear()} Тема еды. Цены и&nbsp;состав блюд уточняйте по&nbsp;телефону.</p>
    </div>
  </footer>`;
};
