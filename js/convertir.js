const fs = require('fs');

// 1. Lee tu archivo original
const rawData = fs.readFileSync('translations.json', 'utf8');
const originalJson = JSON.parse(rawData);

// 2. Diccionario para mapear los nombres de los idiomas a códigos estándar
const languageCodes = {
    "English": "en",
    "French": "fr",
    "Spanish": "es",
    "German": "de",
    "Italian": "it"
};

const i18nJson = {};

// 3. Reestructura el JSON
for (const [lang, translations] of Object.entries(originalJson)) {
    // Si el idioma está en el diccionario, usa su código; de lo contrario, úsalo en minúsculas
    const code = languageCodes[lang] || lang.toLowerCase();
    
    i18nJson[code] = {
        translation: translations
    };
}

// 4. Guarda el nuevo archivo listo para data-i18n
fs.writeFileSync('i18n_translations.json', JSON.stringify(i18nJson, null, 2));
console.log('¡Archivo convertido exitosamente a i18n_translations.json!');