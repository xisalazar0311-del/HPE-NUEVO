import json
import time
from deep_translator import GoogleTranslator

def main():
    missing_path = r'c:\Users\luisg\HPE-NUEVO\scratch\todo_missing.json'
    trans_path = r'c:\Users\luisg\HPE-NUEVO\js\translations.json'
    
    with open(missing_path, 'r', encoding='utf-8') as f:
        missing_dict = json.load(f)
        
    with open(trans_path, 'r', encoding='utf-8') as f:
        master_dict = json.load(f)
        
    en_dict = master_dict.get('English', {})
    fr_dict = master_dict.get('French', {})
    es_dict = master_dict.get('Spanish', {})
    
    en_translator = GoogleTranslator(source='es', target='en')
    fr_translator = GoogleTranslator(source='es', target='fr')
    
    print(f"Translating {len(missing_dict)} items...")
    
    count = 0
    
    # We will translate both proper keys and fallback texts
    # For fallback texts (started with orig_), the SPANISH text itself needs to be the key in English/French
    # because that's how translator.js does fallback!
    for key, text in missing_dict.items():
        count += 1
        if count % 25 == 0:
            print(f"Processed {count}/{len(missing_dict)}...")
        
        normalized_es = ' '.join(text.split()).strip()
        
        if key.startswith("orig_"):
            target_key = normalized_es
        else:
            target_key = key
            
        if target_key not in es_dict:
            es_dict[target_key] = normalized_es
            
        # English translation
        if target_key not in en_dict:
            try:
                en_dict[target_key] = en_translator.translate(normalized_es)
            except Exception as e:
                print(f"Skipping EN translation for {target_key[:20]}: {e}")
                en_dict[target_key] = normalized_es  # fallback to Spanish
                time.sleep(1)
                
        # French translation
        if target_key not in fr_dict:
            try:
                fr_dict[target_key] = fr_translator.translate(normalized_es)
            except Exception as e:
                print(f"Skipping FR translation for {target_key[:20]}: {e}")
                fr_dict[target_key] = normalized_es  # fallback to Spanish
                time.sleep(1)

    master_dict['Spanish'] = es_dict
    master_dict['English'] = en_dict
    master_dict['French'] = fr_dict
    
    with open(trans_path, 'w', encoding='utf-8') as f:
        json.dump(master_dict, f, ensure_ascii=False, indent=2)
        
    print("translations.json updated successfully!")

main()
