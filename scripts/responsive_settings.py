import os

css = """
/* ===== SETTINGS RESPONSIVE (ESPECTACULAR) ===== */
@media (max-width: 768px) {
  .settings-overlay {
    align-items: flex-end !important; /* Push modal to bottom */
  }

  .settings-modal {
    flex-direction: column;
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    max-height: 90vh !important;
    border-radius: 24px 24px 0 0 !important;
    transform: translateY(100%) !important;
    margin: 0 !important;
    border-bottom: none !important;
    border-left: none !important;
    border-right: none !important;
    box-shadow: 0 -10px 40px rgba(0,0,0,0.4), 0 0 40px rgba(0, 230, 180, 0.15) !important;
  }

  .settings-overlay.active .settings-modal {
    transform: translateY(0) !important;
  }

  .settings-close-btn {
    top: 16px !important;
    right: 16px !important;
    left: auto !important;
    background: var(--bg-input) !important;
    border-radius: 50% !important;
    width: 36px;
    height: 36px;
  }

  .settings-sidebar {
    width: 100% !important;
    padding: 16px 20px 0px !important;
    flex-direction: row !important;
    border-bottom: 1px solid var(--border) !important;
    overflow-x: auto !important;
    gap: 24px !important;
  }

  .settings-tab {
    padding: 16px 4px !important;
    border-radius: 0 !important;
    background: transparent !important;
    border-bottom: 2px solid transparent !important;
    margin-bottom: -1px !important;
    font-size: 1rem !important;
  }

  .settings-tab.active {
    color: var(--accent) !important;
    border-bottom: 2px solid var(--accent) !important;
  }

  .settings-content-wrapper {
    border-left: none !important;
    border-radius: 0 0 24px 24px;
  }

  .settings-header-banner {
    padding: 20px 24px !important;
    font-size: 0.9rem !important;
  }

  .settings-scroll-area {
    padding: 0 24px 40px !important;
  }

  .settings-row {
    flex-direction: column !important;
    align-items: flex-start !important;
    gap: 16px !important;
    padding: 24px 0 !important;
  }

  .settings-row-right {
    width: 100% !important;
    justify-content: flex-end !important;
    background: var(--bg-input);
    padding: 16px;
    border-radius: 12px;
    border: 1px solid var(--border);
  }

  .play-btn {
    margin-right: auto !important; /* Push everything else to right */
    width: 100% !important;
    justify-content: space-between !important;
  }

  /* Make dropdown take full width */
  .settings-dropdown {
    width: 100%;
    justify-content: space-between;
    padding: 10px;
    background: rgba(0,0,0,0.2);
    border-radius: 8px;
  }
}
"""

def update_css():
    paths = [
        r"c:\Users\luisg\HPE-NUEVO\styles.css",
        r"c:\Users\luisg\HPE-NUEVO\css\style_hpe.css"
    ]
    for p in paths:
        if os.path.exists(p):
            with open(p, "a", encoding="utf-8") as f:
                f.write(css)
            print(f"Appended responsive settings CSS to {p}")

if __name__ == "__main__":
    update_css()
