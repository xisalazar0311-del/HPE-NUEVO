import os

# Read pages/ACS.html sidebar as source (clean copy)
with open('pages/ACS.html', 'r', encoding='utf-8') as f:
    src_content = f.read()

start_tag = '<aside class="sidebar" id="sidebar">'
s_idx = src_content.find(start_tag)
o_count = 0
e_idx = -1
for i in range(s_idx, len(src_content)):
    if src_content[i:i+6] == '<aside':
        o_count += 1
    elif src_content[i:i+7] == '</aside':
        o_count -= 1
        if o_count == 0:
            e_idx = i + 7
            break

sidebar_block = src_content[s_idx:e_idx]

# Adjust paths for INDEX.HTML (root level):
# ../menu/ -> menu/
sidebar_block = sidebar_block.replace('data-url="../menu/', 'data-url="menu/')

# Chat: change <a href="../INDEX.HTML"> back to <button data-nav="strategy" class="active">
sidebar_block = sidebar_block.replace(
    '<a class="nav-item" href="../INDEX.HTML">',
    '<button class="nav-item active" data-nav="strategy">'
)
sidebar_block = sidebar_block.replace(
    """<span class="nav-label" data-i18n="Chat">Chat</span>
        </a>""",
    """<span class="nav-label" data-i18n="Chat">Chat</span>
        </button>"""
)

# Now replace in INDEX.HTML
with open('INDEX.HTML', 'r', encoding='utf-8') as f:
    idx_content = f.read()

idx_s = idx_content.find(start_tag)
idx_o = 0
idx_e = -1
for i in range(idx_s, len(idx_content)):
    if idx_content[i:i+6] == '<aside':
        idx_o += 1
    elif idx_content[i:i+7] == '</aside':
        idx_o -= 1
        if idx_o == 0:
            idx_e = i + 7
            break

new_content = idx_content[:idx_s] + sidebar_block + idx_content[idx_e:]

with open('INDEX.HTML', 'w', encoding='utf-8') as f:
    f.write(new_content)

print('INDEX.HTML sidebar replaced successfully.')
