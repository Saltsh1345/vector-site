// design-loop: скорость для выдачи: LCP, CLS, суммарная блокировка (TBT по длинным задачам) — телефон, медленная сеть, процессор ×4
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch();
for (const L of ['', 'uz/', 'tg/']) for (const [name, w, h, cpu, net] of [['телефон 4G', 390, 844, 4, { latency: 150, down: 1.6e6 / 8, up: 750e3 / 8 }], ['компьютер', 1440, 900, 1, null]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  if (net) await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: net.latency, downloadThroughput: net.down, uploadThroughput: net.up });
  if (cpu > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu });
  await p.addInitScript(() => {
    window.__m = { lcp: 0, lcpEl: '', cls: 0, tbt: 0, fcp: 0 };
    new PerformanceObserver(l => { for (const e of l.getEntries()) { window.__m.lcp = e.startTime; window.__m.lcpEl = (e.element && (e.element.tagName + '.' + (e.element.className || ''))) || e.url; } }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (e.name === 'first-contentful-paint') window.__m.fcp = e.startTime; }).observe({ type: 'paint', buffered: true });
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (window.__m.fcp && e.startTime > window.__m.fcp) window.__m.tbt += Math.max(0, e.duration - 50); }).observe({ type: 'longtask', buffered: true });
  });
  const t0 = Date.now();
  await p.goto('http://127.0.0.1:8765/v3/a/' + L, { waitUntil: 'load', timeout: 120000 });
  await p.waitForTimeout(5000);
  const m = await p.evaluate(() => window.__m);
  console.log((L || 'ru').padEnd(4), name.padEnd(11), 'FCP', Math.round(m.fcp), 'мс  LCP', Math.round(m.lcp), 'мс', m.lcpEl.slice(0, 40), ' CLS', m.cls.toFixed(3), ' TBT', Math.round(m.tbt), 'мс  load', Date.now() - t0, 'мс');
  await ctx.close();
}
await b.close();
