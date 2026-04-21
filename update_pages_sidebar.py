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

if start_idx == -1 or end_idx == -1:
    print('Sidebar not found in INDEX.HTML')
    exit(1)

sidebar_block = idx_content[start_idx:end_idx]

# Adjust paths for pages/ folder:
# data-url="menu/..." -> data-url="../menu/..."
sidebar_block = sidebar_block.replace('data-url="menu/', 'data-url="../menu/')

# Fix Chat button: change <button> to <a> linking to ../INDEX.HTML
sidebar_block = sidebar_block.replace(
    '<button class="nav-item active" data-nav="strategy">',
    '<a class="nav-item" href="../INDEX.HTML">'
)
# Close the <a> tag instead of </button>
# Find the specific closing </button> for Chat
sidebar_block = sidebar_block.replace(
    """<span class="nav-label" data-i18n="Chat">Chat</span>
        </button>""",
    """<span class="nav-label" data-i18n="Chat">Chat</span>
        </a>"""
)

# Inject into all pages/*.html
page_files = glob.glob('pages/*.html')
count = 0
for file in page_files:
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
            count += 1
            print(f'Updated {file}')
        else:
            print(f'Closing aside not found in {file}')
    else:
        print(f'Sidebar start tag not found in {file}')

print(f'\nDone: {count} files updated.')
