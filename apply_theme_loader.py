import os
import re

head_script = """
    <!-- HPE Theme Loader (Anti-FOUC) -->
    <script>
      (function(){
        try {
          var pref = localStorage.getItem('hpe_theme_pref') || 'System';
          var isLight = pref === 'Light' || (pref === 'System' && window.matchMedia('(prefers-color-scheme: light)').matches);
          if (isLight) document.documentElement.classList.add('light-theme');
        } catch(e) {}
      })();
    </script>
"""

def inject_loader(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith((".html", ".HTML")):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                if "HPE Theme Loader (Anti-FOUC)" not in content:
                    head_close_idx = content.find("</head>")
                    if head_close_idx != -1:
                        new_content = content[:head_close_idx] + head_script + content[head_close_idx:]
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(new_content)
                        print(f"Injected Theme Loader into: {filepath}")

if __name__ == "__main__":
    inject_loader(r"c:\Users\luisg\HPE-NUEVO")
