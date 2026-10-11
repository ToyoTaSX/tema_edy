// Банкеты (п. 9): тёмная «угольная» секция, поводы, вместимость, отзыв, CTA
import { esc, typo, icon, mainPhone, tel } from './_util.js';

export default ({ cafe, reviews, photos }) => {
  const p = mainPhone(cafe);
  const b = cafe.banquets;
  const rv = reviews.reviews.find((r) => /юбилей/i.test(r.text));
  const occ = ['Юбилеи', 'Дни рождения', 'Свадьбы', 'Корпоративы', 'Поминальные обеды'];
  const img = (id, alt) =>
    `<img src="${photos.photos[id].file}-480.webp" width="480" height="480" alt="${esc(alt)}" loading="lazy" decoding="async">`;
  return `
  <section class="section section--dark banquets on-dark" id="banquets" aria-labelledby="banquets-title">
    <div class="container banquets__grid">
      <div class="banquets__text">
        <p class="hand">отметим вместе</p>
        <h2 class="section__title" id="banquets-title">Банкеты до&nbsp;${b.capacity_max}&nbsp;гостей</h2>
        <ul class="chips">${occ.map((o) => `<li class="chip">${o}</li>`).join('')}</ul>
        <ul class="banquets__features">
          <li>${icon('users')}<span>${typo(`Принимаем и небольшие компании, и до ${b.capacity_max} человек`)}</span></li>
          <li>${icon('flame')}<span>${typo('Фирменное банкетное меню и блюда с мангала')}</span></li>
          <li>${icon('clock')}<span>${typo('Режим работы можно продлить под ваше мероприятие')}</span></li>
        </ul>
        ${
          rv
            ? `<figure class="quote"><blockquote class="quote__text"><p>${typo(rv.text.replace(/\s+/g, ' ').trim())}</p></blockquote><figcaption class="quote__author">${esc(rv.author)}, отзыв во&nbsp;ВКонтакте</figcaption></figure>`
            : ''
        }
        <a class="button button--primary button--l" href="${tel(p)}" data-goal="call" data-goal-place="banquets">${icon('phone')}<span>Обсудить банкет</span></a>
      </div>
      <div class="banquets__media">
        <div class="plate plate--l">${img('6281107', 'Сет «Люля-кебаб» с мангала')}</div>
        <div class="plate plate--s">${img('10252196', 'Шашлык в хлебе')}</div>
      </div>
    </div>
  </section>`;
};
