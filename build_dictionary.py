import os
import json
import urllib.request
import urllib.parse
import time

def chunk_list(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

def translate_chunk(texts, target_lang):
    # Join with newlines
    combined_text = '\n'.join(texts)
    try:
        url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=' + target_lang + '&dt=t&q=' + urllib.parse.quote(combined_text)
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req)
        data = json.loads(response.read().decode('utf-8'))
        
        # The API returns chunks of translations. We must assemble them.
        translated_full = ""
        for sentence in data[0]:
            if sentence[0]:
                translated_full += sentence[0]
                
        # Split back into array
        translated_list = [t.strip() for t in translated_full.split('\n')]
        
        # Fallback if split mismatch (Google API sometimes eats newlines)
        if len(translated_list) != len(texts):
            print(f"Warning: Chunk length mismatch ({len(translated_list)} vs {len(texts)}). Falling back to individual translations for this chunk...")
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
        # fallback
        return texts

def build_dict():
    with open(r"c:\Users\luisg\HPE-NUEVO\extracted_strings.json", 'r', encoding='utf-8') as f:
        strings = json.load(f)
        
    print(f"Translating {len(strings)} strings to English...")
    
    translations = {
        "English": {},
        "French": {},
        "Spanish": {} # Spanish maps to itself
    }
    
    # Spanish self-mapping
    for s in strings:
        translations["Spanish"][s] = s

    # Translate to English
    eng_translations = []
    for i, chunk in enumerate(chunk_list(strings, 30)):
        print(f"Translating chunk {i+1} to English...")
        eng_translations.extend(translate_chunk(chunk, 'en'))
        time.sleep(1.5) # rate limit prevention

    # Translate to French
    fra_translations = []
    for i, chunk in enumerate(chunk_list(strings, 30)):
        print(f"Translating chunk {i+1} to French...")
        fra_translations.extend(translate_chunk(chunk, 'fr'))
        time.sleep(1.5)
        
    for i, original in enumerate(strings):
        en_val = eng_translations[i] if i < len(eng_translations) else original
        fr_val = fra_translations[i] if i < len(fra_translations) else original
        
        translations["English"][original] = en_val
        translations["French"][original] = fr_val
        
    os.makedirs(r"c:\Users\luisg\HPE-NUEVO\js", exist_ok=True)
    out_path = r"c:\Users\luisg\HPE-NUEVO\js\translations.json"
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(translations, f, ensure_ascii=False, indent=2)
        
    print(f"Successfully generated translations at {out_path}")

if __name__ == "__main__":
    build_dict()
