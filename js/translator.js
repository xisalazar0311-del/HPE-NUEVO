// translator.js
// Advanced Zero-Invasive TreeWalker Translation Engine

let translations = null;
let originalTextNodes = []; // Store mapping { node: TextNode, originalTrimmed: "Spanish Text", fullText: " Original Spanish Text " }

async function initTranslator() {
  try {
    // Determine depth path (if we are in pages/ or menu/, we need ../js/)
    let jsonPath = 'js/translations.json';
    if (window.location.pathname.includes('pages') || window.location.pathname.includes('menu')) {
        jsonPath = '../js/translations.json';
    }

    const res = await fetch(jsonPath);
    if (!res.ok) throw new Error("Could not find translations.json");
    translations = await res.json();
    
    // Scrape original texts ONCE exactly as the page loads
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while(node = walker.nextNode()) {
      const text = node.nodeValue;
      if (text && text.trim().length > 1 && !text.trim().startsWith('{') && !text.trim().startsWith('.')) {
         originalTextNodes.push({ node: node, originalTrimmed: text.trim(), fullText: text });
      }
    }

    // Apply translation immediately if not Spanish
    const pref = localStorage.getItem('hpe_language_pref') || 'Auto-detect';
    window.applyTranslation(pref);
  } catch (e) {
    console.error("Failed to initialize translator:", e);
  }
}

window.applyTranslation = function(lang) {
  if (!translations) return;
  
  let targetLang = lang;
  if (lang === 'Auto-detect') {
      const browserLang = navigator.language.slice(0, 2).toLowerCase();
      if (browserLang === 'en') targetLang = 'English';
      else if (browserLang === 'fr') targetLang = 'French';
      else targetLang = 'Spanish'; // default to original
  }

  const dict = translations[targetLang] || translations["Spanish"];

  originalTextNodes.forEach(item => {
     const orig = item.originalTrimmed;
     if (dict[orig]) {
         item.node.nodeValue = item.fullText.replace(orig, dict[orig]);
     } else {
         // Revert to native Spanish safely if translation missing
         item.node.nodeValue = item.fullText; 
     }
  });

  // Also translate placeholders for inputs
  document.querySelectorAll('input').forEach(input => {
      if (input.placeholder && input.placeholder.trim() !== '') {
          if (!input.dataset.origPlaceholder) {
              input.dataset.origPlaceholder = input.placeholder.trim();
          }
          const orig = input.dataset.origPlaceholder;
          if (dict[orig]) {
              input.placeholder = dict[orig];
          } else {
              input.placeholder = orig;
          }
      }
  });
};

document.addEventListener('DOMContentLoaded', initTranslator);