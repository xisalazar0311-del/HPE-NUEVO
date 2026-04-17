import os
import re

def add_script_to_file(filepath):
    # Determine the correct relative path to auth.js depending on the directory depth
    basename = os.path.basename(filepath)
    dirname = os.path.dirname(filepath)
    
    if basename.lower() == 'index.html' and "pages" not in dirname.lower() and "menu" not in dirname.lower():
        script_src = '<script src="auth.js"></script>'
    else:
        script_src = '<script src="../auth.js"></script>'

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # check if already there
    if 'src="auth.js"' in content or 'src="../auth.js"' in content:
        return

    # Add before </body>
    if '</body>' in content:
        new_content = content.replace('</body>', f'  {script_src}\n</body>')
    else:
        # append at the end
        new_content = content + f'\n{script_src}'

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f"Injected auth script to {filepath}")

def main():
    base_dir = r"c:\Users\luisg\HPE-NUEVO"
    
    # Process INDEX.HTML
    index_path = os.path.join(base_dir, "INDEX.HTML")
    if os.path.exists(index_path):
        add_script_to_file(index_path)

    # Process menu/*.html
    menu_dir = os.path.join(base_dir, "menu")
    if os.path.exists(menu_dir):
        for f_name in os.listdir(menu_dir):
            if f_name.endswith('.html'):
                add_script_to_file(os.path.join(menu_dir, f_name))

    # Process pages/*.html
    pages_dir = os.path.join(base_dir, "pages")
    if os.path.exists(pages_dir):
        for f_name in os.listdir(pages_dir):
            if f_name.endswith('.html'):
                add_script_to_file(os.path.join(pages_dir, f_name))

if __name__ == '__main__':
    main()
