import json

with open('js/translations.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

es_keys = set(data['Spanish'].keys())
en_keys = set(data['English'].keys())

missing_in_en = es_keys - en_keys
missing_in_es = en_keys - es_keys

print(f"Total Spanish keys: {len(es_keys)}")
print(f"Total English keys: {len(en_keys)}")
print(f"Missing in English: {len(missing_in_en)}")
if missing_in_en:
    print(list(missing_in_en)[:10]) # show some
