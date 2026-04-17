import os
import re

def update_html_files():
    base_dir = r"c:\Users\luisg\HPE-NUEVO"
    
    # Target files in base, menu/, and pages/
    directories = [base_dir, os.path.join(base_dir, "menu"), os.path.join(base_dir, "pages")]
    
    # Pattern to match the "Upgrade plan" button robustly across spaces
    pattern = r'\s*<button class="menu-item">\s*<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 2l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z"></path></svg>\s*<span>Upgrade plan</span>\s*</button>'
    
    for directory in directories:
        if not os.path.isdir(directory): continue
        for f_name in os.listdir(directory):
            if not f_name.lower().endswith(".html"): continue
            
            path = os.path.join(directory, f_name)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Use regex to remove it
            new_content = re.sub(pattern, '', content)
            
            if new_content != content:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Removed 'Upgrade plan' from {f_name}")

if __name__ == '__main__':
    update_html_files()
