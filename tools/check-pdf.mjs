// CI: PDF-меню должно быть пересобрано после изменения content/menu.json или cafe.json
import fs from 'node:fs';
import crypto from 'node:crypto';

const h = crypto.createHash('sha256');
for (const f of ['menu.json', 'cafe.json']) h.update(fs.readFileSync(`content/${f}`));
const now = h.digest('hex');
const saved = fs.readFileSync('public/menu/tema-edy-menu.source.sha256', 'utf8').trim();
if (now !== saved) {
  console.error('PDF-меню устарело: данные в content/ изменились. Выполните: npm run menu:pdf');
  process.exit(1);
}
console.log('PDF-меню актуально');
