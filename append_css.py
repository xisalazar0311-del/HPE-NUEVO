with open(r"c:\Users\luisg\HPE-NUEVO\styles.css", "a", encoding="utf-8") as f:
    f.write('''
/* ===== AUTH MODAL ===== */
.auth-overlay {
  position: fixed;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(10, 12, 15, 0.85);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}
.auth-overlay.active {
  opacity: 1;
  visibility: visible;
}
.auth-overlay.hidden {
  display: none;
}
.auth-modal {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  width: 90%;
  max-width: 400px;
  padding: 32px;
  position: relative;
  box-shadow: var(--shadow-card), 0 0 40px rgba(0, 230, 180, 0.15);
  transform: translateY(20px) scale(0.95);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
.auth-overlay.active .auth-modal {
  transform: translateY(0) scale(1);
}
.auth-close {
  position: absolute;
  top: 16px; right: 20px;
  background: none; border: none;
  color: var(--text-muted);
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.2s;
}
.auth-close:hover {
  color: var(--accent);
}
.auth-tabs {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  border-bottom: 1px solid var(--border);
}
.auth-tab {
  background: none; border: none;
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-muted);
  padding: 8px 0;
  cursor: pointer;
  position: relative;
  transition: color 0.2s;
}
.auth-tab.active {
  color: var(--text-primary);
}
.auth-tab::after {
  content: '';
  position: absolute;
  bottom: -1px; left: 0; width: 100%; height: 2px;
  background: var(--accent);
  transform: scaleX(0);
  transition: transform 0.3s ease;
}
.auth-tab.active::after {
  transform: scaleX(1);
}
.auth-content {
  position: relative;
  min-height: 200px;
}
.auth-form {
  position: absolute;
  top: 0; left: 0; width: 100%;
  opacity: 0;
  pointer-events: none;
  transform: translateX(20px);
  transition: all 0.3s ease;
}
.auth-form.active {
  position: relative;
  opacity: 1;
  pointer-events: auto;
  transform: translateX(0);
}
.input-group {
  margin-bottom: 16px;
}
.input-group label {
  display: block;
  font-size: 0.75rem;
  font-family: var(--font-mono);
  color: var(--text-secondary);
  margin-bottom: 6px;
}
.input-group input {
  width: 100%;
  background: var(--bg-input);
  border: 1px solid var(--border);
  color: var(--text-primary);
  padding: 12px 14px;
  border-radius: var(--radius-sm);
  font-family: var(--font-display);
  font-size: 0.9rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.input-group input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 10px var(--accent-dim);
}
.auth-submit {
  width: 100%;
  background: var(--accent);
  color: #000;
  border: none;
  padding: 12px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all 0.25s ease;
}
.auth-submit:hover {
  background: #00ffca;
  box-shadow: inset 0 0 8px rgba(255,255,255,0.3);
}
.auth-error {
  color: #ff4d4f;
  font-size: 0.8rem;
  min-height: 20px;
  margin-bottom: 10px;
}
''')
print("CSS Appended!")
