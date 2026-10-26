// контраст текста по пикселям кадра: последний абзац тёмной и мятной полосы и подписи, 390 и 1440, три языка
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch();
for (const lang of ['', 'uz/', 'tg/']) for (const [w,h] of [[390,844],[1440,900]]) {
  const p = await b.newPage({ viewport:{width:w,height:h} });
  await p.goto('http://127.0.0.1:8765/v3/a/' + lang, { waitUntil:'networkidle' });
  const out = [];
  for (const sel of ['#program .txt p:last-of-type', '#family .txt p:last-of-type', '#contact .ps', '#contact .contacts li:last-child']) {
    const r = await p.evaluate(s => { const el = document.querySelector(s); el.scrollIntoView({block:'center'}); const x = el.getBoundingClientRect(); return {x:x.left, y:x.top, w:x.width, h:x.height, color:getComputedStyle(el).color}; }, sel);
    await p.waitForTimeout(700);
    const r2 = await p.evaluate(s => { const x = document.querySelector(s).getBoundingClientRect(); return {x:x.left, y:x.top, w:x.width, h:x.height}; }, sel);
    // фон: пиксели над/под строками без текста — берём кадр, прячем текст, снимаем фон
    await p.evaluate(s => document.querySelector(s).style.visibility = 'hidden', sel);
    const shot = await p.screenshot({ clip: { x: Math.max(0, r2.x), y: Math.max(0, r2.y), width: Math.max(1, Math.min(r2.w, w - r2.x)), height: Math.max(1, r2.h) } });
    await p.evaluate(s => document.querySelector(s).style.visibility = '', sel);
    out.push([sel, r.color, shot.toString('base64')]);
  }
  console.log(JSON.stringify({ page: (lang||'ru/') + w, out }));
  await p.close();
}
await b.close();
