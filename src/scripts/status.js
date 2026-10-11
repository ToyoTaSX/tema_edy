// Статус «Открыто до 21:00 / Откроемся в 9:00» по часовому поясу кафе (п. 0.7, 10.3, 10.12)
/** Текущее время в часовом поясе кафе: { day: 0..6, min: минуты от полуночи } */
export function nowIn(tz, date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t)?.value;
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { day, min: (Number(get('hour')) % 24) * 60 + Number(get('minute')) };
}

const toMin = (s) => {
  const [h, m] = s.split(':').map(Number);
  return h * 60 + m;
};
const fmt = (s) => s.replace(/^0/, '');

/** Вычислить статус по расписанию */
export function computeStatus(schedule, date = new Date()) {
  const { day, min } = nowIn(schedule.tz, date);
  const [from, to] = schedule.days[day];
  if (min >= toMin(from) && min < toMin(to))
    return { open: true, text: `Открыто до ${fmt(to)}`, short: 'Позвонить' };
  if (min < toMin(from))
    return {
      open: false,
      text: `Закрыто · откроемся сегодня в ${fmt(from)}`,
      short: `Позвонить · с ${fmt(from)}`,
    };
  const nf = fmt(schedule.days[(day + 1) % 7][0]);
  return { open: false, text: `Закрыто · откроемся завтра в ${nf}`, short: `Позвонить · с ${nf}` };
}

export function initStatus() {
  const els = document.querySelectorAll('[data-status]');
  if (!els.length) return;
  let schedule;
  try {
    schedule = JSON.parse(els[0].dataset.schedule);
  } catch {
    return;
  }
  const update = () => {
    // для тестов: ?now=2026-10-11T22:30:00%2B05:00
    const q = new URLSearchParams(location.search).get('now');
    const st = computeStatus(schedule, q ? new Date(q) : new Date());
    for (const el of els) {
      el.classList.toggle('status--open', st.open);
      el.classList.toggle('status--closed', !st.open);
      const t = el.querySelector('.status__text');
      if (t) t.textContent = st.text;
    }
    const fab = document.querySelector('[data-fab-label]');
    if (fab) fab.textContent = st.short;
  };
  update();
  setInterval(update, 60_000);
}
