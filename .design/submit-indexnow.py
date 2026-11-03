"""Notify participating search engines after production is updated (no scheduled task).
Run: python3 .design/submit-indexnow.py
A 200/202 response acknowledges receipt, not indexing or rankings.
"""
import json
from pathlib import Path
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
payload = {'host': 'www.vectorecovery.uz', 'key': KEY,
           'keyLocation': BASE + KEY + '.txt', 'urlList': urls}
request = urllib.request.Request('https://api.indexnow.org/indexnow',
    data=json.dumps(payload).encode(), headers={'Content-Type': 'application/json; charset=utf-8'})
with urllib.request.urlopen(request, timeout=30) as response:
    print('IndexNow HTTP', response.status, response.read().decode())
