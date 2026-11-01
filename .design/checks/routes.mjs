// design-loop: адрес сайта (домен клиента или локальный сервер с правилами vercel.json): вход с разных адресов, переключатель языков,
// все ссылки и файлы страниц — ответы сервера; внешние ссылки — формат
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
const O = (process.argv[2] || 'https://www.vectorecovery.uz').replace(/\/$/, '');   // node .design/checks/routes.mjs [адрес]
const b = await chromium.launch(); const out = [];
const ctx = await b.newContext({ viewport: { width: 390, height: 844 } });
await ctx.addInitScript(() => { try { sessionStorage.setItem('vx-intro', '1'); } catch (e) {} });
const p = await ctx.newPage(); const bad = [];
p.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url().replace(O, '')); });
p.on('pageerror', e => bad.push('JS: ' + e.message));
const lang = () => p.evaluate(() => document.documentElement.lang + ' ' + location.pathname);
for (const start of ['/', '/v3/a', '/uz', '/tg/', '/v3/a/uz', '/v3/a/tg/']) {
  await p.goto(O + start, { waitUntil: 'load' }); const s = await lang();
  const hops = [];
  for (const L of ['UZ', 'TJ', 'RU']) {
    try { await p.click(`.lang a:text-is("${L}")`, { timeout: 5000 }); await p.waitForLoadState('load'); hops.push(L + '→' + (await lang())); }
    catch (e) { hops.push(L + '→ СЛОМАНО (нет переключателя языков на ' + (await p.evaluate(() => location.pathname)) + ')'); break; }
  }
  out.push(`вход ${start.padEnd(10)} → ${s} | ${hops.join(' | ')}`);
}
// все внутренние ссылки и файлы трёх страниц
const seen = new Set(), ext = new Set();
for (const path of ['/v3/a/', '/v3/a/uz/', '/v3/a/tg/']) {
  await p.goto(O + path, { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
  const urls = await p.evaluate(() => [...document.querySelectorAll('[href],[src],[srcset],[data-doc],source[srcset]')].flatMap(e => [e.getAttribute('href'), e.getAttribute('src'), e.getAttribute('data-doc'), ...(e.getAttribute('srcset') || '').split(',').map(x => x.trim().split(' ')[0])]).filter(Boolean).map(u => { try { return new URL(u, location.href).href; } catch (e) { return 'BAD ' + u; } }));
  for (const u of urls) (u.startsWith(O) ? seen : ext).add(u.split('#')[0]);
}
const fails = [];
for (const u of seen) { const r = await ctx.request.get(u, { maxRedirects: 5 }); if (r.status() >= 400) fails.push(r.status() + ' ' + u.replace(O, '')); }
out.push(`внутренних адресов: ${seen.size}, с ошибкой: ${fails.length ? fails.join(', ') : 'нет'}`);
out.push('внешние: ' + [...ext].filter(u => !u.includes('saltsh1345.github.io')).join('  '));
out.push('ошибки при переходах: ' + (bad.length ? [...new Set(bad)].join(', ') : 'нет'));
console.log(out.join('\n')); await b.close();
// та ли версия на адресе: страницы и ролики совпадают с файлами репозитория байт в байт
import { createHash } from 'crypto'; import fs from 'fs';
const md5 = buf => createHash('md5').update(buf).digest('hex').slice(0, 8);
const same = [];
for (const f of ['v3/a/index.html', 'v3/a/uz/index.html', 'v3/a/tg/index.html', 'media/hA-p.webm', 'media/hA-l.webm', 'media/hA-p.webp']) {
  const r = await fetch(O + '/' + f + '?v=' + Date.now()); const remote = Buffer.from(await r.arrayBuffer());
  const local = fs.readFileSync(new URL('../../' + f, import.meta.url));
  same.push(`${f}: ${r.status} ${md5(remote) === md5(local) ? 'как в репозитории' : 'ДРУГАЯ ВЕРСИЯ'}`);
}
console.log(same.join('\n'));
