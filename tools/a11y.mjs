// Проверка доступности axe-core (WCAG 2.2 AA) на собранном сайте: index, privacy, 404 — mobile и desktop
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';

const port = 4176;
const server = spawn('npx', ['vite', 'preview', '--port', String(port), '--strictPort'], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 2500));
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
let failed = 0;
try {
  for (const pagePath of ['', 'privacy.html', '404.html']) {
    for (const vp of [
      { width: 390, height: 844 },
      { width: 1440, height: 900 },
    ]) {
      const ctx = await browser.newContext({ viewport: vp });
      const page = await ctx.newPage();
      await page.goto(`http://localhost:${port}/${pagePath}`, { waitUntil: 'networkidle' });
      const res = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const bad = res.violations.filter((v) => ['critical', 'serious'].includes(v.impact));
      const label = `/${pagePath} @${vp.width}`;
      if (bad.length) {
        failed += bad.length;
        for (const v of bad)
          console.error(
            `✗ ${label}: [${v.impact}] ${v.id} — ${v.help} (${v.nodes.length})\n   ${v.nodes
              .slice(0, 3)
              .map((n) => n.target.join(' '))
              .join('\n   ')}`,
          );
      } else
        console.log(`✓ ${label}: критических и серьёзных нарушений нет (${res.violations.length} мелких)`);
      await ctx.close();
    }
  }
} finally {
  await browser.close();
  server.kill();
}
process.exit(failed ? 1 : 0);
