# Поисковая разметка /v3/a/ и языковых версий — после сборки русской страницы и i18n.py:
#   python3 .design/seo.py /home/user/vector-site/v3/a
# Добавляет в <head> каждой версии: canonical на себя, связку языков полными адресами + x-default,
# Open Graph (превью ссылки в Telegram и др.), JSON-LD MedicalClinic с данными, которые видны на странице.
# Адрес сайта — BASE: при переезде на свой домен поменять здесь и пересобрать.
# Закрыта ли страница от поиска (meta robots), этот шаг НЕ меняет — это решение владельца.
import json, re, sys, html as H
BASE = 'https://saltsh1345.github.io/vector-site/v3/a/'
OG_IMAGE = 'https://saltsh1345.github.io/vector-site/brand/og/vector-og.jpg'
LANGS = [('ru', '', 'ru_RU'), ('uz', 'uz/', 'uz_UZ'), ('tg', 'tg/', 'tg_TJ')]
CITY = {'ru': 'Самарканд', 'uz': 'Samarqand', 'tg': 'Самарқанд'}   # как в подвале каждой версии
COUNTRY = {'ru': 'Узбекистан', 'uz': 'Oʻzbekiston', 'tg': 'Ӯзбекистон'}   # как у переводчика: «Oʻzbekiston Respublikasi», «Ҷумҳурии Ӯзбекистон»
root = sys.argv[1]

def block(code, path, locale, title, desc):
    url = BASE + path
    alt = ''.join(f'<link rel="alternate" hreflang="{c}" href="{BASE + p}">\n' for c, p, _ in LANGS)
    alt += f'<link rel="alternate" hreflang="x-default" href="{BASE}">\n'
    og_alt = ''.join(f'<meta property="og:locale:alternate" content="{l}">\n' for c, _, l in LANGS if c != code)
    ld = {
        '@context': 'https://schema.org', '@type': 'MedicalClinic',
        'name': 'Vector', 'legalName': 'ООО «VECTOR-CLINIC»', 'url': url, 'inLanguage': code,
        'description': desc, 'image': OG_IMAGE, 'logo': 'https://saltsh1345.github.io/vector-site/brand/logo-dark.png',
        'telephone': '+998918110333',
        'address': {'@type': 'PostalAddress', 'addressLocality': CITY[code], 'addressCountry': 'UZ'},   # улицы нет: адрес сообщают при записи
        'sameAs': ['https://t.me/vectorrecovery', 'https://instagram.com/vector.recovery'],
        'areaServed': {'@type': 'Country', 'name': COUNTRY[code]},   # ищут по всему Узбекистану, не только в Самарканде (слово владельца)
        # дежурная линия — круглосуточно, так и написано в подписи страницы
        'contactPoint': {'@type': 'ContactPoint', 'telephone': '+998918110333', 'contactType': 'customer service',
                         'hoursAvailable': {'@type': 'OpeningHoursSpecification',
                                            'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                                            'opens': '00:00', 'closes': '23:59'}},
    }
    return (f'<link rel="canonical" href="{url}">\n' + alt +
            f'<meta property="og:type" content="website">\n<meta property="og:site_name" content="Vector">\n'
            f'<meta property="og:title" content="{H.escape(title)}">\n<meta property="og:description" content="{H.escape(desc)}">\n'
            f'<meta property="og:url" content="{url}">\n<meta property="og:image" content="{OG_IMAGE}">\n'
            f'<meta property="og:image:width" content="1200">\n<meta property="og:image:height" content="630">\n'
            f'<meta property="og:image:alt" content="{H.escape(IMG_ALT[code])}">\n'
            f'<meta property="og:locale" content="{locale}">\n' + og_alt +
            '<meta name="twitter:card" content="summary_large_image">\n'
            f'<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>\n')

# подпись картинки превью — та же фраза, что в alt этого фото на странице (переводчика), без новых слов
IMG_ALT = {}
for code, path, locale in LANGS:
    f = f'{root}/{path}index.html'
    s = open(f, encoding='utf-8').read()
    m = re.search(r'c10-after-800\.webp"[^>]*alt="([^"]+)"', s) or re.search(r'alt="([^"]+)"[^>]*c10-after', s)
    IMG_ALT[code] = H.unescape(m.group(1)) if m else 'Vector'

for code, path, locale in LANGS:
    f = f'{root}/{path}index.html'
    s = open(f, encoding='utf-8').read()
    # убрать прежнюю разметку (относительные hreflang и блок прошлого прогона)
    s = re.sub(r'<!-- seo -->.*?<!-- /seo -->\n', '', s, flags=re.S)
    s = re.sub(r'<link rel="alternate" hreflang="[^"]+" href="[^"]*">\n', '', s)
    title = H.unescape(re.search(r'<title>(.*?)</title>', s, re.S).group(1))
    desc = H.unescape(re.search(r'<meta name="description" content="([^"]*)"', s).group(1))
    anchor = re.search(r'<meta name="theme-color"[^>]*>\n', s)
    assert anchor, f
    s = s[:anchor.end()] + '<!-- seo -->\n' + block(code, path, locale, title, desc) + '<!-- /seo -->\n' + s[anchor.end():]
    open(f, 'w', encoding='utf-8', newline='\n').write(s)
    print(code, 'ok', title)
