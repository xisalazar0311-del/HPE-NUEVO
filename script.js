document.addEventListener('DOMContentLoaded', () => {
  // SCORE RINGS
  const CIRCUMFERENCE = 2 * Math.PI * 20;

  function animateRings() {
    document.querySelectorAll('.ring-fill').forEach(ring => {
      const val = parseInt(ring.getAttribute('data-val'), 10);
      const offset = CIRCUMFERENCE - (val / 100) * CIRCUMFERENCE;
      requestAnimationFrame(() => { 
        setTimeout(() => { 
          ring.style.strokeDashoffset = offset; 
        }, 100); 
      });
    });
  }

  const intelSection = document.querySelector('.section-intel');
  if ('IntersectionObserver' in window && intelSection) {
    const obs = new IntersectionObserver(entries => { 
      entries.forEach(e => { 
        if(e.isIntersecting) { 
          animateRings(); 
          obs.disconnect(); 
        } 
      }); 
    }, { threshold: 0.2 });
    obs.observe(intelSection);
  } else { 
    animateRings(); 
  }

  // CAROUSEL
  const track = document.getElementById('cardsTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const wrapper = document.querySelector('.cards-wrapper');
  let currentIndex = 0;

  function getVisibleCount() { 
    const w = wrapper.offsetWidth; 
    if(w >= 960) return 3; 
    if(w >= 600) return 2; 
    return 1; 
  }

  function getCardWidth() { 
    const cards = track.querySelectorAll('.intel-card'); 
    if(!cards.length) return 0; 
    return cards[0].offsetWidth + 20; 
  }

  function totalCards() { 
    return track.querySelectorAll('.intel-card').length; 
  }

  function updateCarousel() {
    const visible = getVisibleCount();
    const maxIndex = Math.max(0, totalCards() - visible);
    currentIndex = Math.min(currentIndex, maxIndex);
    track.style.transform = `translateX(-${currentIndex * getCardWidth()}px)`;
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex;
    prevBtn.style.opacity = prevBtn.disabled ? '0.35' : '1';
    nextBtn.style.opacity = nextBtn.disabled ? '0.35' : '1';
  }

  nextBtn.addEventListener('click', () => { 
    const visible = getVisibleCount(); 
    const maxIndex = Math.max(0, totalCards() - visible); 
    if(currentIndex < maxIndex) { 
      currentIndex++; 
      updateCarousel(); 
    } 
  });

  prevBtn.addEventListener('click', () => { 
    if(currentIndex > 0) { 
      currentIndex--; 
      updateCarousel(); 
    } 
  });

  window.addEventListener('resize', updateCarousel);
  updateCarousel();

  // CHAT
  const chatInput = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendBtn');
  const chatMessages = document.getElementById('chatMessages');
  const aiReplies = [
    "Analyzing market positioning data for your query… The key differentiators for HPE GreenLake in enterprise contexts are cost predictability, data sovereignty, and compliance readiness.", 
    "Based on current quarterly signals, I recommend leading with the <strong>Total Cost of Ownership</strong> narrative — CTO audiences respond strongly to 5-year CAPEX vs OPEX comparisons.", 
    "Identified 3 strategic entry points aligned with their digital transformation roadmap. Shall I generate a briefing summary?", 
    "Cross-referencing competitive intelligence… HPE's sovereign cloud narrative presents a compelling counter to hyperscaler lock-in concerns surfaced in recent RFPs."
  ];
  let replyIndex = 0;

  function addMessage(text, type) {
    const msg = document.createElement('div');
    msg.classList.add('message', type === 'user' ? 'user-message' : 'ai-message');
    msg.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(msg);
    chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
  }

  function sendMessage() {
    const text = chatInput.value.trim();
    if(!text) return;
    addMessage(text, 'user');
    chatInput.value = '';
    
    const typing = document.createElement('div');
    typing.classList.add('message', 'ai-message');
    typing.id = 'typing';
    typing.innerHTML = '<p class="typing-dots"><span>·</span><span>·</span><span>·</span></p>';
    chatMessages.appendChild(typing);
    chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
    
    setTimeout(() => {
      typing.remove();
      const reply = aiReplies[replyIndex % aiReplies.length];
      replyIndex++;
      addMessage(reply, 'ai');
    }, 1100 + Math.random() * 700);
  }

  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keydown', e => { 
    if(e.key === 'Enter') sendMessage(); 
  });

  // SIDEBAR MÓVIL
  const sidebar = document.getElementById('sidebar');
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const overlay = document.getElementById('menuOverlay');

  function closeSidebar() {
    if(sidebar) sidebar.classList.remove('mobile-open');
    if(overlay) overlay.classList.remove('active');
  }

  function openSidebar() {
    if(sidebar) sidebar.classList.add('mobile-open');
    if(overlay) overlay.classList.add('active');
  }

  if(mobileBtn && window.innerWidth <= 768) {
    mobileBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if(sidebar.classList.contains('mobile-open')) {
        closeSidebar();
      } else {
        openSidebar();
      }
    });

    if(overlay) overlay.addEventListener('click', closeSidebar);
    
    document.querySelectorAll('.nav-item').forEach(btn => {
      btn.addEventListener('click', () => {
        if(window.innerWidth <= 768) closeSidebar();
      });
    });
  }

  window.addEventListener('resize', () => {
    if(window.innerWidth > 768) {
      closeSidebar();
    } else {
      if(overlay && !sidebar.classList.contains('mobile-open')) overlay.classList.remove('active');
    }
  });

  // Navegación activa
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      if(item.getAttribute('data-nav') === 'reset') {
        const msg = document.createElement('div');
        msg.className = 'message ai-message';
        msg.innerHTML = '<p>🧠 Intelligence reset. Market context refreshed.</p>';
        chatMessages.appendChild(msg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        setTimeout(() => msg.remove(), 2500);
      }
    });
  });
});
