
const html = document.documentElement;
let langStrings = {};

async function loadLangStrings(lang) {
  try {
    // Add cache-busting timestamp to ensure fresh load
    const cacheBuster = new Date().getTime();
    const res = await fetch(`lang/${lang}.json?v=${cacheBuster}`);
    if (!res.ok) {
      throw new Error(`Failed to load ${lang}.json`);
    }
    langStrings = await res.json();
    console.log(`Loaded ${Object.keys(langStrings).length} translations for ${lang}`);
  } catch (e) {
    console.error(`Error loading language ${lang}:`, e);
    langStrings = {};
  }
}


async function updateTexts() {
  // Ensure language strings are loaded before updating
  if (!langStrings || Object.keys(langStrings).length === 0 || !langStrings.switchButton) {
    console.log(`Loading language strings for: ${html.lang}`);
    await loadLangStrings(html.lang);
  }
  
  // Verify we have the right language loaded
  if (langStrings && Object.keys(langStrings).length > 0) {
    console.log(`Updating page with ${html.lang} - First key check: petitionTitle = "${langStrings.petitionTitle}"`);
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
  const i18nElements = document.querySelectorAll('[data-i18n]');
  console.log(`Found ${i18nElements.length} elements to translate for language: ${html.lang}`);
  
  i18nElements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    const keys = key.split('.');
    let value = langStrings;
    for (const k of keys) {
      value = value?.[k];
    }
    if (value !== undefined && value !== null && value !== '') {
      // Make sure element is visible
      el.style.visibility = 'visible';
      el.style.display = '';
      
      // Special handling for mobile menu logo - split title into two lines
      if (el.classList.contains('mobile-menu-logo') && key === 'title') {
        // Split "Tiohtià:ke Strike" into "Tiohtià:ke" and "Strike"
        // For French "Grève Tiohtià:ke" into "Grève" and "Tiohtià:ke"
        const parts = value.split(' ');
        if (parts.length >= 2) {
          el.innerHTML = `<span class="logo-line-1">${parts[0]}</span><span class="logo-line-2">${parts.slice(1).join(' ')}</span>`;
        } else {
          el.textContent = value;
        }
      } else {
        el.textContent = value;
      }
      
      // Log petition paragraph updates for debugging
      if (key.includes('petitionPara2')) {
        console.log(`Updated ${key}: "${value.substring(0, 50)}..."`);
      }
    } else if (value === undefined || value === null || value === '') {
      // Log missing translations for debugging (only in development)
      if (typeof console !== 'undefined' && console.warn) {
        console.warn(`Missing translation for key: ${key} in language: ${html.lang}`);
      }
      // Ensure element is still visible even without content
      el.style.visibility = 'visible';
      el.style.display = '';
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

function getLangFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('lang') || null;
}

function getCurrentLang() {
  // Priority: URL parameter > localStorage > HTML lang attribute > default 'en'
  const urlLang = getLangFromURL();
  if (urlLang === 'en' || urlLang === 'fr') {
    return urlLang;
  }
  
  try {
    const storedLang = localStorage.getItem('lang');
    if (storedLang === 'en' || storedLang === 'fr') {
      return storedLang;
    }
  } catch (e) {
    // Ignore storage errors
  }
  
  // Fall back to HTML lang attribute or default
  return html.lang === 'fr' ? 'fr' : 'en';
}

function setLangInURL(lang) {
  const url = new URL(window.location.href);
  url.searchParams.set('lang', lang);
  window.location.href = url.toString();
}

function preserveLangInLinks() {
  const currentLang = getCurrentLang();
  if (!currentLang || currentLang === 'en') return; // Only need to preserve if not default
  
  // Update all internal navigation links to include lang parameter
  document.querySelectorAll('a[href^="/"], a[href^="./"]').forEach(link => {
    const href = link.getAttribute('href');
    if (href && !href.includes('lang=') && !href.startsWith('http') && !href.startsWith('mailto:') && !href.startsWith('#')) {
      try {
        const url = new URL(href, window.location.origin);
        url.searchParams.set('lang', currentLang);
        link.setAttribute('href', url.pathname + url.search);
      } catch (e) {
        // If URL parsing fails, try simple string manipulation
        const separator = href.includes('?') ? '&' : '?';
        link.setAttribute('href', href + separator + 'lang=' + currentLang);
      }
    }
  });
}

async function switchLanguage(event) {
  event.preventDefault();
  const currentLang = getCurrentLang();
  const newLang = currentLang === 'en' ? 'fr' : 'en';
  
  // Save to localStorage immediately
  try {
    localStorage.setItem('lang', newLang);
  } catch (e) {
    // Ignore storage errors
  }
  
  // Update URL with new language parameter
  setLangInURL(newLang);
}

(async () => {
  console.log('Language switcher initializing...');
  
  // Get the language to use (priority: URL > localStorage > HTML lang > default)
  const targetLang = getCurrentLang();
  const urlLang = getLangFromURL();
  
  console.log('Target language:', targetLang);
  console.log('URL lang:', urlLang);
  console.log('HTML lang attribute:', html.lang);
  
  // If no lang in URL but we have one in localStorage, redirect to add it
  if (!urlLang) {
    try {
      const storedLang = localStorage.getItem('lang');
      if (storedLang && (storedLang === 'en' || storedLang === 'fr') && storedLang !== 'en') {
        // Only redirect if not default (en) to avoid unnecessary redirects
        const url = new URL(window.location.href);
        url.searchParams.set('lang', storedLang);
        window.location.replace(url.toString());
        return; // Exit early, page will reload
      }
    } catch (e) {
      // Ignore storage errors
    }
  }
  
  // Update HTML lang attribute and class if needed
  if (targetLang !== html.lang) {
    console.log(`Updating HTML lang from ${html.lang} to ${targetLang}`);
    html.lang = targetLang;
    html.className = `lang-${targetLang}`;
  }
  
  // Save to localStorage if we got it from URL
  if (urlLang && (urlLang === 'en' || urlLang === 'fr')) {
    try {
      localStorage.setItem('lang', urlLang);
    } catch (e) {
      // Ignore storage errors
    }
  }
  
  console.log(`Final language to load: ${html.lang}`);
  // Ensure language strings are loaded before updating
  await loadLangStrings(html.lang);
  
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
      await updateTexts();
      preserveLangInLinks();
    });
  } else {
    await updateTexts();
    preserveLangInLinks();
  }
  
  // Add event listeners to all language switcher buttons
  document.querySelectorAll('.lang-switcher').forEach(langButton => {
    langButton.addEventListener('click', switchLanguage);
  });
  
  // Preserve language in links when they're added dynamically
  const observer = new MutationObserver(() => {
    preserveLangInLinks();
  });
  observer.observe(document.body, { childList: true, subtree: true });
  
  // Make updateTexts available globally
  window.updateTranslations = updateTexts;
})();