import os
import re

# 1. Update styles.css
styles_path = r"c:\Users\luisg\HPE-NUEVO\styles.css"
with open(styles_path, 'r', encoding='utf-8') as f:
    css = f.read()

# Add flex layout to sidebar if not present
if "display: flex;" not in css.split(".sidebar {")[1].split("}")[0]:
    css = re.sub(r'(\.sidebar\s*\{[^\}]*)(\})', r'\1  display: flex;\n  flex-direction: column;\n\2', css, count=1)

# Change popup background color
# Replaces: background: #2d2d2d;
# With: background: rgba(22, 27, 34, 0.95); backdrop-filter: blur(12px);
css = re.sub(r'(?<=.user-menu-popup \{\n).*?(?=^\})', lambda m: m.group(0).replace('background: #2d2d2d;', 'background: rgba(22, 27, 34, 0.95);\n  backdrop-filter: blur(12px);'), css, flags=re.MULTILINE|re.DOTALL)
# Also change the hover color of button
css = re.sub(r'(?<=.sidebar-footer-btn:hover \{\n).*?(?=^\})', lambda m: m.group(0).replace('background: #2b2b2b;', 'background: rgba(255,255,255,0.06);'), css, flags=re.MULTILINE|re.DOTALL)


with open(styles_path, 'w', encoding='utf-8') as f:
    f.write(css)
print("Updated styles.css")

# 2. Update css/style_hpe.css for the colors
style_hpe_path = r"c:\Users\luisg\HPE-NUEVO\css\style_hpe.css"
with open(style_hpe_path, 'r', encoding='utf-8') as f:
    hpe_css = f.read()

hpe_css = re.sub(r'(?<=.user-menu-popup \{\n).*?(?=^\})', lambda m: m.group(0).replace('background: #2d2d2d;', 'background: rgba(22, 27, 34, 0.95);\n  backdrop-filter: blur(12px);'), hpe_css, flags=re.MULTILINE|re.DOTALL)
hpe_css = re.sub(r'(?<=.sidebar-footer-btn:hover \{\n).*?(?=^\})', lambda m: m.group(0).replace('background: #2b2b2b;', 'background: rgba(255,255,255,0.06);'), hpe_css, flags=re.MULTILINE|re.DOTALL)

with open(style_hpe_path, 'w', encoding='utf-8') as f:
    f.write(hpe_css)
print("Updated css/style_hpe.css")

# 3. Update all files in pages/
pages_dir = r"c:\Users\luisg\HPE-NUEVO\pages"
html_to_inject = """      <div class="sidebar-footer-container" style="position: relative; padding: 16px; border-top: 1px solid rgba(255,255,255,0.07);">
        <!-- Popup Menu -->
        <div class="user-menu-popup" id="userMenuPopup">
          <div class="popup-header">
            <div class="avatar-sm gold">X5</div>
            <div class="user-info">
              <div class="user-name" style="color: #fff; font-weight: 600; font-size: 0.85rem;">XxLuisxX 5411</div>
              <div class="user-role" style="color: #aaa; font-size: 0.75rem;">Free</div>
            </div>
          </div>
          
          <button class="menu-item mt-1">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Add another account</span>
          </button>
          <div class="menu-divider"></div>
          <button class="menu-item">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 2l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z"></path></svg>
            <span>Upgrade plan</span>
          </button>
          <button class="menu-item">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle></svg>
            <span>Personalization</span>
          </button>
          <button class="menu-item">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>Profile</span>
          </button>
          <button class="menu-item">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            <span>Settings</span>
          </button>
          <div class="menu-divider"></div>
          <button class="menu-item menu-item-between">
            <div style="display:flex; align-items:center; gap:12px;">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="4"></circle><line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line><line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line><line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line><line x1="14.83" y1="9.17" x2="18.36" y2="5.64"></line><line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line></svg>
              <span>Help</span>
            </div>
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>
          </button>
          <button class="menu-item">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span>Log out</span>
          </button>
        </div>

        <button class="sidebar-footer-btn" id="sidebarFooterBtn">
          <div class="avatar-sm gold" style="flex-shrink:0;">X5</div>
          <div class="user-info" style="flex-grow:1;">
            <div class="user-name">XxLuisxX 5411</div>
            <div class="user-role">Free</div>
          </div>
          <div class="upgrade-btn-inline">Upgrade</div>
        </button>
      </div>
      
      <script>
        document.addEventListener('DOMContentLoaded', function() {
          const btn = document.getElementById('sidebarFooterBtn');
          const popup = document.getElementById('userMenuPopup');
          if(btn && popup) {
            btn.addEventListener('click', function(e) {
              e.stopPropagation();
              popup.classList.toggle('active');
            });
            document.addEventListener('click', function(e) {
              if(!popup.contains(e.target) && !btn.contains(e.target)) {
                popup.classList.remove('active');
              }
            });
          }
        });
      </script>"""

pattern = r'<div class="sidebar-footer">.*?</div>\s*</aside>'
for f_name in os.listdir(pages_dir):
    if f_name.endswith(".html"):
        path = os.path.join(pages_dir, f_name)
        with open(path, "r", encoding="utf-8") as f:
            mod_content = f.read()
        
        if '<div class="sidebar-footer-container"' not in mod_content:
            new_mod = re.sub(pattern, html_to_inject + "\n    </aside>", mod_content, flags=re.DOTALL)
            if new_mod != mod_content:
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new_mod)
                print(f"Updated pages/{f_name}")
