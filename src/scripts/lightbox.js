// Лайтбокс на <dialog> (п. 10.7): Esc, клик по фону, возврат фокуса
export function initLightbox() {
  const dlg = document.querySelector('[data-lightbox-dialog]');
  if (!dlg || typeof dlg.showModal !== 'function') return;
  const fig = dlg.querySelector('.lightbox__fig');
  const img = document.createElement('img');
  img.className = 'lightbox__img';
  img.width = 480;
  img.height = 480;
  fig.prepend(img);
  const cap = dlg.querySelector('[data-lightbox-caption]');
  let opener = null;

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lightbox]');
    if (!btn) return;
    opener = btn;
    img.src = btn.dataset.src;
    img.alt = btn.dataset.caption || '';
    cap.textContent = btn.dataset.caption || '';
    dlg.showModal();
    document.body.classList.add('no-scroll');
  });
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg || e.target.closest('[data-lightbox-close]')) dlg.close();
  });
  dlg.addEventListener('close', () => {
    document.body.classList.remove('no-scroll');
    opener?.focus();
  });
}
