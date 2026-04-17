import os
import re

def update_files():
    base_dir = r"c:\Users\luisg\HPE-NUEVO"
    
    # Files to process
    html_files = [os.path.join(base_dir, "INDEX.HTML")]
    
    for d in ['menu', 'pages']:
        dir_path = os.path.join(base_dir, d)
        if os.path.isdir(dir_path):
            for f in os.listdir(dir_path):
                if f.endswith('.html'):
                    html_files.append(os.path.join(dir_path, f))
                    
    for filepath in html_files:
        if not os.path.exists(filepath):
            continue
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_content = content
        
        # Remove Upgrade button
        content = content.replace('<div class="upgrade-btn-inline">Upgrade</div>', '')
        
        # Replace names
        content = content.replace('>XxLuisxX 5411</div>', '>Guest</div>')
        content = content.replace('>X5</div>', '>GU</div>')
        content = content.replace('>Free</div>', '>Visitor</div>')
        
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {filepath}")

if __name__ == '__main__':
    update_files()
