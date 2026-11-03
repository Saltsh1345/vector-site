"""Notify participating search engines after production is updated (no scheduled task).
Run: python3 .design/submit-indexnow.py
A 200/202 response acknowledges receipt, not indexing or rankings.
"""
import json
from pathlib import Path
import urllib.error
import urllib.request

BASE = 'https://www.vectorecovery.uz/'
KEY = (Path(__file__).parent / 'indexnow-key.txt').read_text().strip()

def get(url):
    with urllib.request.urlopen(url, timeout=30) as response:
        return response.read().decode('utf-8')

# Do not submit before the key and the actual update reach the public domain.
assert get(BASE + KEY + '.txt').strip() == KEY, 'Production key is not published yet'
urls = [BASE + path for path in ('', 'uz/', 'tg/')]
for url in urls:
    page = get(url)
    assert '"@type": "MedicalOrganization"' in page and '"@id": "' + BASE + '#organization"' in page, url
    assert 'content="index, follow"' in page, url
    assert '"@type": "FAQPage"' in page and 'id="faq"' in page, url + ': на домене ещё нет главы «Вопросы» (2026-11-03)'
payload = {'host': 'www.vectorecovery.uz', 'key': KEY,
           'keyLocation': BASE + KEY + '.txt', 'urlList': urls}
# общий адрес раздаёт уведомление участникам; Яндексу и Bing — ещё и напрямую (ответ сразу виден)
for endpoint in ('https://api.indexnow.org/indexnow', 'https://yandex.com/indexnow', 'https://www.bing.com/indexnow'):
    request = urllib.request.Request(endpoint,
        data=json.dumps(payload).encode(), headers={'Content-Type': 'application/json; charset=utf-8'})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            print(endpoint, 'HTTP', response.status, response.read().decode()[:200])
    except urllib.error.HTTPError as e:
        print(endpoint, 'HTTP', e.code, e.read().decode()[:200])
