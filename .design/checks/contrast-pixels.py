# Разбор вывода contrast-pixels.mjs: контраст текста к худшим 5 % пикселей фона под ним.
# Запуск: node .design/checks/contrast-pixels.mjs | python3 .design/checks/contrast-pixels.py
import json, base64, io, re, sys
from PIL import Image

def L(c):
    c = [v / 255 for v in c]
    c = [v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4 for v in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]

low = 0
for line in sys.stdin:
    d = json.loads(line)
    for sel, col, b64 in d['out']:
        px = list(Image.open(io.BytesIO(base64.b64decode(b64))).convert('RGB').getdata())
        Lf = L([int(float(x)) for x in re.findall(r'[\d.]+', col)[:3]])
        rs = sorted((max(Lf, L(p)) + 0.05) / (min(Lf, L(p)) + 0.05) for p in px)
        worst = rs[int(len(rs) * 0.05)]
        low += worst < 4.5
        print(d['page'], sel, round(worst, 2), '' if worst >= 4.5 else '<-- мало')
sys.exit(1 if low else 0)
