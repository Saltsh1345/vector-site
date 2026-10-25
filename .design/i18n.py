# Узбекская и таджикская версии /v3/a/ из собранной русской страницы: таблица фрагментов + проверка, что русского текста не осталось.
import re, sys
from html.parser import HTMLParser
import os; SP = os.path.dirname(os.path.abspath(__file__))  # таблица переводов лежит рядом
exec(open(SP + '/i18n_table.py', encoding='utf-8').read())   # T
root = sys.argv[1]                                             # .../vector-site/v3/a
ru = open(root + '/index.html', encoding='utf-8').read()

LANG_RU = '<div class="lang" role="navigation" aria-label="Язык"><a href="./" hreflang="ru" lang="ru" aria-current="page">RU</a><a href="uz/" hreflang="uz" lang="uz">UZ</a><a href="tg/" hreflang="tg" lang="tg">TJ</a></div>'
ALT_RU = '<link rel="alternate" hreflang="ru" href="./">\n<link rel="alternate" hreflang="uz" href="uz/">\n<link rel="alternate" hreflang="tg" href="tg/">'
assert LANG_RU in ru and ALT_RU in ru

def switcher(cur, label):
    links = [('ru', '../', 'RU'), ('uz', '../uz/', 'UZ'), ('tg', '../tg/', 'TJ')]
    a = ''.join(f'<a href="{"./" if code == cur else href}" hreflang="{code}" lang="{code}"{" aria-current=\"page\"" if code == cur else ""}>{txt}</a>' for code, href, txt in links)
    return f'<div class="lang" role="navigation" aria-label="{label}">{a}</div>'

class Texts(HTMLParser):
    """Видимый текст и текстовые атрибуты, без script/style."""
    def __init__(self):
        super().__init__(); self.skip = 0; self.out = []
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style'): self.skip += 1
        for k, v in attrs:
            if k in ('alt', 'aria-label', 'title', 'data-cap') and v: self.out.append(v)
            if k == 'content' and v and dict(attrs).get('name') == 'description': self.out.append(v)
    def handle_endtag(self, tag):
        if tag in ('script', 'style'): self.skip -= 1
    def handle_data(self, d):
        if not self.skip and d.strip(): self.out.append(d.strip())

def texts(html):
    p = Texts(); p.feed(html)
    # подписи сцен ролика — строки внутри скрипта
    m = re.search(r'marks = (\[\[.*?\]\]);', html)
    if m: p.out += re.findall(r'"([^"]+)"', m.group(1))
    return p.out

CYR = re.compile('[А-Яа-яЁё]')
KEEP = {'Темирхан Нуржан Кадирханович'}   # имя пишется одинаково по-таджикски
ru_texts = {t for t in texts(ru) if CYR.search(t)}

for code, col, html_lang, label in (('uz', 1, 'uz-Latn', 'Til'), ('tg', 2, 'tg', 'Забон')):
    h = ru.replace('<html lang="ru"', f'<html lang="{html_lang}"', 1)
    h = h.replace('../../', '../../../')
    h = h.replace(LANG_RU, switcher(code, label), 1)
    h = h.replace(ALT_RU, '<link rel="alternate" hreflang="ru" href="../">\n<link rel="alternate" hreflang="uz" href="../uz/">\n<link rel="alternate" hreflang="tg" href="../tg/">', 1)
    for row in T:
        src, dst = row[0], row[col]
        if src not in h:
            sys.exit(f'[{code}] нет фрагмента: {src[:70]}')
        h = h.replace(src, dst)
    left = []
    for t in texts(h):
        if code == 'uz' and CYR.search(t) and t not in KEEP:
            left.append(t)
        if code == 'tg' and t in ru_texts and t not in KEEP:
            left.append(t)
    if left:
        sys.exit(f'[{code}] остался русский текст:\n  ' + '\n  '.join(left[:20]))
    import os
    os.makedirs(f'{root}/{code}', exist_ok=True)
    open(f'{root}/{code}/index.html', 'w', encoding='utf-8', newline='\n').write(h)
    print(code, 'ok', len(h))
