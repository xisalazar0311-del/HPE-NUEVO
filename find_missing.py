import re
import os
from pathlib import Path
import json

keys = set()
for path in Path('.').rglob('*.html'):
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        matches = re.findall(r'data-i18n="([^"]+)"', content)
        keys.update(matches)

existing_keys = set()
with open('js/translations.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
    for lang in data:
        existing_keys.update(data[lang].keys())

missing = keys - existing_keys
print('Missing keys:')
for k in sorted(missing):
    print(f'"{k}"')