// О кафе (п. 9): преимущества + галерея реальных фото (сетка + лайтбокс)
import { esc, typo, icon, price } from './_util.js';

const GALLERY = ['7673283', '10856247', '11069417', '6278914', '7805432', '10124465'];

export default ({ cafe, photos, menu }) => {
  const byId = Object.fromEntries(menu.items.map((i) => [i.id, i]));
  const adv = [
    ['flame', 'Мангал и гриль', 'Шашлыки «Империи мяса», люля-кебаб, стейки и овощи на углях'],
    ['dumpling', 'Самолепные пельмени', 'Лепим сами, по-домашнему'],
    [
      'coins',
      `Обед за ${price(cafe.business_lunch.price_cafe)}`,
      'Три блюда, хлеб и чай — каждый день новое меню',
    ],
    ['users', `Зал до ${cafe.banquets.capacity_max} гостей`, 'Для семейных праздников и корпоративов'],
  ];
  return `
  <section class="section about" id="about" aria-labelledby="about-title">
    <div class="container">
      <header class="section__head">
        <p class="hand">от создателей «Империи мяса»</p>
        <h2 class="section__title" id="about-title">О кафе</h2>
        <div class="divider" aria-hidden="true"></div>
        <p class="section__lead">${typo(`Кафе на ${cafe.address} в Верхнем Уфалее. Готовим каждый день: обеды, пиццу, бургеры и блюда с мангала — в кафе и с доставкой.`)}</p>
      </header>
      <ul class="features">
        ${adv.map(([ic, t, d]) => `<li class="feature">${icon(ic, 'feature__icon')}<h3 class="feature__title">${t}</h3><p class="feature__text">${typo(d)}</p></li>`).join('')}
      </ul>
      <ul class="gallery">
        ${GALLERY.map((id) => {
          const ph = photos.photos[id];
          const name = byId[id]?.name ?? ph.alt;
          return `<li><button class="gallery__item" type="button" data-lightbox data-src="${ph.file}-480.webp" data-caption="${esc(name)}" aria-label="Фото: ${esc(name)}"><img src="${ph.file}-480.webp" width="480" height="480" alt="${esc(name)}" loading="lazy" decoding="async"></button></li>`;
        }).join('')}
      </ul>
    </div>
  </section>`;
};
