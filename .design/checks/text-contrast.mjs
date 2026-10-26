// контраст текста глав к фону под ним — по пикселям кадра (фон под текстом: бумага, полосы, лента).
// Для каждого абзаца и заголовка: текст прячется, снимается его прямоугольник, берутся худшие 5 % пикселей фона.
// Запуск: node .design/checks/text-contrast.mjs [uz/|tg/] | python3 .design/checks/contrast-pixels.py
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const lang = process.argv[2] || '';
const b = await chromium.launch();
for (const [w, h] of [[390, 844], [1440, 900]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
  await p.goto('http://127.0.0.1:8765/v3/a/' + lang, { waitUntil: 'networkidle' });
  const n = await p.evaluate(() => document.querySelectorAll('main .txt p, main .txt h2').length);
  const out = [];
  for (let i = 0; i < n; i++) {
    const r = await p.evaluate(i => { const el = document.querySelectorAll('main .txt p, main .txt h2')[i]; el.scrollIntoView({ block: 'center' }); return { color: getComputedStyle(el).color }; }, i);
    await p.waitForTimeout(250);
    const box = await p.evaluate(i => { const el = document.querySelectorAll('main .txt p, main .txt h2')[i]; el.style.visibility = 'hidden'; const x = el.getBoundingClientRect(); return { x: x.left, y: x.top, w: x.width, h: x.height, id: el.closest('section').id + ' ' + el.tagName.toLowerCase() + i }; }, i);
    await p.waitForTimeout(80);
    const shot = await p.screenshot({ clip: { x: Math.max(0, box.x), y: Math.max(0, box.y), width: Math.max(1, Math.min(box.w, w - box.x)), height: Math.max(1, Math.min(box.h, h - box.y)) } });
    await p.evaluate(i => { document.querySelectorAll('main .txt p, main .txt h2')[i].style.visibility = ''; }, i);
    out.push([box.id, r.color, shot.toString('base64')]);
  }
  console.log(JSON.stringify({ page: (lang || 'ru/') + w, out }));
  await p.close();
}
await b.close();
