// translator.js - Traducción robusta con tu JSON extenso

let translations = null;
let originalTextMap = new Map(); // Guarda los textos originales exactos de cada nodo

async function loadTranslations() {
  try {
    let jsonPath = 'js/translations.json';
    if (window.location.pathname.includes('pages') || window.location.pathname.includes('menu')) {
      jsonPath = '../js/translations.json';
    }
    const res = await fetch(jsonPath);
    if (!res.ok) throw new Error('translations.json not found');
    translations = await res.json();
    console.log('✅ Traducciones cargadas correctamente');
    return true;
  } catch (e) {
    console.error('❌ Error cargando traducciones:', e);
    return false;
  }
}

function getBrowserLanguage() {
  const lang = navigator.language.slice(0, 2).toLowerCase();
  if (lang === 'en') return 'English';
  if (lang === 'fr') return 'French';
  return 'Spanish';
}

// Función para normalizar texto (eliminar saltos de línea y espacios múltiples)
function normalizeText(text) {
  return text.replace(/\s+/g, ' ').trim();
}

// Capturar todos los textos originales del DOM (solo una vez)
function captureOriginalTexts() {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  let node;
  while (node = walker.nextNode()) {
    const text = node.nodeValue;
    if (text && text.trim().length > 0 && !originalTextMap.has(node)) {
      originalTextMap.set(node, text);
    }
  }
  console.log(`📝 Capturados ${originalTextMap.size} nodos de texto originales`);
}

function translateElementByKey(element, translation) {
  if (translation === undefined || translation === null) return false;

  const childNodes = Array.from(element.childNodes);
  const tokens = [];
  for (const node of childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      tokens.push({ type: 'text', node });
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      tokens.push({ type: 'placeholder', text: node.textContent, node });
    } else {
      tokens.push({ type: 'other', node });
    }
  }

  // Si no hay elementos hijos, se puede traducir directamente el texto completo.
  if (!tokens.some(token => token.type === 'placeholder')) {
    element.textContent = translation;
    return true;
  }

  let remainder = translation;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === 'text') {
      const nextPlaceholder = tokens.slice(i + 1).find(t => t.type === 'placeholder');
      if (nextPlaceholder) {
        const index = remainder.indexOf(nextPlaceholder.text);
        if (index === -1) {
          element.textContent = translation;
          return true;
        }
        token.node.nodeValue = remainder.slice(0, index);
        remainder = remainder.slice(index);
      } else {
        token.node.nodeValue = remainder;
        remainder = '';
      }
    } else if (token.type === 'placeholder') {
      if (!remainder.startsWith(token.text)) {
        element.textContent = translation;
        return true;
      }
      remainder = remainder.slice(token.text.length);
    }
  }

  return true;
}

function applyTranslation(lang) {
  if (!translations) {
    console.warn('⚠️ Traducciones no cargadas aún');
    return;
  }

  let targetLang = lang;
  if (lang === 'Auto-detect') {
    targetLang = getBrowserLanguage();
  }
  const dict = translations[targetLang] || translations['Spanish'];
  console.log(`🌐 Aplicando traducción a ${targetLang} (${Object.keys(dict).length} claves disponibles)`);

  let translatedCount = 0;

  // 1. Aplicar traducciones basadas en data-i18n
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = dict[key];
    if (translateElementByKey(element, translation)) {
      translatedCount++;
    }
  });

  // 2. Traducir placeholders usando data-i18n-placeholder o texto original
  document.querySelectorAll('input[data-i18n-placeholder], textarea[data-i18n-placeholder]').forEach(element => {
    const key = element.getAttribute('data-i18n-placeholder');
    const translation = dict[key];
    if (translation) {
      element.placeholder = translation;
      translatedCount++;
      return;
    }
    const originalPlaceholder = element.getAttribute('data-orig-placeholder') || element.placeholder;
    if (!element.getAttribute('data-orig-placeholder')) {
      element.setAttribute('data-orig-placeholder', originalPlaceholder);
    }
    const normalizedPlaceholder = normalizeText(originalPlaceholder);
    if (dict[normalizedPlaceholder] !== undefined && dict[normalizedPlaceholder] !== normalizedPlaceholder) {
      element.placeholder = dict[normalizedPlaceholder];
      translatedCount++;
    }
  });

  // 3. Fallback: traducir textos que no usan data-i18n mediante coincidencia normalizada
  for (let [node, originalText] of originalTextMap.entries()) {
    const normalized = normalizeText(originalText);
    if (dict[normalized] !== undefined && dict[normalized] !== normalized) {
      const newText = originalText.replace(normalized, dict[normalized]);
      node.nodeValue = newText;
      translatedCount++;
    }
  }

  console.log(`✨ Se tradujeron ${translatedCount} textos`);
}

window.applyTranslation = applyTranslation;

// Inicialización
(async function init() {
  const loaded = await loadTranslations();
  if (!loaded) return;
  captureOriginalTexts();
  const savedLang = localStorage.getItem('hpe_language_pref') || 'Auto-detect';
  applyTranslation(savedLang);
})();