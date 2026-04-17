import os
import re

translator_tag_root = '    <script src="js/translator.js" defer></script>\n'
translator_tag_sub = '    <script src="../js/translator.js" defer></script>\n'

def inject_translator(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith((".html", ".HTML")):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                if "translator.js" in content:
                    print(f"Already has translator.js: {filepath}")
                    continue

                head_close_idx = content.find("</head>")
                if head_close_idx != -1:
                    # Determine if it's in a sub-directory
                    rel_path = os.path.relpath(filepath, directory)
                    if os.sep in rel_path:
                        tag = translator_tag_sub
                    else:
                        tag = translator_tag_root

                    new_content = content[:head_close_idx] + tag + content[head_close_idx:]
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Injected translator.js into: {filepath}")

if __name__ == "__main__":
    inject_translator(r"c:\Users\luisg\HPE-NUEVO")
