import os
import re

def inject_data_actions(directory):
    replacements = [
        # Add another account button
        ('<span>Add another account</span>', '<span data-action="add-account">Add another account</span>'),
        # Personalization button
        ('<span>Personalization</span>', '<span data-action="personalization">Personalization</span>'),
        # Log out button
        ('<span>Log out</span>', '<span data-action="logout">Log out</span>'),
    ]
    
    count = 0
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(('.html', '.HTML')):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                changed = False
                for old, new in replacements:
                    if old in content and new not in content:
                        content = content.replace(old, new)
                        changed = True
                
                if changed:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(content)
                    count += 1
                    print(f"Injected data-action into: {filepath}")
    
    print(f"\nTotal files updated: {count}")

if __name__ == "__main__":
    inject_data_actions(r"c:\Users\luisg\HPE-NUEVO")
