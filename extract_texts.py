import os
import re
from bs4 import BeautifulSoup

def extract_i18n_texts(directory):
    i18n_dict = {}
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.html'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    soup = BeautifulSoup(content, 'html.parser')
                    elements = soup.find_all(attrs={'data-i18n': True})
                    for elem in elements:
                        key = elem.get('data-i18n')
                        text = elem.get_text(strip=True)
                        if key not in i18n_dict:
                            i18n_dict[key] = text
    return i18n_dict

if __name__ == '__main__':
    directory = r'C:\Users\gaelo\Downloads\HPE-NS'
    texts = extract_i18n_texts(directory)
    for key, text in sorted(texts.items()):
        print(f'"{key}": "{text}"')