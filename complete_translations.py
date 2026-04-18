import os
import json
import urllib.request
import urllib.parse
import time
from pathlib import Path
from html.parser import HTMLParser

class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.text = []
        self.capture = False
        self.tag_stack = []

    def handle_starttag(self, tag, attrs):
        if self.capture:
            self.tag_stack.append(tag)
        for attr, value in attrs:
            if attr == 'data-i18n':
                self.capture = True
                self.current_key = value
                self.text = []
                self.tag_stack = [tag]
                break

    def handle_endtag(self, tag):
        if self.capture:
            if self.tag_stack and self.tag_stack[-1] == tag:
                self.tag_stack.pop()
                if not self.tag_stack:
                    self.capture = False
                    self.extracted[self.current_key] = ''.join(self.text).strip()

    def handle_data(self, data):
        if self.capture:
            self.text.append(data)

def chunk_list(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

def translate_chunk(texts, target_lang):
    combined_text = '\n'.join(texts)
    try:
        url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=' + target_lang + '&dt=t&q=' + urllib.parse.quote(combined_text)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req)
        data = json.loads(response.read().decode('utf-8'))
        
        translated_full = ""
        for sentence in data[0]:
            if sentence[0]:
                translated_full += sentence[0]
                
        translated_list = [t.strip() for t in translated_full.split('\n')]
        
        if len(translated_list) != len(texts):
            print(f"Warning: Chunk length mismatch ({len(translated_list)} vs {len(texts)}). Falling back...")
            translated_list = []
            for text in texts:
                try:
                    s_url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=' + target_lang + '&dt=t&q=' + urllib.parse.quote(text)
                    s_req = urllib.request.Request(s_url, headers={'User-Agent': 'Mozilla/5.0'})
                    s_res = urllib.request.urlopen(s_req)
                    s_data = json.loads(s_res.read().decode('utf-8'))
                    translated_list.append(s_data[0][0][0].strip() if s_data[0][0][0] else "")
                except Exception as e:
                    print("Error on single:", e)
                    translated_list.append(text)
                    time.sleep(1)
        
        return translated_list
    except Exception as e:
        print(f"Error translating chunk: {e}")
        return texts

# Get all keys and texts
keys = set()
key_to_text = {}
for path in Path('.').rglob('*.html'):
    with open(path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()
        parser = TextExtractor()
        parser.extracted = {}
        parser.feed(content)
        for k, t in parser.extracted.items():
            keys.add(k)
            key_to_text[k] = t

# Existing keys
existing_keys = set()
with open('js/translations.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
    for lang in data:
        existing_keys.update(data[lang].keys())

missing_keys = keys - existing_keys

missing_texts = [key_to_text[k] for k in missing_keys]

print(f"Translating {len(missing_texts)} missing strings...")

# Translate to English
eng_translations = []
for i, chunk in enumerate(chunk_list(missing_texts, 30)):
    print(f"Translating chunk {i+1} to English...")
    eng_translations.extend(translate_chunk(chunk, 'en'))
    time.sleep(1.5)

# Translate to French
fra_translations = []
for i, chunk in enumerate(chunk_list(missing_texts, 30)):
    print(f"Translating chunk {i+1} to French...")
    fra_translations.extend(translate_chunk(chunk, 'fr'))
    time.sleep(1.5)

# Add to data
for i, key in enumerate(missing_keys):
    spanish = missing_texts[i]
    english = eng_translations[i] if i < len(eng_translations) else spanish
    french = fra_translations[i] if i < len(fra_translations) else spanish
    
    data["Spanish"][key] = spanish
    data["English"][key] = english
    data["French"][key] = french

# Save
with open('js/translations.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Updated translations.json with missing keys.")