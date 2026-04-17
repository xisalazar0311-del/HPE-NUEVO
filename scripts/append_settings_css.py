import os

css = '''
/* ===== SETTINGS MODAL ===== */
.settings-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
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
  background: #1a1a1a;
  border-radius: 12px;
  display: flex;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
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
  color: #aaa;
  font-size: 1.2rem;
  cursor: pointer;
  z-index: 10;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}
.settings-close-btn:hover {
  background: rgba(255,255,255,0.05);
  color: #fff;
}
.settings-sidebar {
  width: 250px;
  background: #1a1a1a;
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
  color: #e0e0e0;
  background: transparent;
  border: none;
  font-size: 0.9rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
}
.settings-tab:hover {
  background: rgba(255,255,255,0.08);
}
.settings-tab.active {
  background: rgba(255,255,255,0.12);
  color: #fff;
  font-weight: 500;
}
.settings-content-wrapper {
  flex: 1;
  background: #212121;
  display: flex;
  flex-direction: column;
  position: relative;
  border-top-left-radius: 16px;
  border-bottom-left-radius: 16px;
  box-shadow: -4px 0 15px rgba(0,0,0,0.1);
  margin-top: 8px;
  margin-bottom: 8px;
}
.settings-header-banner {
  padding: 24px 32px 24px;
  margin-top: 10px;
  color: #fff;
  font-size: 0.95rem;
  line-height: 1.5;
  border-bottom: 1px solid rgba(255,255,255,0.08);
}
.settings-mfa-btn {
  display: inline-block;
  margin-top: 14px;
  padding: 8px 16px;
  background: rgba(255,255,255,0.08);
  color: #fff;
  border-radius: 20px;
  border: 1px solid rgba(255,255,255,0.1);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.settings-mfa-btn:hover {
  background: rgba(255,255,255,0.15);
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
  background: rgba(255,255,255,0.1);
  border-radius: 4px;
}
.settings-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid rgba(255,255,255,0.06);
}
.settings-row:last-child {
  border-bottom: none;
}
.settings-row-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.settings-row-title {
  color: #fff;
  font-size: 0.95rem;
}
.settings-row-desc {
  color: #8c8c8c;
  font-size: 0.8rem;
  max-width: 440px;
  line-height: 1.4;
  margin-top: 2px;
}
.settings-row-right {
  display: flex;
  align-items: center;
  color: #e0e0e0;
  font-size: 0.9rem;
}
.settings-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.settings-dropdown i {
  font-size: 0.75rem;
  color: #8c8c8c;
}
.accent-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #8c8c8c;
}
.play-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-right: 16px;
  cursor: pointer;
  font-weight: 500;
}
.settings-toggle {
  width: 44px;
  height: 24px;
  background: rgba(255,255,255,0.25);
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: all 0.25s;
}
.settings-toggle::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: #fff;
  border-radius: 50%;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 1px 3px rgba(0,0,0,0.3);
}
.settings-toggle.on {
  background: #00e6b4; /* adaptado al tema HPE */
}
.settings-toggle.on::after {
  transform: translateX(20px);
}
'''

def apply_css():
    base_dir = r"c:\Users\luisg\HPE-NUEVO"
    styles_paths = [
        os.path.join(base_dir, "styles.css"),
        os.path.join(base_dir, "css", "style_hpe.css")
    ]
    
    for path in styles_paths:
        if os.path.exists(path):
            with open(path, "a", encoding="utf-8") as f:
                f.write(css)
            print(f"Appended settings modal CSS to {path}")

if __name__ == "__main__":
    apply_css()
