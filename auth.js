// auth.js
// Authentication System and UI Injector

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inyectar el Modal dinámicamente en el body
  const modalHTML = `
    <div id="authModalOverlay" class="auth-overlay hidden">
      <div class="auth-modal">
        <div class="auth-tabs">
          <button id="tabLogin" class="auth-tab active">Sign In</button>
          <button id="tabRegister" class="auth-tab">Create Account</button>
        </div>
        
        <div class="auth-content">
          <!-- FORMULARIO LOGIN -->
          <div id="loginForm" class="auth-form active">
            <div class="input-group">
              <label>Username</label>
              <input type="text" id="loginUsername" required autocomplete="off" data-lpignore="true">
            </div>
            <div class="input-group">
              <label>Password</label>
              <input type="text" id="loginPassword" required autocomplete="off" data-lpignore="true" spellcheck="false" style="-webkit-text-security: disc;">
            </div>
            <div id="loginError" class="auth-error"></div>
            <button type="button" id="btnLoginSubmit" class="auth-submit mt-4">Login</button>
          </div>
          
          <!-- FORMULARIO REGISTRO -->
          <div id="registerForm" class="auth-form">
            <div class="input-group">
              <label>Choose Username</label>
              <input type="text" id="regUsername" required autocomplete="off" data-lpignore="true" spellcheck="false">
            </div>
            <div class="input-group">
              <label>Password</label>
              <input type="text" id="regPassword" required autocomplete="off" data-lpignore="true" spellcheck="false" style="-webkit-text-security: disc;">
            </div>
            <div id="regError" class="auth-error"></div>
            <button type="button" id="btnRegSubmit" class="auth-submit mt-4">Sign Up</button>
          </div>
        </div>
        
        <button id="authCloseBtn" class="auth-close">&times;</button>
      </div>
    </div>
  `;

  // Agregar el modal al DOM
  document.body.insertAdjacentHTML('beforeend', modalHTML);

  // Referencias a elementos
  const authOverlay = document.getElementById('authModalOverlay');
  const authCloseBtn = document.getElementById('authCloseBtn');
  const tabLogin = document.getElementById('tabLogin');
  const tabRegister = document.getElementById('tabRegister');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // 2. Lógica de UI del Modal
  function closeAuthModal() {
    authOverlay.classList.remove('active');
    setTimeout(() => authOverlay.classList.add('hidden'), 300); // Esperar la transición css
  }

  function openAuthModal() {
    authOverlay.classList.remove('hidden');
    setTimeout(() => authOverlay.classList.add('active'), 10);
    // Ocultar popup de usuario si está abierto
    const popup = document.getElementById('userMenuPopup');
    if (popup) popup.classList.remove('active');

    // Resetear form a login por defecto
    document.getElementById('loginUsername').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('regUsername').value = '';
    document.getElementById('regPassword').value = '';
    document.getElementById('loginError').textContent = '';
    document.getElementById('regError').textContent = '';
  }

  authCloseBtn.addEventListener('click', closeAuthModal);
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

  // 3. Lógica de Autenticación
  const USERS_KEY = 'hpe_users';
  const ACTIVE_USER_KEY = 'hpe_active_user';

  const defaultGuest = {
    username: 'Guest',
    role: 'Visitor',
    initial: 'GU',
    color: '#8b949e',
    isGuest: true
  };

  const defaultDB = {
    "gael": { username: "Gael", password: "123", role: "Admin", initial: "GA", color: "#01a982", isGuest: false },
    "admin": { username: "Admin", password: "admin", role: "Admin", initial: "AD", color: "#0070f8", isGuest: false }
  };

  function getUsers() {
    try {
      const stored = localStorage.getItem(USERS_KEY);
      if (stored) {
        return { ...defaultDB, ...JSON.parse(stored) };
      }
    } catch (e) { }
    return defaultDB;
  }

  function saveUsers(users) {
    try {
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn("localStorage acts restricted on file://, user will not persist across reloads.");
    }
  }

  function getActiveUser() {
    const user = localStorage.getItem(ACTIVE_USER_KEY);
    return user ? JSON.parse(user) : defaultGuest;
  }

  function setActiveUser(user) {
    if (user === null) {
      localStorage.removeItem(ACTIVE_USER_KEY);
    } else {
      localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
    }
  }

  function getRandomColor() {
    const colors = ['#0070f8', '#01a982', '#7764fc', '#e6324b', '#ff8d6d'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function updateProfileUI() {
    const user = getActiveUser();

    const nameEls = document.querySelectorAll('.user-name');
    const roleEls = document.querySelectorAll('.user-role');
    const avatarEls = document.querySelectorAll('.avatar-sm');

    nameEls.forEach(el => el.textContent = user.username);
    roleEls.forEach(el => el.textContent = user.role);

    avatarEls.forEach(el => {
      el.textContent = user.initial;
      el.style.backgroundColor = user.color;
      el.style.color = '#fff';
      el.style.backgroundImage = 'none'; // quitar estilos gold previos si es necesario
    });
  }

  // Helper to execute Login
  function doLogin() {
    const uName = document.getElementById('loginUsername').value.trim();
    const key = uName.toLowerCase();
    const pWord = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    if (!uName || !pWord) return;

    const users = getUsers();
    if (users[key] && users[key].password === pWord) {
      setActiveUser(users[key]);
      updateProfileUI();
      closeAuthModal();
      errorEl.textContent = '';
    } else {
      errorEl.textContent = 'Invalid username or password.';
    }
  }

  // Handle Login Actions
  document.getElementById('btnLoginSubmit').addEventListener('click', doLogin);
  document.getElementById('loginForm').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doLogin();
  });

  // Helper to execute Registration
  function doRegister() {
    const uName = document.getElementById('regUsername').value.trim();
    const key = uName.toLowerCase();
    const pWord = document.getElementById('regPassword').value;
    const errorEl = document.getElementById('regError');
    if (!uName || !pWord) return;

    if (uName.length < 3 || pWord.length < 3) {
      errorEl.textContent = 'Username > 2 chars, Password > 2 chars.';
      return;
    }

    const users = getUsers();
    if (users[key]) {
      errorEl.textContent = 'Username already exists.';
      return;
    }

    // Register User
    const newUser = {
      username: uName,
      password: pWord,
      role: 'User',
      initial: uName.substring(0, 2).toUpperCase(),
      color: getRandomColor(),
      isGuest: false
    };

    users[key] = newUser;
    saveUsers(users);

    setActiveUser(newUser);
    updateProfileUI();
    closeAuthModal();
    errorEl.textContent = '';
  }

  // Handle Registration Actions
  document.getElementById('btnRegSubmit').addEventListener('click', doRegister);
  document.getElementById('registerForm').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doRegister();
  });

  // 4. Hook up "Add Account" and "Logout" buttons globalmente
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button, .menu-item, a');
    if (!btn) return;

    const text = btn.textContent.trim();
    if (text === 'Add another account') {
      e.preventDefault();
      openAuthModal();
    } else if (text === 'Log out') {
      e.preventDefault();
      setActiveUser(null);
      updateProfileUI();

      const popup = document.getElementById('userMenuPopup');
      if (popup) popup.classList.remove('active');
    } else if (text === 'Personalization') {
      e.preventDefault();
      openSettingsModal();

      const popup = document.getElementById('userMenuPopup');
      if (popup) popup.classList.remove('active');
    }
  });

  // Init UI on load
  updateProfileUI();

  // ========== SETTINGS MODAL INJECTION & LOGIC ==========

  const settingsModalHTML = `
  <div class="settings-overlay hidden" id="settingsModalOverlay">
    <div class="settings-modal" id="settingsModalBody">
      <button class="settings-close-btn" id="closeSettingsBtn"><i class="fas fa-times"></i></button>
      
      <!-- Lado Izquierdo: Sidebar -->
      <div class="settings-sidebar">
        <button class="settings-tab active"><i class="fas fa-paint-brush"></i> Personalization</button>
      </div>

      <!-- Lado Derecho: Contenido -->
      <div class="settings-content-wrapper">
        
        
        <div class="settings-scroll-area">
          <div class="settings-row">
            <div class="settings-row-left">
              <span class="settings-row-title">Appearance</span>
            </div>
            <div class="settings-row-right">
              <div class="settings-dropdown" id="appearanceDropdownBtn">
                <span id="appearanceSelected">System</span> <i class="fas fa-chevron-down"></i>
              </div>
              <div class="settings-dropdown-menu" id="appearanceDropdownMenu">
                <div class="dropdown-item active" data-value="System">System <i class="fas fa-check" style="color: var(--text-primary)"></i></div>
                <div class="dropdown-item" data-value="Dark">Dark <i></i></div>
                <div class="dropdown-item" data-value="Light">Light <i></i></div>
              </div>
            </div>
          </div>
          
          <div class="settings-row">
            <div class="settings-row-left">
              <span class="settings-row-title">Contrast</span>
            </div>
            <div class="settings-row-right">
              <div class="settings-dropdown">System <i class="fas fa-chevron-down"></i></div>
            </div>
          </div>
          
          <div class="settings-row">
            <div class="settings-row-left">
              <span class="settings-row-title">Accent color</span>
            </div>
            <div class="settings-row-right">
              <span class="accent-dot"></span>
              <div class="settings-dropdown">Default <i class="fas fa-chevron-down"></i></div>
            </div>
          </div>
          
          <div class="settings-row">
            <div class="settings-row-left">
              <span class="settings-row-title">Language</span>
            </div>
            <div class="settings-row-right">
              <div class="settings-dropdown">Auto-detect <i class="fas fa-chevron-down"></i></div>
            </div>
          </div>
          
          <div class="settings-row">
            <div class="settings-row-left">
              <span class="settings-row-title">Spoken language</span>
              <div class="settings-row-desc">For best results, select the language you mainly speak. If it's not listed, it may still be supported via auto-detection.</div>
            </div>
            <div class="settings-row-right">
              <div class="settings-dropdown">Auto-detect <i class="fas fa-chevron-down"></i></div>
            </div>
          </div>
          
          <div class="settings-row">
            <div class="settings-row-left">
              <span class="settings-row-title">Voice</span>
            </div>
            <div class="settings-row-right">
              <div class="play-btn"><i class="fas fa-play"></i> Play</div>
              <div class="settings-dropdown">Breeze <i class="fas fa-chevron-down"></i></div>
            </div>
          </div>
          
          <div class="settings-row">
            <div class="settings-row-left">
              <span class="settings-row-title">Separate Voice</span>
              <div class="settings-row-desc">Keep ChatGPT Voice in a separate full screen, without real time transcripts and visuals.</div>
            </div>
            <div class="settings-row-right" style="padding-top: 8px;">
              <div class="settings-toggle" id="settingsToggleBtn"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>`;

  document.body.insertAdjacentHTML('beforeend', settingsModalHTML);

  const settingsOverlay = document.getElementById('settingsModalOverlay');
  const btnCloseSettings = document.getElementById('closeSettingsBtn');
  const toggleBtn = document.getElementById('settingsToggleBtn');

  function openSettingsModal() {
    settingsOverlay.classList.remove('hidden');
    setTimeout(() => {
      settingsOverlay.classList.add('active');
    }, 10);
  }

  function closeSettingsModal() {
    settingsOverlay.classList.remove('active');
    setTimeout(() => {
      settingsOverlay.classList.add('hidden');
    }, 300);
  }

  btnCloseSettings.addEventListener('click', closeSettingsModal);

  settingsOverlay.addEventListener('click', (e) => {
    if (e.target === settingsOverlay) {
      closeSettingsModal();
    }
  });

  toggleBtn.addEventListener('click', () => {
    toggleBtn.classList.toggle('on');
  });

  const appearanceBtn = document.getElementById('appearanceDropdownBtn');
  const appearanceMenu = document.getElementById('appearanceDropdownMenu');
  const appearanceSelected = document.getElementById('appearanceSelected');

  if (appearanceBtn && appearanceMenu) {
    appearanceBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      appearanceMenu.classList.toggle('active');
    });

    appearanceMenu.addEventListener('click', (e) => {
      const item = e.target.closest('.dropdown-item');
      if (item) {
        appearanceMenu.querySelectorAll('.dropdown-item').forEach(el => {
          el.classList.remove('active');
          const icon = el.querySelector('i');
          if(icon) {
            icon.classList.remove('fa-check');
            icon.style.color = 'transparent';
          }
        });
        
        item.classList.add('active');
        const icon = item.querySelector('i');
        if(icon) {
          icon.classList.add('fa-check');
          icon.style.color = 'var(--text-primary)';
        }
        
        appearanceSelected.textContent = item.dataset.value;
      }
    });

    document.addEventListener('click', () => {
      appearanceMenu.classList.remove('active');
    });
  }

});
