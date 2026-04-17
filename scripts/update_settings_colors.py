import os
import re

css_code = '''
/* ===== SETTINGS MODAL ===== */
.settings-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(10, 12, 15, 0.85); /* rgba of --bg-base */
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.25s ease;
}
.settings-overlay.active {
  opacity: 1; visibility: visible;
}
.settings-overlay.hidden {
  display: none !important;
}
.settings-modal {
  width: 860px;
  max-width: 95%;
  height: 580px;
  max-height: 90vh;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  display: flex;
  overflow: hidden;
  box-shadow: var(--shadow-card), var(--shadow-glow);
  transform: translateY(20px) scale(0.98);
  transition: all 0.25s ease;
  position: relative;
}
.settings-overlay.active .settings-modal {
  transform: translateY(0) scale(1);
}
.settings-close-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 1.2rem;
  cursor: pointer;
  z-index: 10;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  transition: all 0.2s;
}
.settings-close-btn:hover {
  background: var(--accent-dim);
  color: var(--accent);
}
.settings-sidebar {
  width: 250px;
  background: var(--bg-card);
  padding: 60px 12px 20px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.settings-tab {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  color: var(--text-secondary);
  background: transparent;
  border: none;
  font-family: var(--font-display);
  font-size: 0.95rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}
.settings-tab:hover {
  background: var(--bg-card-inner);
  color: var(--text-primary);
}
.settings-tab.active {
  background: var(--accent-dim);
  color: var(--accent);
  font-weight: 600;
}
.settings-content-wrapper {
  flex: 1;
  background: var(--bg-surface);
  display: flex;
  flex-direction: column;
  position: relative;
  border-left: 1px solid var(--border);
}
.settings-header-banner {
  padding: 24px 32px 24px;
  margin-top: 10px;
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: 0.95rem;
  line-height: 1.5;
  border-bottom: 1px solid var(--border);
}
.settings-mfa-btn {
  display: inline-block;
  margin-top: 14px;
  padding: 8px 16px;
  background: var(--bg-input);
  color: var(--text-primary);
  border-radius: var(--radius-pill);
  border: 1px solid var(--border);
  font-family: var(--font-display);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.settings-mfa-btn:hover {
  background: var(--bg-card-inner);
  border-color: var(--border-hover);
  box-shadow: var(--shadow-glow);
}
.settings-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 0 32px 32px;
}
.settings-scroll-area::-webkit-scrollbar {
  width: 8px;
}
.settings-scroll-area::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
}
.settings-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid var(--border);
}
.settings-row:last-child {
  border-bottom: none;
}
.settings-row-left {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.settings-row-title {
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: 0.95rem;
  font-weight: 500;
}
.settings-row-desc {
  color: var(--text-secondary);
  font-size: 0.8rem;
  max-width: 440px;
  line-height: 1.4;
  margin-top: 2px;
}
.settings-row-right {
  display: flex;
  align-items: center;
  color: var(--text-primary);
  font-size: 0.9rem;
}
.settings-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-family: var(--font-display);
  transition: color 0.2s;
}
.settings-dropdown:hover {
  color: var(--accent);
}
.settings-dropdown i {
  font-size: 0.75rem;
  color: var(--text-muted);
}
.accent-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--text-muted);
  transition: background 0.2s;
}
.settings-row:hover .accent-dot {
  background: var(--accent);
}
.play-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-right: 16px;
  cursor: pointer;
  font-weight: 600;
  color: var(--text-primary);
  transition: color 0.2s;
}
.play-btn:hover {
  color: var(--accent);
}
.settings-toggle {
  width: 44px;
  height: 24px;
  background: var(--bg-input);
  border: 1px solid var(--border);
  border-radius: var(--radius-pill);
  position: relative;
  cursor: pointer;
  transition: all 0.25s;
}
.settings-toggle::after {
  content: '';
  position: absolute;
  top: 1px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: var(--text-muted);
  border-radius: 50%;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.settings-toggle.on {
  background: var(--accent-dim);
  border-color: var(--accent);
}
.settings-toggle.on::after {
  transform: translateX(18px);
  background: var(--accent);
  box-shadow: var(--shadow-glow);
}
'''

def update_css():
    base_dir = r"c:\Users\luisg\HPE-NUEVO"
    styles_paths = [
        os.path.join(base_dir, "styles.css"),
        os.path.join(base_dir, "css", "style_hpe.css")
    ]
    
    for path in styles_paths:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Repalce everything from /* ===== SETTINGS MODAL ===== */ to the end
            pattern = re.compile(r'/\* ===== SETTINGS MODAL ===== \*/.*', re.DOTALL)
            if pattern.search(content):
                new_content = pattern.sub(css_code.strip(), content)
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Updated settings CSS in {path}")
            else:
                with open(path, "a", encoding="utf-8") as f:
                    f.write("\n" + css_code.strip())
                print(f"Appended settings CSS to {path} (block not found)")

if __name__ == "__main__":
    update_css()
