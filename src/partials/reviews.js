// Отзывы (п. 10.6.1): сводка с источником, 3 видимых + «Ещё отзывы»
import { esc, typo, icon } from './_util.js';

const months = [
  'января',
  'февраля',
  'марта',
  'апреля',
  'мая',
  'июня',
  'июля',
  'августа',
  'сентября',
  'октября',
  'ноября',
  'декабря',
];
const human = (iso) => {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d}&nbsp;${months[m - 1]} ${y}`;
};

export default ({ cafe, reviews }) => {
  const list = reviews.reviews.filter((r) => r.for_site && !/юбилей/i.test(r.text));
  const src = 'https://vk.ru/reviews-99941253';
  return `
  <section class="section section--alt reviews" id="reviews" aria-labelledby="reviews-title">
    <div class="container">
      <header class="section__head">
        <p class="hand">нам пишут</p>
        <h2 class="section__title" id="reviews-title">Отзывы</h2>
        <div class="divider" aria-hidden="true"></div>
        <p class="rating"><span class="rating__stars" aria-hidden="true">${icon('star').repeat(5)}</span>
          <a href="${src}" target="_blank" rel="noopener"><b>${String(cafe.rating_vk.value).replace('.', ',')}</b> · ${cafe.rating_vk.count}&nbsp;отзывов во&nbsp;ВКонтакте<span class="visually-hidden"> (откроется в новой вкладке)</span></a></p>
      </header>
      <ul class="reviews__list" data-reviews>
        ${list
          .map(
            (r, i) => `
        <li class="review"${i >= 3 ? ' data-review-extra' : ''}>
          <figure class="review__fig">
            <figcaption class="review__head"><span class="review__avatar" aria-hidden="true">${esc(r.author[0])}</span><span><b class="review__author">${esc(r.author)}</b><time class="review__date" datetime="${r.date}">${human(r.date)}</time></span></figcaption>
            <blockquote class="review__text"><p>${typo(r.text.replace(/\s+/g, ' ').trim())}</p></blockquote>
          </figure>
        </li>`,
          )
          .join('')}
      </ul>
      <div class="section__cta">
        <button class="button button--outline" type="button" data-reviews-more hidden>Ещё отзывы</button>
        <a class="link-arrow" href="${src}" target="_blank" rel="noopener">Все отзывы во&nbsp;ВКонтакте${icon('arrow-right')}<span class="visually-hidden"> (откроется в новой вкладке)</span></a>
      </div>
    </div>
  </section>`;
};
