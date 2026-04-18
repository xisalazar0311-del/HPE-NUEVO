import os
import re
from bs4 import BeautifulSoup

companies = ['ACS', 'BBVA', 'bimbo', 'boeing', 'capgemini', 'cocacola', 'dxc', 'generealmotors', 'Grigols', 'hcl', 'infosys', 'nvidia', 'repsol', 'samsung', 'tesla', 'unam', 'walmart']

translations = {'Spanish': {}, 'English': {}, 'French': {}}

for company in companies:
    file_path = f'pages/{company}.html'
    if os.path.exists(file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            soup = BeautifulSoup(f.read(), 'html.parser')
            elements = soup.find_all(attrs={'data-i18n': True})
            for elem in elements:
                key = elem.get('data-i18n')
                if key.startswith(f'{company.lower()}.'):
                    text = elem.get_text(strip=True)
                    translations['Spanish'][key] = text

# Now add to existing translations.json
import json
with open('js/translations.json', 'r', encoding='utf-8') as f:
    existing = json.load(f)

for lang in translations:
    if lang not in existing:
        existing[lang] = {}
    existing[lang].update(translations[lang])

with open('js/translations.json', 'w', encoding='utf-8') as f:
    json.dump(existing, f, ensure_ascii=False, indent=2)

print("Updated translations.json with Spanish texts.")