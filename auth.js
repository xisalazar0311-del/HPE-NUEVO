// auth.js - Authentication System + Settings Modal (corregido)

document.addEventListener('DOMContentLoaded', () => {
  // ============================================================
  // 1. INYECTAR MODAL DE AUTENTICACIÓN (login/register)
  // ============================================================
  const modalHTML = `
    <div id="authModalOverlay" class="auth-overlay hidden">
      <div class="auth-modal">
        <div class="auth-tabs">
          <button id="tabLogin" class="auth-tab active">Sign In</button>
          <button id="tabRegister" class="auth-tab">Create Account</button>
        </div>
        <div class="auth-content">
          <div id="loginForm" class="auth-form active">
            <div class="input-group">
              <label>Username</label>
              <input type="text" id="loginUsername" autocomplete="off">
            </div>
            <div class="input-group">
              <label>Password</label>
              <input type="password" id="loginPassword" autocomplete="off">
            </div>
            <div id="loginError" class="auth-error"></div>
            <button type="button" id="btnLoginSubmit" class="auth-submit">Login</button>
          </div>
          <div id="registerForm" class="auth-form">
            <div class="input-group">
              <label>Username</label>
              <input type="text" id="regUsername" autocomplete="off">
            </div>
            <div class="input-group">
              <label>Password</label>
              <input type="password" id="regPassword" autocomplete="off">
            </div>
            <div id="regError" class="auth-error"></div>
            <button type="button" id="btnRegSubmit" class="auth-submit">Sign Up</button>
          </div>
        </div>
        <button id="authCloseBtn" class="auth-close">&times;</button>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Elementos del modal de autenticación
  const authOverlay = document.getElementById('authModalOverlay');
  const authClose = document.getElementById('authCloseBtn');
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const loginUser = document.getElementById('loginUsername');
  const loginPass = document.getElementById('loginPassword');
  const regUser = document.getElementById('regUsername');
  const regPass = document.getElementById('regPassword');
  const loginError = document.getElementById('loginError');
  const regError = document.getElementById('regError');

  // ============================================================
  // 2. GESTIÓN DE USUARIOS (localStorage)
  // ============================================================
  const STORAGE_USERS = 'hpe_users';
  const STORAGE_ACTIVE = 'hpe_active_user';

  const defaultGuest = {
    username: 'Guest',
    role: 'Visitor',
    initial: 'GU',
    color: '#8b949e',
    isGuest: true
  };

  const defaultUsers = {
    gael: { username: 'Gael', password: '123', role: 'Admin', initial: 'GA', color: '#01a982', isGuest: false },
    admin: { username: 'Admin', password: 'admin', role: 'Admin', initial: 'AD', color: '#0070f8', isGuest: false }
  };

  function getUsers() {
    try {
      const stored = localStorage.getItem(STORAGE_USERS);
      if (stored) return { ...defaultUsers, ...JSON.parse(stored) };
    } catch (e) { }
    return defaultUsers;
  }

  function saveUsers(users) {
    try {
      localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    } catch (e) { }
  }

  function getActiveUser() {
    try {
      const raw = localStorage.getItem(STORAGE_ACTIVE);
      return raw ? JSON.parse(raw) : defaultGuest;
    } catch (e) {
      return defaultGuest;
    }
  }

  function setActiveUser(user) {
    if (!user) localStorage.removeItem(STORAGE_ACTIVE);
    else localStorage.setItem(STORAGE_ACTIVE, JSON.stringify(user));
    updateProfileUI();
  }

  function getRandomColor() {
    const colors = ['#0070f8', '#01a982', '#7764fc', '#e6324b', '#ff8d6d'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  // Actualizar perfil en la interfaz
  function updateProfileUI() {
    const user = getActiveUser();
    document.querySelectorAll('.user-name').forEach(el => el.textContent = user.username);
    document.querySelectorAll('.user-role').forEach(el => el.textContent = user.role);
    document.querySelectorAll('.avatar-sm').forEach(avatar => {
      avatar.textContent = user.initial;
      avatar.style.backgroundColor = user.color;
      avatar.style.color = '#fff';
      avatar.classList.remove('gold');
    });
  }

  // ============================================================
  // 3. FUNCIONES DE AUTENTICACIÓN (login/register/logout)
  // ============================================================
  function openAuthModal() {
    authOverlay.classList.remove('hidden');
    setTimeout(() => authOverlay.classList.add('active'), 10);
    loginUser.value = '';
    loginPass.value = '';
    regUser.value = '';
    regPass.value = '';
    loginError.textContent = '';
    regError.textContent = '';
    const popup = document.getElementById('userMenuPopup');
    if (popup) popup.classList.remove('active');
  }

  function closeAuthModal() {
    authOverlay.classList.remove('active');
    setTimeout(() => authOverlay.classList.add('hidden'), 300);
  }

  function doLogin() {
    const username = loginUser.value.trim();
    const password = loginPass.value;
    if (!username || !password) {
      loginError.textContent = 'Enter username and password';
      return;
    }
    const key = username.toLowerCase();
    const users = getUsers();
    if (users[key] && users[key].password === password) {
      setActiveUser(users[key]);
      closeAuthModal();
      loginError.textContent = '';
    } else {
      loginError.textContent = 'Invalid username or password';
    }
  }

  function doRegister() {
    const username = regUser.value.trim();
    const password = regPass.value;
    if (!username || !password) {
      regError.textContent = 'Fill all fields';
      return;
    }
    if (username.length < 3 || password.length < 3) {
      regError.textContent = 'Username and password must be at least 3 characters';
      return;
    }
    const key = username.toLowerCase();
    const users = getUsers();
    if (users[key]) {
      regError.textContent = 'Username already exists';
      return;
    }
    const newUser = {
      username: username,
      password: password,
      role: 'User',
      initial: username.substring(0, 2).toUpperCase(),
      color: getRandomColor(),
      isGuest: false
    };
    users[key] = newUser;
    saveUsers(users);
    setActiveUser(newUser);
    closeAuthModal();
    regError.textContent = '';
  }

  // Eventos del modal de autenticación
  authClose.addEventListener('click', closeAuthModal);
  authOverlay.addEventListener('click', (e) => {
    if (e.target === authOverlay) closeAuthModal();
  });
  tabLogin.addEventListener('click', () => {
    tabLogin.classList.add('active');
    tabRegister.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
  });
  tabRegister.addEventListener('click', () => {
    tabRegister.classList.add('active');
    tabLogin.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
  });
  document.getElementById('btnLoginSubmit').addEventListener('click', doLogin);
  document.getElementById('btnRegSubmit').addEventListener('click', doRegister);
  loginForm.addEventListener('keydown', (e) => { if (e.key === 'Enter') doLogin(); });
  registerForm.addEventListener('keydown', (e) => { if (e.key === 'Enter') doRegister(); });

  // Eventos globales para "Add account", "Logout" y "Personalization"
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const action = btn.dataset.action;
    if (action === 'add-account') {
      e.preventDefault();
      openAuthModal();
    } else if (action === 'logout') {
      e.preventDefault();
      setActiveUser(null);
      const popup = document.getElementById('userMenuPopup');
      if (popup) popup.classList.remove('active');
    } else if (action === 'personalization') {
      e.preventDefault();
      if (typeof window.openSettingsModal === 'function') {
        window.openSettingsModal();
      } else {
        console.error('openSettingsModal no está definida');
      }
      const popup = document.getElementById('userMenuPopup');
      if (popup) popup.classList.remove('active');
    }
  });

  // ============================================================
  // 4. INYECTAR MODAL DE CONFIGURACIÓN (SETTINGS)
  // ============================================================
  const settingsModalHTML = `
  <div class="settings-overlay hidden" id="settingsModalOverlay">
    <div class="settings-modal">
      <button class="settings-close-btn" id="closeSettingsBtn"><i class="fas fa-times"></i></button>
      <div class="settings-sidebar">
        <button class="settings-tab active"><i class="fas fa-paint-brush"></i> <span data-i18n="Personalization">Personalization</span></button>
      </div>
      <div class="settings-content-wrapper">
        <div class="settings-scroll-area">
          <div class="settings-row">
            <div class="settings-row-left"><span class="settings-row-title" data-i18n="Appearance">Appearance</span></div>
            <div class="settings-row-right">
              <div class="settings-dropdown" id="appearanceDropdownBtn">
                <span id="appearanceSelected" data-i18n="System">System</span> <i class="fas fa-chevron-down"></i>
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
                <span id="languageSelected" data-i18n="Auto-detect">Auto-detect</span> <i class="fas fa-chevron-down"></i>
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

  // Configuración del modal de settings
  const settingsOverlay = document.getElementById('settingsModalOverlay');
  const closeSettings = document.getElementById('closeSettingsBtn');
  const toggleBtn = document.getElementById('settingsToggleBtn');

  // Función global para abrir settings
  window.openSettingsModal = function () {
    if (settingsOverlay) {
      settingsOverlay.classList.remove('hidden');
      setTimeout(() => settingsOverlay.classList.add('active'), 10);
    } else {
      console.error('settingsOverlay no encontrado');
    }
  };

  function closeSettingsModal() {
    if (settingsOverlay) {
      settingsOverlay.classList.remove('active');
      setTimeout(() => settingsOverlay.classList.add('hidden'), 300);
    }
  }

  if (closeSettings) closeSettings.addEventListener('click', closeSettingsModal);
  if (settingsOverlay) {
    settingsOverlay.addEventListener('click', (e) => {
      if (e.target === settingsOverlay) closeSettingsModal();
    });
  }
  if (toggleBtn) toggleBtn.addEventListener('click', () => toggleBtn.classList.toggle('on'));

  // ============================================================
  // 5. LÓGICA DE TEMA (Appearance)
  // ============================================================
  const appearanceBtn = document.getElementById('appearanceDropdownBtn');
  const appearanceMenu = document.getElementById('appearanceDropdownMenu');
  const appearanceSelected = document.getElementById('appearanceSelected');

  function applyTheme(theme) {
    if (theme === 'Light') document.documentElement.classList.add('light-theme');
    else if (theme === 'Dark') document.documentElement.classList.remove('light-theme');
    else {
      const isLight = window.matchMedia('(prefers-color-scheme: light)').matches;
      document.documentElement.classList.toggle('light-theme', isLight);
    }
  }

  if (appearanceBtn && appearanceMenu) {
    appearanceBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      appearanceMenu.classList.toggle('active');
    });
    appearanceMenu.addEventListener('click', (e) => {
      const item = e.target.closest('.dropdown-item');
      if (item) {
        const val = item.dataset.value;
        appearanceMenu.querySelectorAll('.dropdown-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        appearanceSelected.setAttribute('data-i18n', val);
        appearanceSelected.textContent = val;
        localStorage.setItem('hpe_theme_pref', val);
        applyTheme(val);
        if (typeof window.applyTranslation === 'function') {
          window.applyTranslation(localStorage.getItem('hpe_language_pref') || 'Auto-detect');
        }
      }
    });
    document.addEventListener('click', () => appearanceMenu.classList.remove('active'));
    const savedTheme = localStorage.getItem('hpe_theme_pref') || 'System';
    appearanceSelected.setAttribute('data-i18n', savedTheme);
    appearanceSelected.textContent = savedTheme;
    const activeItem = appearanceMenu.querySelector(`.dropdown-item[data-value="${savedTheme}"]`);
    if (activeItem) activeItem.classList.add('active');
    applyTheme(savedTheme);
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
      if ((localStorage.getItem('hpe_theme_pref') || 'System') === 'System') {
        const isLight = window.matchMedia('(prefers-color-scheme: light)').matches;
        document.documentElement.classList.toggle('light-theme', isLight);
      }
    });
  }

  // ============================================================
  // 6. LÓGICA DE IDIOMA (integración con translator.js)
  // ============================================================
  const languageBtn = document.getElementById('languageDropdownBtn');
  const languageMenu = document.getElementById('languageDropdownMenu');
  const languageSelected = document.getElementById('languageSelected');

  if (languageBtn && languageMenu) {
    languageBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      languageMenu.classList.toggle('active');
    });
    languageMenu.addEventListener('click', (e) => {
      const item = e.target.closest('.dropdown-item');
      if (item) {
        languageMenu.querySelectorAll('.dropdown-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
        languageSelected.setAttribute('data-i18n', item.dataset.value);
        languageSelected.textContent = item.dataset.value;
        localStorage.setItem('hpe_language_pref', item.dataset.value);
        if (typeof window.applyTranslation === 'function') {
          window.applyTranslation(item.dataset.value);
        } else {
          console.warn('applyTranslation no está disponible. Asegúrate de cargar translator.js');
        }
      }
    });
    document.addEventListener('click', () => languageMenu.classList.remove('active'));
    const savedLang = localStorage.getItem('hpe_language_pref') || 'Auto-detect';
    languageSelected.setAttribute('data-i18n', savedLang);
    languageSelected.textContent = savedLang;
    const activeLang = languageMenu.querySelector(`.dropdown-item[data-value="${savedLang}"]`);
    if (activeLang) activeLang.classList.add('active');
  }

  // Inicializar perfil
  updateProfileUI();
});