# Финальный перевод переводчика (perevod-final-94.md) → таблица переводов сайта.
# Текст переводчика переносится дословно; разметка (курсив, карточки, подписи) берётся из русской строки.
# В конце проверка: видимый текст каждой строки совпадает с текстом переводчика.
import re, os, sys, csv
D = os.path.dirname(os.path.abspath(__file__))
src = open(D + '/i18n_table.py', encoding='utf-8').read()
ns = {}; exec(src, ns); T = ns['T']
md = open(D + '/perevod-final-94.md', encoding='utf-8').read()
items = re.findall(r'^(\d+)\. \*\*RU:\*\* (.*?) \*\((?:[^()]|\([^()]*\))*\)\*\s*\n\s*- UZ: (.*)\n\s*- TJ: (.*)', md, re.M)
assert len(items) == 94, len(items)

def uz_apos(s):
    s = re.sub(r'([OoGg])[‘’\'`]', lambda m: m.group(1) + 'ʻ', s)
    return re.sub(r'(?<=[A-Za-z])’(?=[a-z])', 'ʼ', s)
def plain(s):   # то же, что в make_xlsx.py
    s = re.sub(r'<b>[IVX]+</b>', '', s); s = re.sub(r'</b><small>', ' — ', s); s = re.sub(r'<br>', ' ', s)
    m = re.match(r'^(?:aria-label=|alt=|data-cap=|content=)"(.*)"$', s, re.S)
    if m: s = m.group(1)
    s = re.sub(r'<[^>]+>', '', s)
    return s.strip()
def norm(s):
    s = s.lower().replace('ё', 'е'); s = re.sub(r'[\[\]*_«»"“”„.,:;!?—–\-()·‖]', ' ', s); return ' '.join(s.split())
def sents(s):
    return [x for x in re.split(r'(?<=[.!?])\s+', s.strip()) if x]

FINAL = {}
for n, ru, uz, tg in items:
    FINAL[norm(ru)] = (int(n), uz_apos(uz.strip()), tg.strip())

# курсив, которого не найти автоматически: (русская строка, язык) → какой кусок перевода выделить
EM_MANUAL = {
    ('<em>Каждую субботу в 11:00</em>', 'uz'): r'^(Har shanba soat 11:00 da)',
    ('<em>Каждую субботу в 11:00</em>', 'tg'): r'^(Ҳар шанбе соати 11:00)',
}

def rebuild(ru, cur, new, lang):
    """Русская строка ru задаёт разметку; new — текст переводчика без разметки."""
    if ru.startswith('<title>'): return f'<title>{new}</title>'
    m = re.match(r'^(aria-label|alt|data-cap|content)="(.*)"$', ru, re.S)
    if m: return f'{m.group(1)}="{new}"'
    m = re.match(r'^<b>(.*)</b><small>(.*)</small>$', ru)
    if m and not re.match(r'^<b>[IVX]+</b>', ru):
        a, b = new.split(' — ', 1); return f'<b>{a}</b><small>{b}</small>'
    m = re.match(r'^<small>(.*)</small><b>(.*)</b>$', ru)
    if m:
        a, b = [x.strip() for x in new.split('‖', 1)]; return f'<small>{a}</small><b>{b}</b>'
    m = re.match(r'^(<b>[IVX]+</b>)', ru)
    if m: return m.group(1) + new
    if '<br>' in ru: return new.replace(', ', ',<br>', 1)
    if '<span id="year">' in ru: return new.replace('2026', '<span id="year">2026</span>', 1)
    if '<em>' in ru:
        pre, em, post = re.match(r'^(.*?)<em>(.*?)</em>(.*)$', ru, re.S).groups()
        # строки, где курсив стоит внутри тега заголовка: <h2 …><em>…</em></h2>
        if re.fullmatch(r'(<[^>]+>)*', pre) and re.fullmatch(r'(</[^>]+>)*', post):
            return f'{pre}<em>{new}</em>{post}'
        for (key, lg), rx in EM_MANUAL.items():
            if key in ru and lg == lang:
                return re.sub(rx, r'<em>\1</em>', new, count=1)
        cur_em = re.search(r'<em>(.*?)</em>', cur)
        if cur_em and cur_em.group(1) in new:
            return new.replace(cur_em.group(1), f'<em>{cur_em.group(1)}</em>', 1)
        rs = sents(plain(ru)); ns_ = sents(new)
        idx = [i for i, x in enumerate(rs) if x.strip() and x.strip() in em]
        if idx and len(rs) == len(ns_):
            out = [f'<em>{x}</em>' if i in idx else x for i, x in enumerate(ns_)]
            return ' '.join(out)
        # курсив до двоеточия в начале предложения
        if em.endswith(':'):
            k = next(i for i, x in enumerate(rs) if x.startswith(em[:-1]))
            if len(rs) == len(ns_) and ':' in ns_[k]:
                a, b = ns_[k].split(':', 1); ns_[k] = f'<em>{a}:</em>{b}'; return ' '.join(ns_)
        raise SystemExit(f'не понял, где курсив: {ru[:60]} [{lang}] → {new[:60]}')
    toks = re.split(r'(<[^>]+>)', ru)
    texts = [i for i, t in enumerate(toks) if t.strip() and not t.startswith('<')]
    if len(texts) == 1:
        toks[texts[0]] = (' ' if toks[texts[0]].startswith(' ') else '') + new; return ''.join(toks)
    if not texts: return new
    raise SystemExit(f'не понял разметку: {ru[:60]}')

used = set(); out = []
for ru, uz, tg in T:
    if ru.startswith('[[0,'):   # подписи сцен ролика
        R = re.findall(r'"([^"]+)"', ru); U = re.findall(r'"([^"]+)"', uz); G = re.findall(r'"([^"]+)"', tg)
        for k, cap in enumerate(R):
            f = FINAL.get(norm(cap))
            if f: U[k], G[k] = f[1], f[2]; used.add(f[0])
        times = re.findall(r'\[([\d.]+),', ru)
        uz = '[' + ', '.join(f'[{t}, "{c}"]' for t, c in zip(times, U)) + ']'
        tg = '[' + ', '.join(f'[{t}, "{c}"]' for t, c in zip(times, G)) + ']'
        out.append((ru, uz, tg)); continue
    f = FINAL.get(norm(plain(ru)))
    if f:
        used.add(f[0])
        uz2, tg2 = rebuild(ru, uz, f[1], 'uz'), rebuild(ru, tg, f[2], 'tg')
        for got, want, lg in ((uz2, f[1], 'uz'), (tg2, f[2], 'tg')):
            assert norm(plain(got)).replace(' ', '') == norm(want).replace(' ', ''), (lg, ru[:50], plain(got)[:80], want[:80])
        out.append((ru, uz2, tg2))
    else:
        out.append((ru, uz, tg))
# п. 1 «Язык» — подпись переключателя, она в i18n.py, а не в таблице
f = FINAL[norm('Язык')]; i18n = open(D + '/i18n.py', encoding='utf-8').read()
assert f"'uz-Latn', '{f[1]}'" in i18n and f"'tg', '{f[2]}'" in i18n, ('подпись переключателя в i18n.py отличается от переводчика', f)
used.add(f[0])
left = sorted(set(range(1, 95)) - used)
assert not left, ('фразы переводчика не легли на сайт:', left)

import ast
tree = ast.parse(src); lst = next(n.value for n in tree.body if isinstance(n, ast.Assign) and n.targets[0].id == 'T')
lines = src.splitlines(keepends=True)
for node, row in sorted(zip(lst.elts, out), key=lambda x: -x[0].lineno):   # снизу вверх, чтобы номера строк не съехали
    ru, uz, tg = row
    text = '(' + repr(ru) + ',\n ' + repr(uz) + ',\n ' + repr(tg) + '),\n'
    end = node.end_lineno
    tail = lines[end - 1].encode('utf-8')[node.end_col_offset:].decode('utf-8')   # ast считает отступ в байтах UTF-8
    head = lines[node.lineno - 1].encode('utf-8')[:node.col_offset].decode('utf-8')
    lines[node.lineno - 1:end] = [head + text.rstrip('\n').rstrip(',') + tail]
body = ''.join(lines)
ns2 = {}; exec(body, ns2)
assert ns2['T'] == out, 'таблица не сошлась после записи'
open(D + '/i18n_table.py', 'w', encoding='utf-8', newline='\n').write(body)
print('перенесено фраз переводчика:', len(used), 'из 94; строк таблицы изменено:', sum(a != b for a, b in zip(T, out)))
