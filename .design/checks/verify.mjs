// design-loop: проверка отрисовки /v3/a/ — перехват CDP, геометрия, клавиатура, контраст, зонд, кадры сцен на 390 и 1440
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import fs from 'fs';
const URL = 'http://127.0.0.1:8765/v3/a/' + (process.argv[2]||''), OUT = '/home/user/vector-site/.design/shots/' + (process.argv[2]||'ru/'); fs.mkdirSync(OUT, {recursive:true});
const probe = fs.readFileSync('/home/user/Skill/skills/refero-design/scripts/slop-probe.js', 'utf8');
const WIDTHS = [[390, 844], [1440, 900]];
const scenes = ['hero', '#listen', '#consult', '#against', '#home', '#program', '#gym', '#bath', '#prayer', '#family', '#after', '#team', '#docs', '#contact'];
const b = await chromium.launch();
const report = {};
for (const [w, h] of WIDTHS) {
  const ctx = await b.newContext({ viewport: { width: w, height: h } });
  const p = await ctx.newPage();
  const cdp = await ctx.newCDPSession(p);
  const errs = [];
  await cdp.send('Runtime.enable'); await cdp.send('Log.enable'); await cdp.send('Network.enable');
  cdp.on('Runtime.exceptionThrown', e => errs.push('exception: ' + (e.exceptionDetails.exception?.description || e.exceptionDetails.text)));
  cdp.on('Log.entryAdded', e => { if (['error', 'warning'].includes(e.entry.level)) errs.push('log ' + e.entry.level + ': ' + e.entry.text + ' ' + (e.entry.url || '')); });
  cdp.on('Runtime.consoleAPICalled', e => { if (['error', 'warning'].includes(e.type)) errs.push('console ' + e.type + ': ' + e.args.map(a => a.value).join(' ')); });
  let bytes=0, firstBytes=0, phase='load'; cdp.on('Network.loadingFinished', e => { bytes += e.encodedDataLength; if (phase==='load') firstBytes += e.encodedDataLength; });
  cdp.on('Network.loadingFailed', e => { if (!e.canceled) errs.push('net failed: ' + e.errorText + ' ' + e.requestId); });
  const resp404 = []; p.on('response', r => { if (r.status() >= 400) resp404.push(r.status() + ' ' + r.url()); });
  await p.goto(URL, { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  const R = {}; R.firstLoadKB = Math.round(firstBytes/1024); phase='scroll';
  // кадры сцен
  for (const s of scenes) {
    if (s === 'hero') await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    else await p.evaluate(sel => { const el = document.querySelector(sel); window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - (innerWidth > 860 ? 0 : 0), behavior: 'instant' }); }, s);
    await p.waitForTimeout(1100);
    await p.screenshot({ path: `${OUT}/${w}-${s.replace('#', '')}.png` });
  }
  // геометрия: вылет за запрошенную ширину (видимые элементы), битые картинки, скрытые главы
  R.geom = await p.evaluate((W) => {
    const over = [...document.querySelectorAll('body *')].filter(el => {
      const r = el.getBoundingClientRect(); if (!r.width) return false;
      let a = el; while (a && a !== document.body) { const s = getComputedStyle(a); if (s.overflowX === 'hidden' || s.overflowX === 'clip' || s.overflow === 'hidden') { const ar = a.getBoundingClientRect(); if (r.right > ar.right + 1) return false; } a = a.parentElement; }
      return r.right > W + 1 || r.left < -1;
    }).filter(el => !el.closest('.ribbon')).slice(0, 6).map(el => el.tagName + '.' + el.className);
    const imgs = [...document.querySelectorAll('main img')].filter(i => i.complete && i.naturalWidth === 0).map(i => i.src);
    const hidden = [...document.querySelectorAll('.txt,.trip-grid')].filter(t => !t.classList.contains('sc-in')).map(t => t.closest('section').id);
    const sides = [...document.querySelectorAll('.chess-row')].map(r => { const t = r.querySelector('.txt').getBoundingClientRect(), f = r.querySelector('.ph').getBoundingClientRect(); return innerWidth > 860 ? (f.left > t.left ? 'R' : 'L') : (f.top < t.top ? 'top' : 'bottom'); });
    const photoW = [...document.querySelectorAll('.ph')].map(f => Math.round(f.getBoundingClientRect().width));
    return { docW: document.documentElement.scrollWidth, over, brokenImgs: imgs, hiddenChapters: hidden, sides: sides.join(''), photoW: [Math.min(...photoW), Math.max(...photoW)] };
  }, w);
  // доступные имена
  R.names = await p.evaluate(() => [...document.querySelectorAll('a,button')].filter(e => { const r = e.getBoundingClientRect(); return r.width && !(e.innerText.trim() || e.getAttribute('aria-label') || e.querySelector('img[alt]:not([alt=""])')); }).map(e => e.outerHTML.slice(0, 80)));
  // контраст по формуле
  R.contrast = await p.evaluate(() => {
    const parse = c => { const m = c.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m[3] ?? 1 }; };
    const lin = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    const L = c => 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
    const mix = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
    const bgOf = el => { let a = el, stack = []; while (a) { const c = parse(getComputedStyle(a).backgroundColor); if (c.a > 0) stack.push(c); if (c.a >= 1) break; a = a.parentElement; } let bg = { r: 250, g: 247, b: 241, a: 1 }; for (const c of stack.reverse()) bg = mix(c, bg); return bg; };
    const ratio = sel => { const el = document.querySelector(sel); if (!el) return null; const fg0 = parse(getComputedStyle(el).color), bg = bgOf(el), fg = mix(fg0, bg); const a = L(fg), b = L(bg); return +(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(2)); };
    const out = {};
    for (const s of ['.txt p', '.txt .label', '.txt h2 em', '.pcard b', '.pcard small', '.sign p', '.sign .ps', '.contacts small', '.btn-line', '.foot p', '.doc span', '.hero-note li']) out[s] = ratio(s);
    return out;
  });
  // клавиатура: 30 табов — фокус виден и идёт по порядку
  await p.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  const tabs = [];
  for (let i = 0; i < 30; i++) {
    await p.keyboard.press('Tab');
    tabs.push(await p.evaluate(() => { const e = document.activeElement; const s = getComputedStyle(e); const vis = s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0; return (e.innerText || e.getAttribute('aria-label') || e.tagName).trim().slice(0, 28) + (vis ? '' : ' [нет кольца]'); }));
  }
  R.tabs = tabs;
  R.noRing = tabs.filter(t => t.includes('нет кольца')).length;
  R.slop = await p.evaluate(probe);
  R.errors = errs; R.http4xx = resp404; R.totalKB = Math.round(bytes/1024);
  report[w] = R;
  await ctx.close();
}
await b.close();
fs.writeFileSync(OUT + '/report.json', JSON.stringify(report, null, 1));
for (const [w, R] of Object.entries(report)) {
  console.log('== ' + w, 'первая загрузка KB', R.firstLoadKB, 'всего после прокрутки KB', R.totalKB, JSON.stringify(R.geom));
  console.log('names', JSON.stringify(R.names));
  console.log('contrast', JSON.stringify(R.contrast));
  console.log('noRing', R.noRing, 'tabs', R.tabs.slice(0, 12).join(' | '));
  console.log('errors', JSON.stringify(R.errors), 'http4xx', JSON.stringify(R.http4xx));
  const s = R.slop; console.log('slop', JSON.stringify({ violet: s.violet, cards: s.cards, smallRadius: s.smallRadius, buttonGradient: s.buttonGradient, sideStripes: s.sideStripes, capsNoTracking: s.capsNoTracking, eyebrows: s.eyebrows, emoji: s.emoji, headlineWordSwap: s.headlineWordSwap, gradientText: s.gradientText, glow: s.glow, hardShadow: s.hardShadow, sectionNumbers: s.sectionNumbers, arrowLabels: s.arrowLabels, mono: s.monoOutsideCode, animated: s.sectionsAnimated, transitionAll: s.transitionAll, browserDefaults: s.browserDefaults, fonts: s.fontFamilies }));
}
