document.addEventListener('DOMContentLoaded', () => {

  // =============================================================
  // 1. SCORE RINGS
  // =============================================================
  const CIRCUMFERENCE = 2 * Math.PI * 20;

  function animateRings() {
    document.querySelectorAll('.ring-fill').forEach(ring => {
      const val    = parseInt(ring.getAttribute('data-val'), 10);
      const offset = CIRCUMFERENCE - (val / 100) * CIRCUMFERENCE;
      requestAnimationFrame(() => setTimeout(() => { ring.style.strokeDashoffset = offset; }, 100));
    });
  }

  const intelSection = document.querySelector('.section-intel');
  if ('IntersectionObserver' in window && intelSection) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { animateRings(); obs.disconnect(); } });
    }, { threshold: 0.2 });
    obs.observe(intelSection);
  } else {
    animateRings();
  }

  // =============================================================
  // 2. CAROUSEL
  // =============================================================
  const track   = document.getElementById('cardsTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const wrapper = document.querySelector('.cards-wrapper');
  let currentIndex = 0;

  function getVisibleCount() {
    const w = wrapper.offsetWidth;
    if (w >= 1024) return 3;
    if (w >= 768)  return 2;
    return 1;
  }
  function getCardWidth() {
    const cards = track.querySelectorAll('.intel-card');
    if (!cards.length) return 0;
    return cards[0].offsetWidth + (parseInt(getComputedStyle(track).gap) || 24);
  }
  function totalCards() { return track.querySelectorAll('.intel-card').length; }
  function updateCarousel() {
    const maxIndex = Math.max(0, totalCards() - getVisibleCount());
    currentIndex   = Math.min(currentIndex, maxIndex);
    track.style.transform = `translateX(${-currentIndex * getCardWidth()}px)`;
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex;
    prevBtn.style.opacity = prevBtn.disabled ? '0.35' : '1';
    nextBtn.style.opacity = nextBtn.disabled ? '0.35' : '1';
  }

  nextBtn.addEventListener('click', () => {
    if (currentIndex < Math.max(0, totalCards() - getVisibleCount())) { currentIndex++; updateCarousel(); }
  });
  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) { currentIndex--; updateCarousel(); }
  });
  window.addEventListener('resize', updateCarousel);
  updateCarousel();

  // =============================================================
  // 3. CHAT con LM Studio (a través del proxy CORS en puerto 8080)
  // =============================================================
  const chatInput    = document.getElementById('chatInput');
  const sendBtn      = document.getElementById('sendBtn');
  const chatMessages = document.getElementById('chatMessages');

  // Respuestas de respaldo (fallback)
  const aiReplies = [
    "Analyzing market positioning data… HPE GreenLake's key differentiators are cost predictability, data sovereignty, and compliance readiness.",
    "Based on current quarterly signals, lead with the <strong>Total Cost of Ownership</strong> narrative — CTO audiences respond strongly to 5-year CAPEX vs OPEX comparisons.",
    "Identified 3 strategic entry points aligned with their digital transformation roadmap. Shall I generate a briefing summary?",
    "Cross-referencing competitive intelligence… HPE's sovereign cloud narrative presents a compelling counter to hyperscaler lock-in concerns.",
  ];
  let replyIndex = 0;

  // URL del proxy que reenvía a LM Studio (debe estar corriendo en puerto 8080)
  const LM_STUDIO_PROXY_URL = 'http://localhost:8080/v1/chat/completions';

  // Elementos del estado del chat (añadimos un indicador visual en el header del chat)
  const chatStatusSpan = document.querySelector('.chat-status');
  let statusDot = null;
  let statusTextSpan = null;

  function initChatStatus() {
    if (!chatStatusSpan) return;
    // Limpiar contenido existente y añadir nuestros elementos
    chatStatusSpan.innerHTML = '';
    statusDot = document.createElement('span');
    statusDot.className = 'status-dot';
    statusTextSpan = document.createElement('span');
    statusTextSpan.textContent = 'Conectando...';
    chatStatusSpan.appendChild(statusDot);
    chatStatusSpan.appendChild(statusTextSpan);
  }

  function updateChatStatus(connected, errorMsg = '') {
  const statusDot = document.querySelector('.chat-status .status-dot');
  const statusText = document.querySelector('.chat-status span:last-child');
  if (!statusDot || !statusText) return;
  if (connected) {
    statusDot.style.backgroundColor = '#00e0af';
    statusText.textContent = 'LM Studio Live';
  } else {
    statusDot.style.backgroundColor = '#ff4d4d';
    statusText.textContent = errorMsg || 'LM Studio Offline';
  }
}

  function addMessage(text, type) {
    const msg = document.createElement('div');
    msg.classList.add('message', type === 'user' ? 'user-message' : 'ai-message');
    msg.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(msg);
    chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
  }

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;
  addMessage(text, 'user');
  chatInput.value = '';

  const typing = document.createElement('div');
  typing.classList.add('message', 'ai-message');
  typing.id = 'typing';
  typing.innerHTML = '<p class="typing-dots"><span>·</span><span>·</span><span>·</span></p>';
  chatMessages.appendChild(typing);
  chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });

  // URLs posibles (prueba con /v1/chat/completions primero, luego /completions)
  const urlsToTry = [
    'http://localhost:8080/v1/chat/completions',
    'http://localhost:8080/completions',
    'http://localhost:8080/v1/completions'
  ];

  let reply = null;
  let lastError = null;

  for (const url of urlsToTry) {
    try {
      console.log(`Intentando con: ${url}`);
      
      // Determinar el payload según la URL
      let payload;
      if (url.includes('/chat/completions')) {
        payload = {
          model: "local-model",
          messages: [
            { role: "system", content: "Eres un asistente experto en HPE y sovereign cloud. Responde en español, conciso y profesional." },
            { role: "user", content: text }
          ],
          temperature: 0.7,
          max_tokens: 500,
          stream: false
        };
      } else {
        // Formato de completion simple
        payload = {
          model: "local-model",
          prompt: text,
          temperature: 0.7,
          max_tokens: 500,
          stream: false
        };
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': window.PROXY_SECRET || ''
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000)
      });

      const data = await response.json();
      console.log(`Respuesta de ${url}:`, data);

      // Intentar extraer el texto de respuesta según diferentes formatos
      let extracted = null;
      if (data.choices && data.choices[0]) {
        if (data.choices[0].message && data.choices[0].message.content) {
          extracted = data.choices[0].message.content;
        } else if (data.choices[0].text) {
          extracted = data.choices[0].text;
        }
      } else if (data.content) {
        extracted = data.content;
      } else if (data.response) {
        extracted = data.response;
      }

      if (extracted && extracted.trim()) {
        reply = extracted;
        break; // éxito, salimos del bucle
      } else {
        console.warn(`Formato no reconocido en ${url}, se intenta la siguiente`);
      }
    } catch (err) {
      console.warn(`Error con ${url}:`, err.message);
      lastError = err;
    }
  }

  typing.remove();

  if (reply) {
    addMessage(reply, 'ai');
    updateChatStatus(true);
  } else {
    // Fallback a respuestas predefinidas
    console.error("No se pudo obtener respuesta de LM Studio", lastError);
    addMessage(aiReplies[replyIndex++ % aiReplies.length], 'ai');
    updateChatStatus(false, 'LM Studio no responde');
  }
}

  

  // Inicializar indicador de estado del chat y comprobar conexión periódicamente
  initChatStatus();

  async function checkLMStudioConnection() {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch('http://localhost:8080/health', {
        signal: controller.signal,
        headers: { 'X-API-Key': window.PROXY_SECRET || '' }
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        updateChatStatus(true);
      } else {
        updateChatStatus(false);
      }
    } catch (err) {
      updateChatStatus(false);
    }
  }

  checkLMStudioConnection();
  setInterval(checkLMStudioConnection, 30000); // revisar cada 30 segundos

  // =============================================================
  // 4. SIDEBAR MÓVIL
  // =============================================================
  const sidebar   = document.getElementById('sidebar');
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const overlay   = document.getElementById('menuOverlay');

  function closeSidebar() {
    sidebar?.classList.remove('mobile-open');
    overlay?.classList.remove('active');
    mobileBtn?.classList.remove('is-active');
  }
  function openSidebar() {
    sidebar?.classList.add('mobile-open');
    overlay?.classList.add('active');
    mobileBtn?.classList.add('is-active');
  }

  mobileBtn?.addEventListener('click', e => {
    e.stopPropagation();
    sidebar.classList.contains('mobile-open') ? closeSidebar() : openSidebar();
  });
  overlay?.addEventListener('click', closeSidebar);
  window.addEventListener('resize', () => { if (window.innerWidth > 768) closeSidebar(); });

  // =============================================================
  // 5. DETAIL CARDS (clic en tarjeta)
  // =============================================================
  let activeDetailCard = null;

  function hideAllDetailCards() {
    document.querySelectorAll('.detail-card').forEach(c => c.classList.remove('active'));
    activeDetailCard = null;
  }
  document.querySelectorAll('.intel-card').forEach(card => {
    card.addEventListener('click', e => {
      if (activeDetailCard?.contains(e.target)) return;
      const detail = card.querySelector('.detail-card');
      if (!detail) return;
      if (activeDetailCard === detail) { hideAllDetailCards(); }
      else { hideAllDetailCards(); detail.classList.add('active'); activeDetailCard = detail; }
    });
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.intel-card')) hideAllDetailCards();
  });

  // =============================================================
  // 6. COMPANIES SUBMENU
  // =============================================================
  const companiesBtn     = document.getElementById('companiesBtn');
  const companiesSubmenu = document.getElementById('companiesSubmenu');

  if (companiesBtn && companiesSubmenu) {
    companiesBtn.addEventListener('click', e => {
      e.stopPropagation();
      companiesSubmenu.classList.toggle('open');
    });
    document.addEventListener('click', e => {
      if (!companiesBtn.contains(e.target) && !companiesSubmenu.contains(e.target))
        companiesSubmenu.classList.remove('open');
    });
    document.querySelectorAll('.nav-submenu-item').forEach(item => {
      item.addEventListener('click', e => {
        e.stopPropagation();
        const url = item.getAttribute('data-url');
        if (url) window.location.href = url;
        companiesSubmenu.classList.remove('open');
      });
    });
  }

  // =============================================================
  // 7. NAV ITEMS
  // =============================================================
  const navItems         = document.querySelectorAll('.nav-item');
  const profileToggleBtn = document.getElementById('profileToggleBtn');
  const profileSubmenu   = document.getElementById('profileSubmenu');
  const profileSubItems  = document.querySelectorAll('.nav-subitem');

  navItems.forEach(item => {
    if (item.id === 'companiesBtn') return;
    item.addEventListener('click', () => {
      if (item.id === 'profileToggleBtn') {
        item.classList.toggle('open');
        profileSubmenu?.classList.toggle('open');
        return;
      }
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');
      if (item.getAttribute('data-nav') === 'reset') {
        const msg = document.createElement('div');
        msg.className = 'message ai-message';
        msg.innerHTML = '<p>🧠 Intelligence reset. Market context refreshed.</p>';
        chatMessages.appendChild(msg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        setTimeout(() => msg.remove(), 2500);
      }
      if (window.innerWidth <= 768) closeSidebar();
    });
  });
  profileSubItems.forEach(sub => {
    sub.addEventListener('click', e => {
      e.stopPropagation();
      profileSubItems.forEach(i => i.classList.remove('active'));
      sub.classList.add('active');
    });
  });
  document.addEventListener('click', e => {
    if (!e.target.closest('.sidebar') && !e.target.closest('.mobile-menu-btn')) {
      closeSidebar();
      profileSubmenu?.classList.remove('open');
      profileToggleBtn?.classList.remove('open');
    }
  });

  const footerBtn = document.getElementById('sidebarFooterBtn');
  const userPopup = document.getElementById('userMenuPopup');
  if (footerBtn && userPopup) {
    footerBtn.addEventListener('click', e => { e.stopPropagation(); userPopup.classList.toggle('active'); });
    document.addEventListener('click', e => {
      if (!userPopup.contains(e.target) && !footerBtn.contains(e.target)) userPopup.classList.remove('active');
    });
  }

  // =============================================================
  // 8. INTEGRACIÓN IA LOCAL — actualiza cards desde IA.py (:5000)
  //    (NO SE MODIFICA — sigue funcionando igual)
  // =============================================================

  const TICKER_MAP = {
    'MSFT': 'MSFT',
    'NVDA': 'NVDA',
    'SNOW': 'SNOW',
    'AWS':  'AMZN',
    'SMSN': '005930.KS',
  };

  const PRIORITY_COLOR  = { HIGH: '#ff4d6d', MEDIUM: '#f4a261', LOW: '#00c98d' };
  const PRIORITY_LABEL  = { HIGH: '⚡ Alta Prioridad', MEDIUM: '◎ Media Prioridad', LOW: '✓ Baja Prioridad' };
  const PRIORITY_BORDER = {
    HIGH:   'rgba(255, 77, 109, 0.55)',
    MEDIUM: 'rgba(244, 162,  97, 0.45)',
    LOW:    'rgba(  0, 201, 141, 0.40)',
  };

  function injectStyles() {
    if (document.getElementById('siah-styles')) return;
    const s = document.createElement('style');
    s.id = 'siah-styles';
    s.textContent = `
      @keyframes siahUp   { from{opacity:0;transform:translateY(7px)} to{opacity:1;transform:none} }
      @keyframes siahBeat { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.3;transform:scale(.5)} }

      .siah-loading-bar {
        display:flex; align-items:center; gap:8px;
        padding:7px 13px; border-radius:6px; margin:6px 0;
        background:rgba(0,201,141,.06); animation:siahUp .3s ease;
      }
      .siah-dot {
        width:7px; height:7px; border-radius:50%; flex-shrink:0;
        background:#00c98d; animation:siahBeat 1.1s ease-in-out infinite;
      }
      .siah-loading-text {
        font-family:'Space Mono',monospace; font-size:10px;
        color:rgba(0,201,141,.65); letter-spacing:.04em;
      }

      .siah-status {
        display:flex; align-items:center; gap:6px;
        font-family:'Space Mono',monospace; font-size:10px;
        color:rgba(0,201,141,.65); letter-spacing:.05em;
      }
      .siah-status-dot {
        width:6px; height:6px; border-radius:50%; background:#00c98d;
      }
      .siah-status-dot.beat { animation:siahBeat 1s ease-in-out infinite; }

      .siah-insight {
        margin-top:10px; padding:10px 12px;
        border-radius:0 6px 6px 0; background:rgba(0,201,141,.06);
        animation:siahUp .45s ease forwards;
      }
      .siah-priority { display:block; font-size:10px; font-family:'Space Mono',monospace;
        font-weight:700; text-transform:uppercase; letter-spacing:.08em; margin-bottom:6px; }
      .siah-insight-p { font-size:11.5px; line-height:1.5; margin:0 0 5px;
        color:var(--text-muted,rgba(255,255,255,.62)); }
      .siah-pitch-p   { font-size:11px; line-height:1.45; margin:0; font-style:italic;
        color:var(--text-secondary,rgba(255,255,255,.42)); }

      .siah-badge {
        position:absolute; top:11px; right:11px;
        font-size:9px; font-family:'Space Mono',monospace; font-weight:700;
        letter-spacing:.1em; padding:2px 6px; border-radius:4px; color:#000; z-index:3;
      }

      .siah-price {
        display:inline-flex; align-items:center; gap:5px;
        padding:3px 9px; border-radius:20px; margin-top:6px;
        font-family:'Space Mono',monospace; font-size:11px; font-weight:700;
        animation:siahUp .4s ease forwards;
      }
      .siah-price.up   { background:rgba(0,201,141,.12); color:#00c98d; }
      .siah-price.down { background:rgba(255,77,109,.12); color:#ff4d6d; }
    `;
    document.head.appendChild(s);
  }

  function buildCardMap() {
    const map = {};
    document.querySelectorAll('.intel-card').forEach(card => {
      const logo = card.querySelector('.company-logo')?.textContent.trim();
      if (logo && TICKER_MAP[logo]) map[TICKER_MAP[logo]] = card;
    });
    return map;
  }

  function setLoading(card, on) {
    if (on) {
      if (!card.querySelector('.siah-loading-bar')) {
        const bar = document.createElement('div');
        bar.className = 'siah-loading-bar';
        bar.innerHTML = `<span class="siah-dot"></span>
                         <span class="siah-loading-text">Sovereign AI analizando…</span>`;
        const footer = card.querySelector('.card-footer');
        footer ? card.insertBefore(bar, footer) : card.appendChild(bar);
      }
    } else {
      card.querySelector('.siah-loading-bar')?.remove();
    }
  }

  function applyToCard(card, d) {
    const pri    = (d.priority || 'LOW').toUpperCase();
    const color  = PRIORITY_COLOR[pri]  || '#00c98d';
    const border = PRIORITY_BORDER[pri] || 'rgba(0,201,141,.4)';
    const lbl    = PRIORITY_LABEL[pri]  || pri;

    card.style.transition  = 'border-color .5s ease';
    card.style.borderColor = border;

    card.querySelector('.siah-badge')?.remove();
    const badge = document.createElement('span');
    badge.className = 'siah-badge';
    badge.textContent = 'AI';
    badge.style.background = color;
    const top = card.querySelector('.card-top');
    if (top) { top.style.position = 'relative'; top.appendChild(badge); }

    const solEl = card.querySelector('.card-solution .solution-name');
    if (solEl && d.solution) {
      solEl.style.transition = 'opacity .35s';
      solEl.style.opacity    = '0';
      setTimeout(() => {
        solEl.textContent  = d.solution_full || d.solution;
        solEl.style.opacity = '1';
      }, 350);
    }

    const tagEl = card.querySelector('.card-tag');
    if (tagEl && d.tag) {
      tagEl.style.transition = 'opacity .35s';
      tagEl.style.opacity    = '0';
      setTimeout(() => { tagEl.textContent = d.tag; tagEl.style.opacity = '1'; }, 450);
    }

    if (d.precio_actual) {
      const logoEl = card.querySelector('.company-logo');
      if (logoEl) {
        card.querySelector('.siah-price')?.remove();
        const isUp = (d.cambio_diario_pct || 0) >= 0;
        const pill = document.createElement('div');
        pill.className = `siah-price ${isUp ? 'up' : 'down'}`;
        pill.innerHTML = `$${d.precio_actual} <span>${isUp ? '▲' : '▼'} ${Math.abs(d.cambio_diario_pct || 0).toFixed(2)}%</span>`;
        logoEl.parentNode.insertBefore(pill, logoEl.nextSibling);
      }
    }

    const stats = card.querySelectorAll('.company-stats span');
    if (stats.length >= 2) {
      if (d.stat1_label && d.stat1_value) stats[0].textContent = `${d.stat1_label}: ${d.stat1_value}`;
      if (d.stat2_label && d.stat2_value) stats[1].textContent = `${d.stat2_label}: ${d.stat2_value}`;
    }

    const body = card.querySelector('.detail-body');
    if (body) {
      body.querySelector('.siah-insight')?.remove();
      const block = document.createElement('div');
      block.className  = 'siah-insight';
      block.style.borderLeft = `3px solid ${color}`;
      block.innerHTML = `
        <span class="siah-priority" style="color:${color}">${lbl}</span>
        <p class="siah-insight-p">${d.insight || '—'}</p>
        <p class="siah-pitch-p">"${d.pitch || '—'}"</p>
      `;
      body.appendChild(block);
    }

    const detSol = card.querySelector('.detail-footer .solution-name');
    if (detSol && d.solution_full) detSol.textContent = d.solution_full;
  }

  function mkStatus() {
    const header = document.querySelector('.section-header');
    if (!header || header.querySelector('.siah-status')) return header?.querySelector('.siah-status');
    const el = document.createElement('div');
    el.className = 'siah-status';
    el.innerHTML = `<span class="siah-status-dot beat"></span>
                    <span class="siah-status-text">Cargando inteligencia…</span>`;
    header.appendChild(el);
    return el;
  }
  function setStatus(el, txt, stop = false) {
    if (!el) return;
    if (stop) el.querySelector('.siah-status-dot')?.classList.remove('beat');
    const s = el.querySelector('.siah-status-text');
    if (s) s.textContent = txt;
  }

  async function loadCardsFromIA() {
    injectStyles();
    const cardMap  = buildCardMap();
    const statusEl = mkStatus();

    if (!Object.keys(cardMap).length) return;

    Object.values(cardMap).forEach(c => setLoading(c, true));

    try {
      const res = await fetch('http://localhost:5000/api/cards', {
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const payload  = await res.json();
      const empresas = payload.empresas || [];
      if (!empresas.length) throw new Error('Sin empresas en respuesta');

      let n = 0;
      empresas.forEach(empresa => {
        const card = cardMap[empresa.ticker];
        if (!card) return;
        setLoading(card, false);
        applyToCard(card, empresa);
        n++;
      });

      Object.values(cardMap).forEach(c => setLoading(c, false));
      setStatus(statusEl, `${n} empresas · ${payload.fecha || '—'}`, true);
      console.info(`[SIAH] ✓ ${n} cards actualizadas — ${payload.fecha}`);

    } catch (err) {
      Object.values(cardMap).forEach(c => setLoading(c, false));
      setStatus(statusEl, 'IA local no disponible', true);
      console.warn('[SIAH] IA.py no responde en localhost:5000 —', err.message);
    }
  }

  loadCardsFromIA();
});