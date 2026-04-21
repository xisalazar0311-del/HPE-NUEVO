import os, glob

# Read INDEX.HTML and extract sidebar
with open('INDEX.HTML', 'r', encoding='utf-8') as f:
    idx_content = f.read()

start_tag = '<aside class="sidebar" id="sidebar">'
start_idx = idx_content.find(start_tag)
open_count = 0
end_idx = -1

if start_idx != -1:
    for i in range(start_idx, len(idx_content)):
        if idx_content[i:i+6] == '<aside':
            open_count += 1
        elif idx_content[i:i+7] == '</aside':
            open_count -= 1
            if open_count == 0:
                end_idx = i + 7
                break

if start_idx != -1 and end_idx != -1:
    sidebar_block = idx_content[start_idx:end_idx]

    # Adjust paths for menu/ folder
    sidebar_block = sidebar_block.replace('data-url="menu/', 'data-url="')

    # Fix Chat button
    chat_html_old = '''<button class="nav-item active" data-nav="strategy">
          <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span class="nav-label" data-i18n="Chat">Chat</span>
        </button>'''
            
    chat_html_new = '''<a class="nav-item" href="../INDEX.HTML">
          <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"
            stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <span class="nav-label" data-i18n="Chat">Chat</span>
        </a>'''

    sidebar_block = sidebar_block.replace(chat_html_old, chat_html_new)

    # Inject into all menu/*.html
    menu_files = glob.glob('menu/*.html')
    for file in menu_files:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        s_idx = content.find(start_tag)
        if s_idx != -1:
            o_count = 0
            e_idx = -1
            for i in range(s_idx, len(content)):
                if content[i:i+6] == '<aside':
                    o_count += 1
                elif content[i:i+7] == '</aside':
                    o_count -= 1
                    if o_count == 0:
                        e_idx = i + 7
                        break
            if e_idx != -1:
                new_content = content[:s_idx] + sidebar_block + content[e_idx:]
                with open(file, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f'Updated {file}')
            else:
                print(f'Closing aside not found in {file}')
        else:
            print(f'Sidebar start tag not found in {file}')
else:
    print('Sidebar not found in INDEX.HTML')
