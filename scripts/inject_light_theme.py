import os

css = """
/* ===== LIGHT THEME (SENIOR ARCHITECTURE) ===== */
html.light-theme :root {
  --bg-base: #f4f6fa;
  --bg-surface: #ffffff;
  --bg-card: #ffffff;
  --bg-card-inner: #f9fafb;
  --bg-input: #ffffff;
  --border: rgba(0, 0, 0, 0.08);
  --border-hover: rgba(1, 169, 130, 0.4);
  --accent: #01a982;
  --accent-dim: rgba(1, 169, 130, 0.12);
  --accent-glow: rgba(1, 169, 130, 0.2);
  --text-primary: #1a202c;
  --text-secondary: #4a5568;
  --text-muted: #718096;
  --shadow-card: 0 4px 20px rgba(0, 0, 0, 0.04);
  --shadow-glow: 0 0 15px rgba(1, 169, 130, 0.15);
  
  /* style_hpe.css vars mapping */
  --hpe-dark: #f4f6fa;
  --hpe-card: #ffffff;
  --border-glass: rgba(0, 0, 0, 0.08);
  --hpe-accent: #01a982;
  --hpe-deep: #00cca0;
}

/* Forcing specific components that might have hardcoded dark colors */
html.light-theme .sidebar {
  background: rgba(255, 255, 255, 0.96) !important;
  border-right: 1px solid var(--border) !important;
}

html.light-theme .sidebar::-webkit-scrollbar-track {
  background: var(--bg-base) !important;
}

html.light-theme .settings-overlay,
html.light-theme .auth-overlay,
html.light-theme .menu-overlay {
  background: rgba(255, 255, 255, 0.7) !important;
}

html.light-theme a.hpe-logo-small .hpe-logo {
  --hpe-logo-bg: #fff !important;
  --hpe-logo-color: #01a982 !important; 
}

html.light-theme a.hpe-logo-small path {
  stroke: #01a982 !important;
}

html.light-theme .user-menu-popup {
  background: rgba(255, 255, 255, 0.98) !important;
  border: 1px solid rgba(0,0,0,0.1) !important;
  box-shadow: 0 10px 30px rgba(0,0,0,0.08) !important;
}

html.light-theme .menu-divider {
  background: rgba(0,0,0,0.06) !important;
}

html.light-theme .menu-item {
  color: var(--text-secondary) !important;
}

html.light-theme .menu-item:hover {
  background: rgba(0,0,0,0.04) !important;
  color: var(--text-primary) !important;
}

html.light-theme .avatar-sm {
  border: 1px solid var(--border) !important;
}

html.light-theme .upgrade-btn-inline {
  border: 1px solid rgba(0,0,0,0.15) !important;
  color: var(--text-primary) !important;
}

/* Chat text inputs and dark hardcoded areas */
html.light-theme .chat-input-premium input {
  background: rgba(0,0,0,0.03) !important;
  color: var(--text-primary) !important;
}

html.light-theme .custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0,0,0,0.15) !important;
}
html.light-theme .custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: var(--accent) !important;
}

html.light-theme .glass-card-sm, 
html.light-theme .glass-panel {
  background: rgba(255,255,255,0.7) !important;
  border: 1px solid var(--border) !important;
}
html.light-theme .glass-card-solid, 
html.light-theme .glass-header {
  background: rgba(255,255,255,0.95) !important;
}

html.light-theme .company-card .name {
  color: var(--text-primary) !important;
}

html.light-theme .settings-modal,
html.light-theme .auth-modal {
  background: var(--bg-card);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-card), var(--shadow-glow);
}
"""

def update_css():
    paths = [
        r"c:\Users\luisg\HPE-NUEVO\styles.css"
    ]
    for p in paths:
        if os.path.exists(p):
            with open(p, "a", encoding="utf-8") as f:
                f.write(css)
            print(f"Appended light theme CSS to {p}")

if __name__ == "__main__":
    update_css()
