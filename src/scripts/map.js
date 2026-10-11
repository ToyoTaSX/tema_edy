// Карта-фасад: iframe Яндекс Карт только по клику (п. 10.9)
export function initMap() {
  const map = document.querySelector('[data-map]');
  const btn = map?.querySelector('[data-map-load]');
  if (!map || !btn) return;
  btn.hidden = false;
  btn.addEventListener('click', () => {
    const f = document.createElement('iframe');
    f.src = map.dataset.src;
    f.title = 'Карта: кафе «Тема еды», Верхний Уфалей, ул. Гагарина, 3';
    f.loading = 'lazy';
    f.allowFullscreen = true;
    map.append(f);
    map.querySelector('.map__facade')?.remove();
  });
}
