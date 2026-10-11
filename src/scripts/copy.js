// «Скопировать номер» на desktop (п. 10.6): на устройствах без мыши звонят по tel:
export function initCopy() {
  const toast = document.querySelector('[data-toast]');
  const btns = document.querySelectorAll('[data-copy]');
  if (!btns.length || !navigator.clipboard || !window.matchMedia('(hover: hover)').matches) return;
  let timer;
  for (const b of btns) {
    b.hidden = false;
    b.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(b.dataset.copy);
        if (toast) {
          toast.textContent = 'Номер скопирован';
          toast.classList.add('toast--visible');
          clearTimeout(timer);
          timer = setTimeout(() => toast.classList.remove('toast--visible'), 2200);
        }
      } catch {
        /* буфер недоступен — номер виден текстом */
      }
    });
  }
}
