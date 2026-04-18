import os
import json
import urllib.request
import urllib.parse
import time

def translate_single(text, target_lang):
    """Translate a single text string."""
    try:
        url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=' + target_lang + '&dt=t&q=' + urllib.parse.quote(text)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req, timeout=10)
        data = json.loads(response.read().decode('utf-8'))
        
        # Assemble all sentence parts
        translated = ""
        for sentence in data[0]:
            if sentence[0]:
                translated += sentence[0]
        return translated.strip()
    except Exception as e:
        print(f"  Error translating '{text[:50]}...': {e}")
        return text

def main():
    # Load missing strings
    with open(r"c:\Users\luisg\HPE-NUEVO\scripts\missing_strings.json", 'r', encoding='utf-8') as f:
        missing = json.load(f)
    
    # Load existing translations
    trans_path = r"c:\Users\luisg\HPE-NUEVO\js\translations.json"
    with open(trans_path, 'r', encoding='utf-8') as f:
        translations = json.load(f)
    
    total = len(missing)
    print(f"Translating {total} missing strings to English and French...")
    print("=" * 60)
    
    for i, text in enumerate(missing):
        # Progress
        if (i + 1) % 20 == 0 or i == 0:
            print(f"  Progress: {i+1}/{total} ({((i+1)/total*100):.0f}%)")
        
        # Spanish maps to itself
        translations["Spanish"][text] = text
        
        # Translate to English
        en_text = translate_single(text, 'en')
        translations["English"][text] = en_text
        time.sleep(0.3)
        
        # Translate to French
        fr_text = translate_single(text, 'fr')
        translations["French"][text] = fr_text
        time.sleep(0.3)
    
    # Save updated translations
    with open(trans_path, 'w', encoding='utf-8') as f:
        json.dump(translations, f, ensure_ascii=False, indent=2)
    
    print("=" * 60)
    print(f"Done! Updated translations.json with {total} new entries.")
    print(f"  Total English: {len(translations['English'])}")
    print(f"  Total French: {len(translations['French'])}")
    print(f"  Total Spanish: {len(translations['Spanish'])}")

if __name__ == "__main__":
    main()
