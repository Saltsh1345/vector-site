// design-loop: что сдвигает страницу при загрузке (CLS) — элемент, прежнее и новое место; телефон с медленной сетью и процессором ×4, компьютер.
// Запуск: node .design/checks/shifts.mjs
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const b = await chromium.launch();
for (const [w, h, cpu] of [[390, 844, 4], [1440, 900, 1]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } }); const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  await cdp.send('Network.enable'); await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
  if (cpu > 1) { await cdp.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 200000, uploadThroughput: 94000 }); await cdp.send('Emulation.setCPUThrottlingRate', { rate: cpu }); }
  await p.addInitScript(() => {
    window.__s = [];
    const d = n => n ? (n.tagName || '#text') + (n.id ? '#' + n.id : '') + (n.className && typeof n.className === 'string' ? '.' + n.className.split(' ').slice(0, 2).join('.') : '') : '?';
    new PerformanceObserver(l => { for (const e of l.getEntries()) if (!e.hadRecentInput) window.__s.push({ t: Math.round(e.startTime), v: +e.value.toFixed(4), src: e.sources.map(s => d(s.node) + ' ' + JSON.stringify([Math.round(s.previousRect.y), Math.round(s.currentRect.y), Math.round(s.previousRect.height), Math.round(s.currentRect.height)])) }); }).observe({ type: 'layout-shift', buffered: true });
  });
  await p.goto('http://127.0.0.1:8765/v3/a/', { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(5000);
  console.log('== ' + w); for (const s of await p.evaluate(() => window.__s)) console.log(s.t, s.v, s.src.join(' | ').slice(0, 300));
  await ctx.close();
}
await b.close();
