import re
with open('../INDEX.HTML', 'r', encoding='utf-8') as f:
    html = f.read()
# Extract the SVG wrapper
match = re.search(r'(<a class="gn-nav-link hpe-logo-small".*?</a>)', html, re.DOTALL)
if match:
    logo_html = match.group(1)
    
    # Modify the logo html to be the mobile version
    mobile_logo_html = logo_html.replace('gn-nav-link hpe-logo-small', 'mobile-dashboard-logo hpe-logo-small')
    
    # Insert right after <div class="menu-overlay" id="menuOverlay"></div>
    insert_str = '<div class="menu-overlay" id="menuOverlay"></div>'
    new_html = html.replace(insert_str, insert_str + '\n\n    <!-- Mobile Dashboard Logo -->\n    ' + mobile_logo_html)
    
    with open('../INDEX.HTML', 'w', encoding='utf-8') as f:
        f.write(new_html)
    print('Successfully updated INDEX.HTML')
else:
    print('Logo not found')