// Плашка учебного проекта (site.demo.enabled): честно говорим, что это не официальный сайт кафе
import { isDemo } from './_util.js';

export default ({ cafe }) =>
  isDemo(cafe)
    ? `<p class="demo-strip">Учебный проект · не&nbsp;официальный сайт кафе</p>`
    : '';
