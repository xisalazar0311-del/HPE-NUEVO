import re
import os
from pathlib import Path
import json
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

# First, get all keys from HTML
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

missing = keys - existing_keys

print('Missing keys with default text:')
for k in sorted(missing):
    text = key_to_text.get(k, 'NOT FOUND')
    print(f'"{k}": "{text}"')