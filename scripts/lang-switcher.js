
const langButton = document.getElementById('t');
const html = document.documentElement;
let langStrings = {};

async function loadLangStrings(lang) {
  try {
    const res = await fetch(`lang/${lang}.json`);
    langStrings = await res.json();
  } catch (e) {
    langStrings = {};
  }
}


async function updateTexts() {
  if (!langStrings.switchButton) {
    await loadLangStrings(html.lang);
  }
  // Update language switch button
  langButton.textContent = langStrings.switchButton || (html.lang === 'en' ? 'FR' : 'EN');
  // Update all elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (langStrings[key]) {
      el.textContent = langStrings[key];
    }
  });
}

async function switchLanguage() {
  const currentLang = html.lang;
  const newLang = currentLang === 'en' ? 'fr' : 'en';
  html.lang = newLang;
  html.className = `lang-${newLang}`;
  try {
    localStorage.setItem('lang', newLang);
  } catch (e) {
    // Ignore storage errors
  }
  await loadLangStrings(newLang);
  updateTexts();
}

// Restore language from localStorage if available
let savedLang = null;
try {
  savedLang = localStorage.getItem('lang');
} catch (e) {
  // Ignore storage errors
}


(async () => {
  if (savedLang && savedLang !== html.lang) {
    html.lang = savedLang;
    html.className = `lang-${savedLang}`;
  }
  await loadLangStrings(html.lang);
  updateTexts();
})();

langButton.addEventListener('click', switchLanguage);