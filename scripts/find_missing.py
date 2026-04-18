import os
import json
import re
from html.parser import HTMLParser

class SmartTextExtractor(HTMLParser):
    """Extracts visible text from HTML, ignoring scripts, styles, and code."""
    def __init__(self):
        super().__init__()
        self.texts = {}  # Using dict to preserve order and deduplicate
        self.ignore = False
        self.ignore_tags = {'script', 'style', 'code', 'noscript'}
        self.current_tag = None

    def handle_starttag(self, tag, attrs):
        self.current_tag = tag
        if tag in self.ignore_tags:
            self.ignore = True
        # Extract placeholder, title, alt attributes
        for attr_name, attr_val in attrs:
            if attr_name in ('placeholder', 'title', 'alt') and attr_val and attr_val.strip():
                cleaned = self._clean(attr_val)
                if cleaned and len(cleaned) > 1:
                    self.texts[cleaned] = True

    def handle_endtag(self, tag):
        if tag in self.ignore_tags:
            self.ignore = False

    def handle_data(self, data):
        if self.ignore:
            return
        cleaned = self._clean(data)
        if cleaned and len(cleaned) > 1:
            # Filter out CSS-like, code-like, and numeric-only strings
            if not cleaned.startswith('var(') and not cleaned.startswith('.') and not cleaned.startswith('{'):
                if not cleaned.isdigit():
                    if not cleaned.startswith('/*') and not cleaned.startswith('//'):
                        if not cleaned.startswith('http') and not cleaned.startswith('src='):
                            self.texts[cleaned] = True

    def _clean(self, text):
        """Normalize whitespace while preserving the text."""
        # Collapse multiple whitespace/newlines into single space
        t = re.sub(r'\s+', ' ', text).strip()
        return t

def extract_all_texts():
    """Extract all unique visible texts from INDEX.HTML, pages/, and menu/."""
    extractor = SmartTextExtractor()
    directories = [
        r"c:\Users\luisg\HPE-NUEVO\INDEX.HTML",
    ]
    
    # Process INDEX.HTML
    with open(directories[0], 'r', encoding='utf-8', errors='ignore') as f:
        extractor.feed(f.read())
    
    # Process pages/ and menu/
    for folder in [r"c:\Users\luisg\HPE-NUEVO\pages", r"c:\Users\luisg\HPE-NUEVO\menu"]:
        for file in os.listdir(folder):
            if file.endswith(('.html', '.HTML')):
                filepath = os.path.join(folder, file)
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    extractor.feed(f.read())
    
    return list(extractor.texts.keys())

def main():
    print("Phase 1: Extracting all text from HTML files...")
    all_texts = extract_all_texts()
    print(f"  Found {len(all_texts)} unique text strings.")
    
    # Load existing translations
    trans_path = r"c:\Users\luisg\HPE-NUEVO\js\translations.json"
    with open(trans_path, 'r', encoding='utf-8') as f:
        existing = json.load(f)
    
    existing_en = existing.get("English", {})
    existing_fr = existing.get("French", {})
    existing_es = existing.get("Spanish", {})
    
    # Find missing texts
    missing = []
    for text in all_texts:
        if text not in existing_en:
            missing.append(text)
    
    print(f"  Already translated: {len(existing_en)}")
    print(f"  Missing translations: {len(missing)}")
    
    # Save missing for reference
    with open(r"c:\Users\luisg\HPE-NUEVO\scripts\missing_strings.json", 'w', encoding='utf-8') as f:
        json.dump(missing, f, ensure_ascii=False, indent=2)
    
    print(f"\nPhase 2: Translating {len(missing)} missing strings...")
    print("  Saved missing strings to scripts/missing_strings.json")

if __name__ == "__main__":
    main()
