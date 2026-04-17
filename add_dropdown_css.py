import os

css = """
/* ===== DROPDOWN MENU ===== */
.settings-row-right {
  position: relative;
}
.settings-dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  background: var(--bg-card-inner);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  min-width: 150px;
  padding: 6px 0;
  box-shadow: var(--shadow-card);
  z-index: 100;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-5px);
  transition: all 0.2s ease;
}
.settings-dropdown-menu.active {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}
.dropdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  color: var(--text-primary);
  font-family: var(--font-display);
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.2s;
}
.dropdown-item:hover {
  background: var(--bg-input);
}
.dropdown-item i.fa-check {
  color: var(--text-primary);
  font-size: 0.8rem;
}
.dropdown-item i {
  color: transparent;
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
            print(f"Appended dropdown CSS to {p}")

if __name__ == "__main__":
    update_css()
