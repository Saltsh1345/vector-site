// design-loop: движение лент — идёт ли оно, спит ли вне экрана, на видеокарте ли, сколько стоит основному потоку,
// выключено ли при «меньше движения». Запуск: node .design/checks/motion.mjs [uz/|tg/]
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const URL = 'http://127.0.0.1:8765/v3/a/' + (process.argv[2] || '');
const b = await chromium.launch();
const out = {};
const wait = ms => new Promise(r => setTimeout(r, ms));
const frames = p => p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));

const state = p => p.evaluate(() => document.getAnimations()
  .filter(a => a.animationName === 'breathe')
  .map(a => ({ el: a.effect.target.className || 'ribbon', play: a.playState, t: Math.round(a.currentTime) })));
const pose = (p, sel) => p.evaluate(s => { const cs = getComputedStyle(document.querySelector(s)); return cs.translate + ' | ' + cs.rotate; }, sel);
const goto = (p, sel) => p.evaluate(s => { const el = document.querySelector(s); scrollTo({ top: el.getBoundingClientRect().top + scrollY - 80, behavior: 'instant' }); }, sel);

for (const [w, h] of [[1440, 900], [390, 844]]) {
  const R = out[w] = {};
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  await p.goto(URL, { waitUntil: 'networkidle' }); await wait(800);

  // 1. все ленты получили анимацию; на первом экране идёт только лента первого экрана (и, может быть, соседняя)
  let s = await state(p);
  R.count = s.length;
  R.runningAtHero = s.filter(x => x.play === 'running').map(x => x.el);
  // 2. движение настоящее: поза ленты первого экрана меняется со временем (не конечный кадр, а ход времени)
  const a0 = await pose(p, '.open .ribbon'); await wait(2500); await frames(p); const a1 = await pose(p, '.open .ribbon');
  R.heroPose = [a0, a1]; R.heroMoves = a0 !== a1;
  // 3. у тёмной полосы и у подписи: там лента идёт, первый экран спит
  await goto(p, '#program'); await wait(600); await frames(p);
  s = await state(p); R.runningAtProgram = s.filter(x => x.play === 'running').map(x => x.el);
  await goto(p, '#contact'); await wait(600);
  const c0 = await pose(p, '.sign .rib'); await wait(2500); await frames(p); const c1 = await pose(p, '.sign .rib');
  s = await state(p); R.runningAtSign = s.filter(x => x.play === 'running').map(x => x.el); R.signMoves = c0 !== c1;

  // 4. видеокарта или основной поток: трассировка, анимации, которые браузер не смог вынести на композитор
  await goto(p, '#listen'); await wait(400);
  await b.startTracing(p, { categories: ['blink.animations', 'devtools.timeline', 'cc', 'disabled-by-default-devtools.timeline'] });
  await wait(3000);
  const trace = JSON.parse((await b.stopTracing()).toString());
  const fails = trace.traceEvents.filter(e => e.args && e.args.data && e.args.data.compositeFailed);
  R.compositeFailed = fails.map(e => ({ name: e.name, why: e.args.data.compositeFailed, props: e.args.data.unsupportedProperties }));
  R.compositedAnimations = trace.traceEvents.filter(e => e.name === 'Animation' && e.ph === 'b').length;

  // 5. цена для основного потока: 5 с покоя на главе с лентой — с движением и без
  const cdp = await ctx.newCDPSession(p); await cdp.send('Performance.enable');
  const cost = async () => {
    const m0 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
    const long = await p.evaluate(() => new Promise(r => {
      let n = 0, slow = 0, last = performance.now(), fr = 0;
      const po = new PerformanceObserver(l => n += l.getEntries().length); po.observe({ type: 'longtask' });
      const tick = t => { if (t - last > 34) slow++; last = t; fr++; if (fr < 300) requestAnimationFrame(tick); else { po.disconnect(); r({ longtasks: n, slowFrames: slow, frames: fr }); } };
      requestAnimationFrame(tick);
    }));
    const m1 = Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m => [m.name, m.value]));
    const d = k => +(m1[k] - m0[k]).toFixed(k.endsWith('Count') ? 0 : 3);
    return { ...long, taskSec: d('TaskDuration'), styleRecalcs: d('RecalcStyleCount'), layouts: d('LayoutCount'), scriptSec: d('ScriptDuration') };
  };
  R.costMoving = await cost();
  await p.addStyleTag({ content: '.rib,.open .ribbon{animation:none!important}' });
  R.costStill = await cost();
  await ctx.close();

  // 6. «меньше движения»: анимации нет, поворот ленты остаётся своим
  const rc = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
  const rp = await rc.newPage(); await rp.goto(URL, { waitUntil: 'networkidle' }); await wait(500);
  R.reduced = { animations: (await state(rp)).length, heroPose: await pose(rp, '.open .ribbon') };
  await rc.close();
}
await b.close();
console.log(JSON.stringify(out, null, 1));
