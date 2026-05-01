/**
 * auth.js  — Sistema de autenticación seguro
 *
 * CAMBIOS VS VERSIÓN ORIGINAL:
 *  1. Eliminadas credenciales hardcodeadas (gael/123, admin/admin)
 *  2. Login y registro se validan contra el backend (server.js) con bcrypt + JWT
 *  3. El token JWT se guarda en sessionStorage (no localStorage) y se envía
 *     como cabecera Authorization en cada petición protegida
 *  4. La sesión expira automáticamente cuando se cierra el navegador
 *     (sessionStorage) y en 8 h por expiración del token
 */

// ─── Configuración ─────────────────────────────────────────────────────────
const API_URL = window.API_URL || 'http://localhost:3000'; // override en tu HTML si es necesario

// ─── Helpers de sesión ─────────────────────────────────────────────────────
function saveSession(data) {
  // sessionStorage: se borra al cerrar la pestaña/navegador
  sessionStorage.setItem('hpe_token',  data.token);
  sessionStorage.setItem('hpe_email',  data.email);
  sessionStorage.setItem('hpe_nombre', data.nombre);
  sessionStorage.setItem('hpe_role',   data.role || 'user');
}

function clearSession() {
  sessionStorage.removeItem('hpe_token');
  sessionStorage.removeItem('hpe_email');
  sessionStorage.removeItem('hpe_nombre');
  sessionStorage.removeItem('hpe_role');
}

function getSession() {
  const token = sessionStorage.getItem('hpe_token');
  if (!token) return null;
  return {
    token,
    email:  sessionStorage.getItem('hpe_email'),
    nombre: sessionStorage.getItem('hpe_nombre'),
    role:   sessionStorage.getItem('hpe_role')
  };
}

// Verifica si hay sesión activa (el token existe en sessionStorage)
function isAuthenticated() {
  return !!sessionStorage.getItem('hpe_token');
}

// Cabeceras estándar para llamadas autenticadas
function authHeaders() {
  const token = sessionStorage.getItem('hpe_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// ─── Llamadas al backend ───────────────────────────────────────────────────
async function apiLogin(email, password) {
  const res = await fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return res.json();
}

async function apiRegister(email, password, nombre) {
  const res = await fetch(`${API_URL}/api/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, nombre })
  });
  return res.json();
}

// Ejemplo de llamada protegida (para usar en otras partes del proyecto)
async function apiGetMe() {
  const res = await fetch(`${API_URL}/api/me`, { headers: authHeaders() });
  if (res.status === 401) { clearSession(); window.location.reload(); }
  return res.json();
}

// ─── UI ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // ── Inyectar modal de autenticación ──────────────────────────────────────
  const modalHTML = `
    <div id="authModalOverlay" class="auth-overlay hidden">
      <div class="auth-modal">
        <div class="auth-tabs">
          <button id="tabLogin"    class="auth-tab active">Iniciar sesión</button>
          <button id="tabRegister" class="auth-tab">Crear cuenta</button>
        </div>
        <div class="auth-content">

          <!-- Login -->
          <div id="loginForm" class="auth-form active">
            <div class="input-group">
              <label>Email</label>
              <input type="email" id="loginEmail" autocomplete="email" placeholder="tu@email.com">
            </div>
            <div class="input-group">
              <label>Contraseña</label>
              <input type="password" id="loginPassword" autocomplete="current-password">
            </div>
            <div id="loginError" class="auth-error"></div>
            <button type="button" id="btnLoginSubmit" class="auth-submit">Entrar</button>
          </div>

          <!-- Registro -->
          <div id="registerForm" class="auth-form">
            <div class="input-group">
              <label>Nombre</label>
              <input type="text" id="regNombre" autocomplete="name" placeholder="Tu nombre">
            </div>
            <div class="input-group">
              <label>Email</label>
              <input type="email" id="regEmail" autocomplete="email" placeholder="tu@email.com">
            </div>
            <div class="input-group">
              <label>Contraseña <small>(mín. 8 caracteres)</small></label>
              <input type="password" id="regPassword" autocomplete="new-password">
            </div>
            <div id="regError" class="auth-error"></div>
            <button type="button" id="btnRegSubmit" class="auth-submit">Crear cuenta</button>
          </div>

        </div>
        <button id="authCloseBtn" class="auth-close">&times;</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // ── Referencias ───────────────────────────────────────────────────────────
  const authOverlay  = document.getElementById('authModalOverlay');
  const authClose    = document.getElementById('authCloseBtn');
  const tabLogin     = document.getElementById('tabLogin');
  const tabRegister  = document.getElementById('tabRegister');
  const loginForm    = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginEmail   = document.getElementById('loginEmail');
  const loginPass    = document.getElementById('loginPassword');
  const regNombre    = document.getElementById('regNombre');
  const regEmail     = document.getElementById('regEmail');
  const regPass      = document.getElementById('regPassword');
  const loginError   = document.getElementById('loginError');
  const regError     = document.getElementById('regError');

  // ── Modal helpers ─────────────────────────────────────────────────────────
  function openAuthModal() {
    authOverlay.classList.remove('hidden');
    setTimeout(() => authOverlay.classList.add('active'), 10);
    [loginEmail, loginPass, regNombre, regEmail, regPass].forEach(el => el.value = '');
    [loginError, regError].forEach(el => el.textContent = '');
    document.getElementById('userMenuPopup')?.classList.remove('active');
  }

  function closeAuthModal() {
    authOverlay.classList.remove('active');
    setTimeout(() => authOverlay.classList.add('hidden'), 300);
  }

  // ── Actualizar UI con datos de sesión ─────────────────────────────────────
  function updateProfileUI() {
    const session = getSession();
    const nombre  = session?.nombre || session?.email?.split('@')[0] || 'Guest';
    const initial = nombre.substring(0, 2).toUpperCase();

    document.querySelectorAll('.user-name, #footerUserName, #popupUserName')
      .forEach(el => el && (el.textContent = nombre));
    document.querySelectorAll('.user-role')
      .forEach(el => el && (el.textContent = session?.role || 'Visitor'));
    document.querySelectorAll('.avatar-sm, #footerAvatar, #popupAvatar')
      .forEach(el => { if (el) { el.textContent = initial; el.style.backgroundColor = '#01a982'; } });
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  async function doLogin() {
    const email    = loginEmail.value.trim();
    const password = loginPass.value;
    loginError.textContent = '';

    if (!email || !password) {
      loginError.textContent = 'Ingresa email y contraseña'; return;
    }

    const btn = document.getElementById('btnLoginSubmit');
    btn.disabled = true;
    btn.textContent = 'Verificando…';

    try {
      const data = await apiLogin(email, password);
      if (data.success) {
        saveSession(data);
        // Redirigir al dashboard principal
        const base = window.location.pathname.includes('inicio_sesion')
          ? '../../INDEX.HTML'
          : 'INDEX.HTML';
        window.location.href = base;
      } else {
        loginError.textContent = data.message || 'Credenciales incorrectas';
      }
    } catch {
      loginError.textContent = 'Error de conexión con el servidor';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Entrar';
    }
  }

  // ── Registro ──────────────────────────────────────────────────────────────
  async function doRegister() {
    const nombre   = regNombre.value.trim();
    const email    = regEmail.value.trim();
    const password = regPass.value;
    regError.textContent = '';

    if (!email || !password) {
      regError.textContent = 'Email y contraseña son requeridos'; return;
    }
    if (password.length < 8) {
      regError.textContent = 'La contraseña debe tener al menos 8 caracteres'; return;
    }

    const btn = document.getElementById('btnRegSubmit');
    btn.disabled = true;
    btn.textContent = 'Creando cuenta…';

    try {
      const data = await apiRegister(email, password, nombre);
      if (data.success) {
        regError.style.color = '#01a982';
        regError.textContent = '✅ Cuenta creada. Ahora inicia sesión.';
        setTimeout(() => {
          regError.style.color = '';
          tabLogin.click();
          loginEmail.value = email;
        }, 1500);
      } else {
        regError.textContent = data.message || 'Error al crear cuenta';
      }
    } catch {
      regError.textContent = 'Error de conexión con el servidor';
    } finally {
      btn.disabled = false;
      btn.textContent = 'Crear cuenta';
    }
  }

  // ── Eventos del modal ─────────────────────────────────────────────────────
  authClose.addEventListener('click', closeAuthModal);
  authOverlay.addEventListener('click', e => { if (e.target === authOverlay) closeAuthModal(); });

  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');    tabRegister.classList.remove('active');
    loginForm.classList.add('active');  registerForm.classList.remove('active');
  });
  tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active'); tabLogin.classList.remove('active');
    registerForm.classList.add('active'); loginForm.classList.remove('active');
  });

  document.getElementById('btnLoginSubmit').addEventListener('click', doLogin);
  document.getElementById('btnRegSubmit').addEventListener('click', doRegister);
  loginForm.addEventListener('keydown',    e => { if (e.key === 'Enter') doLogin(); });
  registerForm.addEventListener('keydown', e => { if (e.key === 'Enter') doRegister(); });

  // ── Acciones globales (logout, add-account, personalization) ──────────────
  document.addEventListener('click', e => {
    const btn    = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;

    if (action === 'add-account') {
      e.preventDefault(); openAuthModal();
    } else if (action === 'logout') {
      e.preventDefault();
      clearSession();
      document.getElementById('userMenuPopup')?.classList.remove('active');
      updateProfileUI();
      // Redirigir al login
      window.location.href = 'inicio_sesion/inicio_sesion/index copy.html';
    } else if (action === 'personalization') {
      e.preventDefault();
      window.openSettingsModal?.();
      document.getElementById('userMenuPopup')?.classList.remove('active');
    }
  });

  // ── Modal de Settings (sin cambios funcionales) ───────────────────────────
  const settingsModalHTML = `
  <div class="settings-overlay hidden" id="settingsModalOverlay">
    <div class="settings-modal">
      <button class="settings-close-btn" id="closeSettingsBtn">
        <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2"
          fill="none" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
      <div class="settings-sidebar">
        <button class="settings-tab active">
          <i class="fas fa-paint-brush"></i>
          <span data-i18n="Personalization">Personalization</span>
        </button>
      </div>
      <div class="settings-content-wrapper">
        <div class="settings-scroll-area">
          <div class="settings-row">
            <div class="settings-row-left"><span class="settings-row-title" data-i18n="Appearance">Appearance</span></div>
            <div class="settings-row-right">
              <div class="settings-dropdown" id="appearanceDropdownBtn">
                <span id="appearanceSelected" data-i18n="System">System</span>
                <i class="fas fa-chevron-down"></i>
              </div>
              <div class="settings-dropdown-menu" id="appearanceDropdownMenu">
                <div class="dropdown-item active" data-value="System"><span data-i18n="System">System</span> <i class="fas fa-check"></i></div>
                <div class="dropdown-item" data-value="Dark"><span data-i18n="Dark">Dark</span> <i></i></div>
                <div class="dropdown-item" data-value="Light"><span data-i18n="Light">Light</span> <i></i></div>
              </div>
            </div>
          </div>
          <div class="settings-row">
            <div class="settings-row-left"><span class="settings-row-title" data-i18n="Language">Language</span></div>
            <div class="settings-row-right">
              <div class="settings-dropdown" id="languageDropdownBtn">
                <span id="languageSelected" data-i18n="Auto-detect">Auto-detect</span>
                <i class="fas fa-chevron-down"></i>
              </div>
              <div class="settings-dropdown-menu" id="languageDropdownMenu">
                <div class="dropdown-item active" data-value="Auto-detect"><span data-i18n="Auto-detect">Auto-detect</span> <i class="fas fa-check"></i></div>
                <div class="dropdown-item" data-value="English"><span data-i18n="English">English</span> <i></i></div>
                <div class="dropdown-item" data-value="Spanish"><span data-i18n="Spanish">Spanish</span> <i></i></div>
                <div class="dropdown-item" data-value="French"><span data-i18n="French">French</span> <i></i></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', settingsModalHTML);

  // Settings modal logic
  const settingsOverlay = document.getElementById('settingsModalOverlay');
  const closeSettings   = document.getElementById('closeSettingsBtn');

  window.openSettingsModal = () => {
    settingsOverlay?.classList.remove('hidden');
    setTimeout(() => settingsOverlay?.classList.add('active'), 10);
  };

  function closeSettingsModal() {
    settingsOverlay?.classList.remove('active');
    setTimeout(() => settingsOverlay?.classList.add('hidden'), 300);
  }

  closeSettings?.addEventListener('click', closeSettingsModal);
  settingsOverlay?.addEventListener('click', e => { if (e.target === settingsOverlay) closeSettingsModal(); });

  // Appearance
  const appearanceBtn      = document.getElementById('appearanceDropdownBtn');
  const appearanceMenu     = document.getElementById('appearanceDropdownMenu');
  const appearanceSelected = document.getElementById('appearanceSelected');

  function applyTheme(theme) {
    if (theme === 'Light') document.documentElement.classList.add('light-theme');
    else if (theme === 'Dark') document.documentElement.classList.remove('light-theme');
    else document.documentElement.classList.toggle('light-theme', window.matchMedia('(prefers-color-scheme: light)').matches);
  }

  if (appearanceBtn && appearanceMenu) {
    appearanceBtn.addEventListener('click', e => { e.stopPropagation(); appearanceMenu.classList.toggle('active'); });
    appearanceMenu.addEventListener('click', e => {
      const item = e.target.closest('.dropdown-item');
      if (!item) return;
      appearanceMenu.querySelectorAll('.dropdown-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');
      const val = item.dataset.value;
      appearanceSelected.setAttribute('data-i18n', val);
      appearanceSelected.textContent = val;
      localStorage.setItem('hpe_theme_pref', val);
      applyTheme(val);
      window.applyTranslation?.(localStorage.getItem('hpe_language_pref') || 'Auto-detect');
    });
    document.addEventListener('click', () => appearanceMenu.classList.remove('active'));
    const savedTheme = localStorage.getItem('hpe_theme_pref') || 'System';
    appearanceSelected.setAttribute('data-i18n', savedTheme);
    appearanceSelected.textContent = savedTheme;
    appearanceMenu.querySelector(`.dropdown-item[data-value="${savedTheme}"]`)?.classList.add('active');
    applyTheme(savedTheme);
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
      if ((localStorage.getItem('hpe_theme_pref') || 'System') === 'System') applyTheme('System');
    });
  }

  // Language
  const languageBtn      = document.getElementById('languageDropdownBtn');
  const languageMenu     = document.getElementById('languageDropdownMenu');
  const languageSelected = document.getElementById('languageSelected');

  if (languageBtn && languageMenu) {
    languageBtn.addEventListener('click', e => { e.stopPropagation(); languageMenu.classList.toggle('active'); });
    languageMenu.addEventListener('click', e => {
      const item = e.target.closest('.dropdown-item');
      if (!item) return;
      languageMenu.querySelectorAll('.dropdown-item').forEach(el => el.classList.remove('active'));
      item.classList.add('active');
      languageSelected.setAttribute('data-i18n', item.dataset.value);
      languageSelected.textContent = item.dataset.value;
      localStorage.setItem('hpe_language_pref', item.dataset.value);
      window.applyTranslation?.(item.dataset.value);
    });
    document.addEventListener('click', () => languageMenu.classList.remove('active'));
    const savedLang = localStorage.getItem('hpe_language_pref') || 'Auto-detect';
    languageSelected.setAttribute('data-i18n', savedLang);
    languageSelected.textContent = savedLang;
    languageMenu.querySelector(`.dropdown-item[data-value="${savedLang}"]`)?.classList.add('active');
  }

  // Inicializar UI
  updateProfileUI();
});

// ─── Exportar helpers para uso externo (ej. INDEX.HTML) ────────────────────
window.hpeAuth = { isAuthenticated, getSession, clearSession, authHeaders };