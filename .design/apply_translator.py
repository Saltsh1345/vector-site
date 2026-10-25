# Перенос файла переводчика (perevod-pervaya-versiya-155.csv) в таблицу переводов сайта:
# 1) фразы, которые есть у переводчика, — его вариантом; 2) его слова — во всех остальных фразах.
import sys
sys.exit('Уже применён 25.10.2026. Финальный перевод переводчика — apply_final.py; повторный запуск испортил бы его текст.')
import re, sys, os
D = os.path.dirname(os.path.abspath(__file__))
src = open(D + '/i18n_table.py', encoding='utf-8').read()
ns = {}; exec(src, ns); T = ns['T']

def uz_apos(s):   # oʻ gʻ — U+02BB, тутуқ белгиси — U+02BC
    s = re.sub(r'([OoGg])[‘’\'`]', lambda m: m.group(1) + 'ʻ', s)
    return re.sub(r'(?<=[A-Za-z])’(?=[a-z])', 'ʼ', s)

# 1) фразы переводчика (строка файла → наш фрагмент)
EXACT = {
    'aria-label="Позвонить +998 91 811 03 33"': ('aria-label="Qo‘ng‘iroq qilish: +998 91 811 03 33"', 'aria-label="Занг занед: +998 91 811 03 33"'),   # стр. 9
    'Написать в Telegram': ('Telegram orqali yozish', 'Дар Telegram нависед'),                                                             # стр. 10
    'aria-label="Написать в Telegram"': ('aria-label="Telegram orqali yozish"', 'aria-label="Дар Telegram нависед"'),                     # стр. 10
    'Анонимно</li>': (None, 'Махфӣ</li>'),                                                                                                # стр. 15
    '<b>IV</b>Дом': ('<b>IV</b>Uy va sharoit', '<b>IV</b>Хона ва шароит'),                                                               # стр. 3
    'Если близкий <em>против</em>': (None, 'Агар наздикатон <em>розӣ набошад</em>'),                                                     # стр. 25
    '<b>X</b>После курса': (None, '<b>X</b>Пас аз курс'),                                                                                # стр. 53
    'После <em>курса</em>': (None, 'Пас аз <em>курс</em>'),                                                                              # стр. 53
    'data-cap="Лицензия Минздрава Республики Узбекистан №1857962, стр. 1. Адрес скрыт."':
        ('data-cap="O‘zbekiston Respublikasi Sog‘liqni saqlash vazirligi litsenziyasi №1857962, 1-bet. Manzil yashirilgan."',
         'data-cap="Иҷозатномаи Вазорати тандурустии Ҷумҳурии Ӯзбекистон №1857962, саҳ. 1. Суроға пинҳон аст."'),                         # стр. a13
    'data-cap="Сертификат консультанта по зависимости, Amanat Rehab, Алматы, 2023, 59 часов."':
        (None, 'data-cap="Сертификати мушовир оид ба вобастагӣ, Amanat Rehab, Алмаато, 2023, 59 соат."'),                                 # стр. a15
    '<span>Сертификат консультанта': (None, '<span>Сертификати мушовир'),                                                                # стр. 89
    'Позвонить</a>': (None, 'Занг занед</a>'),                                                                                            # стр. 123
    # тот же лад, что «Дар Telegram нависед» и «Занг занед»
    'Написать</a>': (None, 'Нависед</a>'),
    '<span>Написать</span>': (None, '<span>Нависед</span>'),
    # дверь: на табличке написано «Консультантская / Maslahatchi»
    'alt="Дверь кабинета с табличкой «Консультантская»"': (None, 'alt="Дари утоқ бо лавҳаи «Консультантская»"'),
}
# 2) слова переводчика во всех остальных фразах
UZ_WORDS = [
    (r'\b([Mm])aslahat(?!chi)', lambda m: ('K' if m.group(1) == 'M' else 'k') + 'onsultatsiya'),   # консультация, стр. 31, 46, 67
    (r'([Aa])lohida hammom', lambda m: m.group(1) + 'lohida yuvinish xonasi'),                      # санузел, стр. 17, 67
]
TJ_WORDS = [
    (r'Ҳамаи зангҳо беноманд, будубош дар марказ низ беном аст\.', 'Ҳамаи зангҳо махфӣ мебошанд, будубош дар марказ низ махфӣ аст.'),
    (r'([Бб])еном', lambda m: ('М' if m.group(1) == 'Б' else 'м') + 'ахфӣ'),                          # анонимно, стр. 15, 31
    (r'ҳаммому ҳоҷатхона ва кондитсионери алоҳида', 'ташноб ва кондитсионери алоҳида'),              # санузел, стр. 67
    (r'Ҳаммоми алоҳида', 'Ташноби алоҳида'),                                                          # стр. 17
    (r'([Аа])сосгузор', lambda m: ('М' if m.group(1) == 'А' else 'м') + 'уассис'),                   # основатель, стр. 43
    (r'\b([Оо])фис', lambda m: ('Д' if m.group(1) == 'О' else 'д') + 'афтар'),                       # офис, стр. 30, 82, 119
    (r'([Хх])атти навбатдор', lambda m: ('Т' if m.group(1) == 'Х' else 'т') + 'елефони навбатдор'),  # дежурная линия, стр. 16, 96
    (r'([Бб])аъди (<em>)?курс', lambda m: ('Пас аз ' if m.group(1) == 'Б' else 'пас аз ') + (m.group(2) or '') + 'курс'),  # стр. 41, 53
    (r'([Кк])ӯмак', lambda m: m.group(1) + 'умак'),                                                  # кумак — как у переводчика везде
    (r'([Сс])ӯҳбат', lambda m: m.group(1) + 'уҳбат'),                                                # суҳбат
    (r'([Ӯӯ])ҳдадор', lambda m: ('У' if m.group(1) == 'Ӯ' else 'у') + 'ҳдадор'),                    # уҳдадорӣ
    (r'([Мм])ашваратчӣ', lambda m: ('М' if m.group(1) == 'М' else 'м') + 'ушовир'),                  # консультант, стр. 59, 89
]
out, n_exact, n_words = [], 0, 0
for ru, uz, tg in T:
    if ru in EXACT:
        u, t = EXACT[ru]
        if u is not None: uz = u; n_exact += 1
        if t is not None: tg = t; n_exact += 1
    for rx, rep in UZ_WORDS:
        uz, k = re.subn(rx, rep, uz); n_words += k
    for rx, rep in TJ_WORDS:
        tg, k = re.subn(rx, rep, tg); n_words += k
    out.append((ru, uz_apos(uz), tg))

# 3) предложения переводчика внутри наших абзацев (совпадают с его строками 13, 20, 24, 27, 39, 42, 80, 115)
SENT_UZ = [
    ('Alkogol, giyohvandlik va qimorga qaram boʻlgan insonlarga hamda ularning oilalariga yordam beramiz.', 'Alkogol, giyohvand moddalar va qimor oʻyinlariga qaram boʻlgan insonlarga hamda ularning oilalariga yordam beramiz.'),
    ('<em>Chiqish yoʻli bor.</em>', '<em>Chorasi bor.</em>'),                                   # «Выход есть» — стр. 20
    ('<em>Chiqish yoʻlini topishga yordam beramiz.</em>', '<em>Chorasini topishga yordam beramiz.</em>'),
    ('Hozir chiqish yoʻlini izlayotgan insonga maktub', 'Hozir chora izlayotgan insonga maktub'),
    ('Konsultatsiya bepul va hech narsaga majbur qilmaydi.', 'Konsultatsiya bepul va hech qanday majburiyat yuklamaydi.'),
    ('Inkor qilish — oʻjarlik emas, kasallikning koʻp uchraydigan belgisi.', 'Inkor etish — qaysarlik emas, balki kasallikning keng tarqalgan belgisi.'),
    ('Dasturni Qozogʻistondan taklif etilgan mutaxassislar olib boradi: klinik psixologlar, narkologlar va addiktologlar.', 'Dasturni Qozogʻistondan taklif etilgan mutaxassislar — klinik psixologlar, narkologlar va addiktologlar olib boradi.'),
    ('Konsultatsiya bepul, qoralashsiz va majburiyatsiz.', 'Konsultatsiya bepul — hech qanday malomat va majburiyatsiz.'),
]
SENT_TG = [
    ('Ба одамоне, ки ба машрубот, маводи мухаддир ва қимор вобастаанд, ва ба оилаҳои онҳо кумак мерасонем.', 'Ба шахсони гирифтори вобастагӣ аз машрубот, маводи мухаддир ва қиморбозӣ, инчунин ба оилаҳои онҳо кумак мерасонем.'),
    ('<em>Роҳи наҷот ҳаст.</em>', '<em>Роҳи ҳал ҳаст.</em>'),
    ('<em>Мо барои ёфтани роҳи наҷот кумак мекунем.</em>', '<em>Мо барои ёфтани роҳи ҳал кумак мекунем.</em>'),
    ('Мактуб ба касе, ки ҳоло роҳи наҷот меҷӯяд', 'Мактуб ба касе, ки ҳоло роҳи ҳал меҷӯяд'),
    ('Машварат ройгон аст ва ҳеҷ уҳдадорӣ намегузорад.', 'Машварат ройгон аст ва шуморо ба чизе уҳдадор намекунад.'),
    ('Инкор — нишонаи маъмули беморӣ аст, на якравӣ.', 'Инкор кардан — якравӣ нест, балки нишонаи маъмули беморӣ аст.'),
    ('Барномаро мутахассисони даъватшуда аз Қазоқистон мебаранд: равоншиносони клиникӣ, наркологҳо ва аддиктологҳо.', 'Барномаро мутахассисони даъватшуда аз Қазоқистон — равоншиносони клиникӣ (психологҳо), наркологҳо ва аддиктологҳо пеш мебаранд.'),
    ('Вобастагии наздик тамоми оиларо хаста мекунад.', 'Вобастагии шахси наздик тамоми оиларо хаста мекунад.'),
    ('Машварат ройгон аст, бе маломат ва бе уҳдадорӣ.', 'Машварат ройгон аст — бе маломат ва бе ҳеҷ уҳдадорӣ.'),
    ('Ба машварат сабти ном', 'Барои машварат вақт таъин кунед'),                              # стр. 39
    ('Ба вохӯрӣ сабти ном', 'Барои вохӯрӣ вақт таъин кунед'),                                    # тот же лад
    ('тавонбахш', 'реабилитатсион'),                                                            # как «Барномаи реабилитатсионӣ», стр. 47
]
def sent_pass(out):
    res = []
    for ru, uz, tg in out:
        for a, b in SENT_UZ: uz = uz.replace(a, b)
        for a, b in SENT_TG: tg = tg.replace(a, b)
        res.append((ru, uz, tg))
    blob = ' '.join(u + ' ' + t for _, u, t in res)
    lost = [b for a, b in SENT_UZ + SENT_TG if b not in blob]
    assert not lost, ('не легло:', lost)
    return res

out = sent_pass(out)
missing = [k for k in EXACT if k not in [r for r, _, _ in T]]
assert not missing, missing
# записать таблицу обратно, сохранив комментарии разделов
lines, i = [], 0
for line in src.splitlines(keepends=True):
    lines.append(line)
body = src
for (ru, uz0, tg0), (_, uz1, tg1) in zip(T, out):
    if (uz0, tg0) == (uz1, tg1): continue
    body = body.replace(repr(uz0)[1:-1] if False else uz0, uz1, 1) if uz0 != uz1 and body.count(uz0) >= 1 else body
    body = body.replace(tg0, tg1, 1) if tg0 != tg1 else body
ns2 = {}; exec(body, ns2)
assert [r for r in ns2['T']] == out, 'таблица не сошлась после записи'
open(D + '/i18n_table.py', 'w', encoding='utf-8', newline='\n').write(body)
print('фраз переводчика:', n_exact, '| замен слов:', n_words)
