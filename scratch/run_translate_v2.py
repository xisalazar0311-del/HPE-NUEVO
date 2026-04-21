import json
import time
import sys
from deep_translator import GoogleTranslator

def translate_text(text, target, retries=3):
    for attempt in range(retries):
        try:
            result = GoogleTranslator(source='es', target=target).translate(text)
            return result
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(1)
            else:
                return text  # fallback to original

def main():
    missing_path = r'c:\Users\luisg\HPE-NUEVO\scratch\todo_missing.json'
    trans_path = r'c:\Users\luisg\HPE-NUEVO\js\translations.json'
    
    with open(missing_path, 'r', encoding='utf-8') as f:
        missing_dict = json.load(f)
        
    with open(trans_path, 'r', encoding='utf-8') as f:
        master_dict = json.load(f)
        
    es_dict = master_dict.get('Spanish', {})
    en_dict = master_dict.get('English', {})
    fr_dict = master_dict.get('French', {})
    
    total = len(missing_dict)
    print(f"Total items to process: {total}", flush=True)
    
    count = 0
    for key, text in missing_dict.items():
        count += 1
        normalized_es = ' '.join(text.split()).strip()
        
        # Determine the target key
        if key.startswith("orig_"):
            target_key = normalized_es
        else:
            target_key = key
        
        # Skip if already exists in all 3
        if target_key in es_dict and target_key in en_dict and target_key in fr_dict:
            continue
            
        # Add to Spanish
        if target_key not in es_dict:
            es_dict[target_key] = normalized_es
        
        # Translate to English
        if target_key not in en_dict:
            en_text = translate_text(normalized_es, 'en')
            en_dict[target_key] = en_text
            
        # Translate to French
        if target_key not in fr_dict:
            fr_text = translate_text(normalized_es, 'fr')
            fr_dict[target_key] = fr_text
        
        if count % 10 == 0:
            print(f"Progress: {count}/{total}", flush=True)
            # Save periodically
            master_dict['Spanish'] = es_dict
            master_dict['English'] = en_dict
            master_dict['French'] = fr_dict
            with open(trans_path, 'w', encoding='utf-8') as f:
                json.dump(master_dict, f, ensure_ascii=False, indent=2)
    
    # Final save
    master_dict['Spanish'] = es_dict
    master_dict['English'] = en_dict
    master_dict['French'] = fr_dict
    with open(trans_path, 'w', encoding='utf-8') as f:
        json.dump(master_dict, f, ensure_ascii=False, indent=2)
        
    print(f"Done! Processed {count} items.", flush=True)

main()
