import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch();
for (const lang of ['', 'uz/', 'tg/']) for (const w of [360, 390, 1440]) {
  const p = await b.newPage({ viewport: { width: w, height: 800 } });
  await p.goto('http://127.0.0.1:8765/v3/a/' + lang, { waitUntil: 'networkidle' });
  const r = await p.evaluate(() => {
    const box = s => document.querySelector(s).getBoundingClientRect();
    const logo = box('.logo'), lang = box('.lang'), nav = box('.top-nav');
    // текст кнопки шире самой кнопки?
    const tight = [...document.querySelectorAll('.btn')].filter(b => b.offsetParent).map(b => { const rg = document.createRange(); rg.selectNodeContents(b); const t = rg.getBoundingClientRect(), o = b.getBoundingClientRect(); return [b.innerText.trim(), Math.round(t.width), Math.round(o.width)]; }).filter(([n, t, o]) => t > o - 20);
    return { overlap: logo.right > lang.left - 4, logoR: Math.round(logo.right), langL: Math.round(lang.left), navR: Math.round(nav.right), vw: innerWidth, docW: document.documentElement.scrollWidth, tight };
  });
  console.log((lang || 'ru/') + w, JSON.stringify(r));
  if (w === 390) await p.screenshot({ path: `/tmp/claude-0/-home-user/e583a4a9-489a-5595-ba5a-8bc3c3de4f3a/scratchpad/lang/hdr-${(lang||'ru/').replace('/','')}.png`, clip: { x: 0, y: 0, width: 390, height: 90 } });
  await p.close();
}
await b.close();
