# Нынешняя страница в корне сайта: главная, /uz/, /tg/ — копии собранных /v3/a/, /v3/a/uz/, /v3/a/tg/ с путями от корня.
# Зачем: на домене клиента (Vercel) главная должна открывать письмо, а не старый черновик; адрес чистый — vectorecovery.uz.
# Файл в корне Vercel важнее любой подмены адреса, поэтому страница лежит в корне сама. /v3/a/ остаётся для старых ссылок.
# Запускать последним, после build_letter.py, i18n.py и seo.py:  python3 .design/root.py /home/user/vector-site
import os, sys
root = sys.argv[1]
for src, dst, old, new in (('v3/a/index.html', 'index.html', '../../', ''),
                           ('v3/a/uz/index.html', 'uz/index.html', '../../../', '../'),
                           ('v3/a/tg/index.html', 'tg/index.html', '../../../', '../')):
    s = open(f'{root}/{src}', encoding='utf-8').read()
    assert old in s, src
    deeper = '../../../' if old == '../../' else '../../../../'
    assert deeper not in s, f'{src}: пути глубже ожидаемого'
    os.makedirs(os.path.dirname(f'{root}/{dst}') or root, exist_ok=True)
    open(f'{root}/{dst}', 'w', encoding='utf-8', newline='\n').write(s.replace(old, new))
    print(dst, 'ok', s.count(old), 'путей')
