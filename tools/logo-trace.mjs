// Векторизация логотипа: brand/logo/source/mask.png (ч/б маска с фото сообщества ВК) → brand/logo/*.svg, src/icons/*.svg
// Маска без подписи готовится из полной: всё ниже y=712 закрашивается белым (см. build/logo/mask-nosub.png)
// Запуск: node tools/logo-trace.mjs   (нужен пакет potrace: npm i --no-save potrace)
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import potrace from 'potrace';

import { execFileSync as run } from 'node:child_process';
fs.mkdirSync('build/logo', { recursive: true });
run('python3', [
  '-c',
  "from PIL import Image, ImageDraw; im=Image.open('brand/logo/source/mask.png').convert('L'); ImageDraw.Draw(im).rectangle([0,712,im.width,im.height], fill=255); im.save('build/logo/mask-nosub.png')",
]);
const variants = {
  full: { file: 'brand/logo/source/mask.png' },
  'no-subtitle': { file: 'build/logo/mask-nosub.png' },
};
const trace = (file) =>
  new Promise((res, rej) =>
    potrace.trace(
      file,
      { threshold: 128, turdSize: 12, optTolerance: 0.35, alphaMax: 1, color: 'currentColor' },
      (e, svg) => (e ? rej(e) : res(svg)),
    ),
  );

for (const [name, v] of Object.entries(variants)) {
  const svg = await trace(v.file);
  const d = [...svg.matchAll(/ d="([^"]+)"/g)].map((m) => m[1]).join(' ');
  fs.mkdirSync('brand/logo', { recursive: true });
  fs.writeFileSync(`build/logo/${name}.raw.svg`, svg);
  fs.writeFileSync(`build/logo/${name}.path.txt`, d);
}
console.log('traced', Object.keys(variants).join(', '));
execFileSync('python3', ['tools/logo-finish.py'], { stdio: 'inherit' });
