// design-loop: одна лента через всё письмо (холсты .thread-hero и .thread canvas).
// Проверяет: лента нарисована, шевелится со временем, холсты переставляются под прокрутку, страница не шире окна,
// цена для основного потока (с лентой и при «меньше движения», где цикла нет), на телефоне — с процессором ×4 медленнее,
// при «меньше движения» лента стоит, но нарисована. Запуск: node .design/checks/thread.mjs [uz/|tg/]
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const URL = 'http://127.0.0.1:8765/v3/a/' + (process.argv[2] || '');
const b = await chromium.launch();
const out = {};
const wait = ms => new Promise(r => setTimeout(r, ms));
const goto = (p, sel) => p.evaluate(s => { const el = document.querySelector(s); scrollTo({ top: el.getBoundingClientRect().top + scrollY - 60, behavior: 'instant' }); }, sel);
// сколько пикселей холста закрашено и «отпечаток» картинки — чтобы увидеть, что лента есть и меняется
const ink = (p, sel) => p.evaluate(s => {
  const cs = [...document.querySelectorAll(s)].filter(c => !c.hidden);
  let n = 0, h = 0;
  for (const c of cs) { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    for (let i = 3; i < d.length; i += 4 * 7) if (d[i] > 8) { n++; h = (h * 31 + d[i] + d[i - 1]) % 1000003; } }
  return { canvases: cs.length, inked: n, hash: h };
}, sel);

for (const [w, h, cpu] of [[1440, 900, 1], [390, 844, 4]]) {
  const R = out[w] = {};
  for (const reduce of [false, true]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: reduce ? 'reduce' : 'no-preference' });
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await p.goto(URL, { waitUntil: 'networkidle' }); await wait(700);
    const cdp = await ctx.newCDPSession(p);
    if (cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
    await cdp.send('Performance.enable');
    const S = R[reduce ? 'reduced' : 'moving'] = { errors: errs };
    // 1. первый экран: лента есть и шевелится (или стоит при «меньше движения»)
    const a0 = await ink(p, '.thread-hero'); await wait(1500); const a1 = await ink(p, '.thread-hero');
    S.hero = { inked: a1.inked, changes: a0.hash !== a1.hash };
    // 2. в главах: холсты стоят там, где экран, лента на них есть
    const where = {};
    for (const sel of ['#consult', '#program', '#family', '#contact']) {
      await goto(p, sel); await wait(400);
      const t0 = await ink(p, '.thread canvas'); await wait(1200); const t1 = await ink(p, '.thread canvas');
      where[sel] = { canvases: t1.canvases, inked: t1.inked, changes: t0.hash !== t1.hash };
    }
    S.where = where;
    S.docW = await p.evaluate(() => document.documentElement.scrollWidth);
    // 3. цена: 300 кадров на главе с лентой
    await goto(p, '#consult'); await wait(300);
    const m0 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
    S.frames = await p.evaluate(() => new Promise(r => {
      let n = 0, slow = 0, last = performance.now(), fr = 0, worst = 0;
      const po = new PerformanceObserver(l => n += l.getEntries().length); po.observe({ type: 'longtask' });
      const tick = t => { const d = t - last; if (fr) { worst = Math.max(worst, d); if (d > 34) slow++; } last = t; if (++fr < 300) requestAnimationFrame(tick); else { po.disconnect(); r({ longtasks: n, slowFrames: slow, worstMs: Math.round(worst) }); } };
      requestAnimationFrame(tick);
    }));
    const m1 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
    S.cost = { seconds: +(m1.Timestamp - m0.Timestamp).toFixed(2), scriptSec: +(m1.ScriptDuration - m0.ScriptDuration).toFixed(3), taskSec: +(m1.TaskDuration - m0.TaskDuration).toFixed(3) };
    await ctx.close();
  }
}
await b.close();
console.log(JSON.stringify(out, null, 1));
