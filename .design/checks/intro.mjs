// design-loop: заставка /v3/a/ (знак VECTOR проступает, пока грузится первый экран).
// Проверяет: на медленной сети знак рисуется с первым видимым кадром и уходит после фото первого экрана (LCP);
// на быстрой — знак не рисуется, заставка гаснет; второй раз за сеанс, по ссылке с якорем, при «меньше движения»
// и без скрипта — заставки нет; телефон качает одну картинку первого экрана. Запуск: node .design/checks/intro.mjs [uz/|tg/]
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const BASE = 'http://127.0.0.1:8765/v3/a/' + (process.argv[2] || '');
const slow4g = { offline: false, latency: 150, downloadThroughput: 1.6e6 / 8, uploadThroughput: 750e3 / 8 };
const probe = () => {
  const log = window.__ilog = []; let last = '';
  const iv = setInterval(() => { const el = document.getElementById('intro'); const c = el ? el.className.replace('intro', '').trim() || 'показана' : 'убрана'; if (c !== last) { log.push(Math.round(performance.now()) + ':' + c); last = c; } if (!el && document.body) clearInterval(iv); }, 10);
  new PerformanceObserver(l => { for (const e of l.getEntries()) window.__lcp = Math.round(e.startTime); }).observe({ type: 'largest-contentful-paint', buffered: true });
};
const b = await chromium.launch();
async function run(name, { w = 390, h = 844, net, cpu = 1, url = BASE, reduce = false, js = true }) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: reduce ? 'reduce' : 'no-preference', javaScriptEnabled: js });
  const p = await ctx.newPage(); if (js) await p.addInitScript(probe);
  const cdp = await ctx.newCDPSession(p); await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  if (net) await cdp.send('Network.emulateNetworkConditions', net);
  if (cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
  const hero = new Set(); p.on('request', r => { const m = r.url().match(/media\/(hA-[lp]\.webp)/); if (m) hero.add(m[1]); });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto(url, { waitUntil: 'load', timeout: 60000 }); await p.waitForTimeout(4500);
  const r = js ? await p.evaluate(() => ({ fp: Math.round(performance.getEntriesByName('first-paint')[0]?.startTime || 0), lcp: window.__lcp, log: window.__ilog.join(' → '), left: !!document.getElementById('intro') }))
               : await p.evaluate(() => ({ display: getComputedStyle(document.getElementById('intro')).display }));
  r.hero = [...hero].join(','); r.errors = errs;
  if (name.startsWith('сеанс')) { await p.goto(url, { waitUntil: 'load' }); await p.waitForTimeout(300); r.again = await p.evaluate(() => { const el = document.getElementById('intro'); return el ? getComputedStyle(el).display : 'убрана'; }); }
  console.log(name.padEnd(22), JSON.stringify(r)); await ctx.close();
}
await run('медленно, телефон ×4', { net: slow4g, cpu: 4 });
await run('медленно, 1440', { w: 1440, h: 900, net: slow4g });
await run('быстро, 1440', { w: 1440, h: 900 });
await run('сеанс: второй заход', { net: slow4g });
await run('ссылка с якорем', { url: BASE + '#contact', net: slow4g });
await run('меньше движения', { reduce: true, net: slow4g });
await run('без скрипта', { js: false });
await b.close();
