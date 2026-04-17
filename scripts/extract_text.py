import os
from html.parser import HTMLParser

class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.texts = set()
        self.ignore = False
        self.ignore_tags = {'script', 'style', 'code'}

    def handle_starttag(self, tag, attrs):
        if tag in self.ignore_tags:
            self.ignore = True

    def handle_endtag(self, tag):
        if tag in self.ignore_tags:
            self.ignore = False

    def handle_data(self, data):
        if not self.ignore:
            t = data.strip()
            # filter out very short non-word artifacts, pure numbers, or css-like artifacts
            if len(t) > 1 and not t.isdigit() and not t.startswith('var(') and not t.startswith('.'):
                self.texts.add(t)

def extract_all():
    extractor = TextExtractor()
    count = 0
    for root, dirs, files in os.walk(r"c:\Users\luisg\HPE-NUEVO"):
        for file in files:
            if file.endswith(".html") or file.endswith(".HTML"):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    extractor.feed(f.read())
                count += 1
    
    unique_texts = sorted(list(extractor.texts))
    import json
    with open(r"c:\Users\luisg\HPE-NUEVO\extracted_strings.json", 'w', encoding='utf-8') as f:
        json.dump(unique_texts, f, indent=2)
    print(f"Scanned {count} html files. Found {len(unique_texts)} unique strings.")

if __name__ == "__main__":
    extract_all()
