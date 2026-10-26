import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch();
for (const lang of ['', 'uz/', 'tg/']) for (const w of [1024, 1366, 1440]) {
  const p = await b.newPage({ viewport: { width: w, height: 800 } });
  await p.goto('http://127.0.0.1:8765/v3/a/' + lang, { waitUntil: 'networkidle' });
  const r = await p.evaluate(() => { const bs = [...document.querySelectorAll('.hero-cta .btn')].map(b => Math.round(b.getBoundingClientRect().top)); const t = document.querySelector('.open .text').getBoundingClientRect(); return { tops: bs, rows: new Set(bs).size, textBottom: Math.round(t.bottom), heroBottom: Math.round(document.querySelector('.open').getBoundingClientRect().bottom) }; });
  console.log((lang || 'ru/') + w, JSON.stringify(r)); await p.close();
}
await b.close();
