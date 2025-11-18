
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
  // Update document title
  if (langStrings.title) {
    document.title = langStrings.title;
  }
  // Update all language switch buttons
  document.querySelectorAll('.lang-switcher').forEach(langButton => {
    langButton.textContent = langStrings.switchButton || (html.lang === 'en' ? 'FR' : 'EN');
  });
  // Update all elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const keys = key.split('.');
    let value = langStrings;
    for (const k of keys) {
      value = value?.[k];
    }
    if (value !== undefined) {
      el.textContent = value;
    }
  });
  
  // Update all elements with data-i18n-href (for links)
  document.querySelectorAll('[data-i18n-href]').forEach(el => {
    const key = el.getAttribute('data-i18n-href');
    const keys = key.split('.');
    let value = langStrings;
    for (const k of keys) {
      value = value?.[k];
    }
    if (value !== undefined) {
      el.href = value;
    }
  });
  
  // Update all elements with data-i18n-aria-label (for aria-labels)
  document.querySelectorAll('[data-i18n-aria-label]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria-label');
    const keys = key.split('.');
    let value = langStrings;
    for (const k of keys) {
      value = value?.[k];
    }
    if (value !== undefined) {
      el.setAttribute('aria-label', value);
    }
  });
}

async function switchLanguage() {
  const currentLang = html.lang;
  const newLang = currentLang === 'en' ? 'fr' : 'en';
  html.lang = newLang;
  html.className = `lang-${newLang}`;
  
  // Update aria-pressed on all language switcher buttons
  document.querySelectorAll('.lang-switcher').forEach(btn => {
    btn.setAttribute('aria-pressed', newLang === 'fr' ? 'true' : 'false');
  });
  
  // Announce language change to screen readers
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = `Language switched to ${newLang === 'en' ? 'English' : 'Français'}`;
  document.body.appendChild(announcement);
  
  try {
    localStorage.setItem('lang', newLang);
  } catch (e) {
    // Ignore storage errors
  }
  
  await loadLangStrings(newLang);
  updateTexts();
  
  // Remove announcement after it's been read
  setTimeout(() => announcement.remove(), 1000);
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
  
  // Add event listeners to all language switcher buttons
  document.querySelectorAll('.lang-switcher').forEach(langButton => {
    langButton.addEventListener('click', switchLanguage);
  });
})();