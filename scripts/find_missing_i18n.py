import os
from html.parser import HTMLParser
from pathlib import Path

class TextNodeFinder(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.results = []
        self.ignore = False
        self.ignore_tags = {'script', 'style', 'noscript'}

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        self.stack.append((tag, attrs))
        if tag in self.ignore_tags:
            self.ignore = True

    def handle_endtag(self, tag):
        if self.stack:
            self.stack.pop()
        self.ignore = any(t in self.ignore_tags for t, _ in self.stack)

    def handle_data(self, data):
        if self.ignore:
            return
        text = data.strip()
        if len(text) <= 1:
            return
        if text.isspace():
            return
        attrs = self.stack[-1][1] if self.stack else {}
        if 'data-i18n' not in attrs:
            self.results.append((self.getpos()[0], self.stack[-1][0] if self.stack else '', text))

for path in Path('.').rglob('*.html'):
    txt = path.read_text(encoding='utf-8', errors='ignore')
    parser = TextNodeFinder()
    parser.feed(txt)
    if parser.results:
        print('FILE', path)
        for line, tag, text in parser.results[:20]:
            print(line, tag, text)
        print('---', len(parser.results), 'entries\n')
