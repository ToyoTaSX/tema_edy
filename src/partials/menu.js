// Полное меню в HTML (п. 10.5, П1): хиты, иконки-якоря, аккордеон категорий, фото у каждого блюда
import fs from 'node:fs';
import path from 'node:path';
import { esc, typo, icon, price, dishImg, plural, mainPhone, tel, ruDate } from './_util.js';

const PDF = path.join(import.meta.dirname, '..', '..', 'public', 'menu', 'tema-edy-menu.pdf');

// Хиты — только реальные фото кафе (п. 0.1, 10.4)
const HITS = ['7017001', '10252196', '6281107', '11069417', '7673283', '6318582'];
const OPEN_BY_DEFAULT = ['soups', 'salads'];

const dishRow = (it) => {
  const meta = [
    it.portion && `<span class="dish__portion">${typo(it.portion)}</span>`,
    it.composition && typo(it.composition),
  ]
    .filter(Boolean)
    .join(' · ');
  const notes = it.notes.filter((n) => !/предзаказ/i.test(n) || n.length > 12);
  return `
    <li class="dish">
      ${
        it.image
          ? `<button class="dish__photo" type="button" data-lightbox data-src="${it.image.src}-480.webp" data-caption="${esc(it.name)}" aria-label="Фото: ${esc(it.name)}">${dishImg(it.image, 160, { cls: 'dish__img' })}</button>`
          : ''
      }
      <div class="dish__body">
        <div class="dish__head">
          <h4 class="dish__name">${typo(it.name)}${it.preorder ? ' <span class="badge badge--outline">Предзаказ</span>' : ''}</h4>
          <p class="dish__price">${price(it.price)}${it.price_unit ? `<small> ${esc(it.price_unit)}</small>` : ''}</p>
        </div>
        ${meta ? `<p class="dish__meta">${meta}</p>` : ''}
        ${notes.length ? `<p class="dish__note">${notes.map(typo).join('. ')}</p>` : ''}
      </div>
    </li>`;
};

const hitCard = (it) => `
  <li class="hit">
    <button class="hit__photo plate" type="button" data-lightbox data-src="${it.image.src}-480.webp" data-caption="${esc(it.name)}" aria-label="Фото: ${esc(it.name)}">
      ${dishImg(it.image, 480, { cls: 'hit__img' })}
    </button>
    <div class="hit__body">
      <span class="badge badge--gold">Хит</span>
      <h3 class="hit__name">${typo(it.name)}</h3>
      <p class="hit__meta">${[it.portion && typo(it.portion), typo(it.composition)].filter(Boolean).join(' · ')}</p>
      <p class="hit__price">${price(it.price)}${it.price_unit ? `<small> ${esc(it.price_unit)}</small>` : ''}</p>
    </div>
  </li>`;

export default ({ cafe, menu }) => {
  const p = mainPhone(cafe);
  const items = menu.items.filter((i) => i.category !== 'lunch');
  const cats = menu.categories.filter((c) => c.id !== 'lunch' && c.count > 0);
  const byId = Object.fromEntries(menu.items.map((i) => [i.id, i]));
  const hits = HITS.map((id) => byId[id]).filter(Boolean);
  const pdfMb = (fs.statSync(PDF).size / 1024 / 1024).toFixed(1).replace('.', ',');

  return `
  <section class="section menu" id="menu" aria-labelledby="menu-title">
    <div class="container">
      <header class="section__head">
        <p class="hand">готовим с&nbsp;душой</p>
        <h2 class="section__title" id="menu-title">Меню</h2>
        <div class="divider" aria-hidden="true"></div>
        <p class="section__lead">${items.length}&nbsp;${plural(items.length, ['блюдо', 'блюда', 'блюд'])} — от&nbsp;супов до&nbsp;шашлыка на&nbsp;углях. Заказ по&nbsp;телефону, в&nbsp;кафе или с&nbsp;доставкой.</p>
      </header>

      <h3 class="visually-hidden">Хиты</h3>
      <ul class="hits">${hits.map(hitCard).join('')}</ul>

      <nav class="cats" id="menu-cats" aria-label="Категории меню">
        <ul class="cats__list">
          ${cats
            .map(
              (c) =>
                `<li><a class="cats__link" href="#menu-${c.id}" data-cat-link>${icon('cat-' + c.id, 'cats__icon')}<span class="cats__title">${esc(c.title)}</span><span class="cats__count">${c.count}</span></a></li>`,
            )
            .join('')}
        </ul>
      </nav>

      <div class="menu__list">
        ${cats
          .map(
            (c) => `
        <details class="menu-cat" id="menu-${c.id}"${OPEN_BY_DEFAULT.includes(c.id) ? ' open' : ''}>
          <summary class="menu-cat__summary">
            ${icon('cat-' + c.id, 'menu-cat__icon')}
            <span class="menu-cat__title">${esc(c.title)}</span>
            <span class="menu-cat__count">${c.count}</span>
            ${icon('chevron', 'menu-cat__chevron')}
          </summary>
          <ul class="menu-cat__items">${items
            .filter((i) => i.category === c.id)
            .map(dishRow)
            .join('')}</ul>
          <a class="menu-cat__up" href="#menu-cats">${icon('arrow-up')}К&nbsp;категориям</a>
        </details>`,
          )
          .join('')}
      </div>

      <div class="menu__footer">
        <div class="menu__actions">
          <a class="button button--primary" href="${tel(p)}" data-goal="call" data-goal-place="menu">${icon('phone')}<span>Позвонить и&nbsp;заказать</span></a>
          <a class="button button--outline" href="menu/tema-edy-menu.pdf" target="_blank" rel="noopener" data-goal="pdf">${icon('file')}<span>Меню для печати (PDF, ${pdfMb}&nbsp;МБ)</span><span class="visually-hidden"> (откроется в новой вкладке)</span></a>
        </div>
        <p class="menu__disclaimer">Меню актуально на&nbsp;${ruDate(menu.updated)}. ${typo(menu.disclaimer)}</p>
      </div>
    </div>
  </section>`;
};
