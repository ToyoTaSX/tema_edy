// Отзывы: показываем 3, остальные — по кнопке «Ещё отзывы» (п. 10.6.1). Без JS видны все.
export function initReviews() {
  const extra = document.querySelectorAll('[data-review-extra]');
  const btn = document.querySelector('[data-reviews-more]');
  if (!extra.length || !btn) return;
  extra.forEach((el) => (el.hidden = true));
  btn.hidden = false;
  btn.addEventListener('click', () => {
    extra.forEach((el) => (el.hidden = false));
    btn.hidden = true;
    extra[0].querySelector('blockquote')?.setAttribute('tabindex', '-1');
    extra[0].querySelector('blockquote')?.focus();
  });
}
