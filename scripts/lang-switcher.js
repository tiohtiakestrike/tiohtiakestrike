// Constants
const FETCH_TIMEOUT_MS = 5000;
const MUTATION_DEBOUNCE_MS = 250;
const LANG_FILES_VERSION = "1.0.0"; // Update this when language files change
const REDIRECT_ATTEMPT_KEY = "lang_redirect_attempted";
const MAX_REDIRECT_ATTEMPTS = 3;

const html = document.documentElement;
let langStrings = {};

// Cache URLSearchParams to avoid recreating on every call
let cachedURLParams = null;
let cachedSearchString = null;

/**
 * Gets cached URLSearchParams, updating cache if search string changed
 * @returns {URLSearchParams} Cached URLSearchParams instance
 */
function getCachedURLParams() {
  const currentSearch = window.location.search;
  if (cachedSearchString !== currentSearch) {
    cachedURLParams = new URLSearchParams(currentSearch);
    cachedSearchString = currentSearch;
  }
  return cachedURLParams;
}

/**
 * Loads language strings from JSON file
 * @param {string} lang - Language code ('en' or 'fr')
 */
async function loadLangStrings(lang) {
  try {
    // Use version-based cache busting instead of timestamp
    // This allows browser caching while still invalidating when files change
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(`lang/${lang}.json?v=${LANG_FILES_VERSION}`, {
      signal: controller.signal,
      // Removed 'cache: no-cache' to allow browser caching
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`Failed to load ${lang}.json: ${res.status}`);
    }
    langStrings = await res.json();
  } catch (e) {
    // Ignore errors and use fallback
    // Fallback: use empty object
    langStrings = {};
    // Make sure content is still visible even if translations fail
    const i18nElements = document.querySelectorAll("[data-i18n]");
    i18nElements.forEach((el) => {
      el.style.visibility = "visible";
      el.style.display = "";
    });
  }
}

/**
 * Gets a nested value from an object using dot notation
 * Optimized to avoid string splitting for simple keys
 * @param {object} obj - Object to traverse
 * @param {string} keyPath - Dot-separated key path (e.g., 'nested.key')
 * @returns {*} The value at the path, or undefined
 */
function getNestedValue(obj, keyPath) {
  if (!keyPath || !obj) return undefined;

  // Fast path for simple keys (no dots)
  const dotIndex = keyPath.indexOf(".");
  if (dotIndex === -1) {
    return obj[keyPath];
  }

  // Slow path for nested keys
  const keys = keyPath.split(".");
  let value = obj;
  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) break;
  }
  return value;
}

/**
 * Updates all translatable text elements on the page
 * Optimized to batch DOM reads and writes
 */
async function updateTexts() {
  // Ensure language strings are loaded before updating
  if (
    !langStrings ||
    Object.keys(langStrings).length === 0 ||
    !langStrings.switchButton
  ) {
    await loadLangStrings(html.lang);
  }

  // Cache DOM queries for better performance
  const langButtons = document.querySelectorAll(".lang-switcher");
  const i18nElements = document.querySelectorAll("[data-i18n]");
  const i18nHrefElements = document.querySelectorAll("[data-i18n-href]");
  const i18nAriaElements = document.querySelectorAll("[data-i18n-aria-label]");

  // Update document title (only if changed)
  const newTitle = langStrings.title;
  if (newTitle && document.title !== newTitle) {
    document.title = newTitle;
  }

  // Cache switch button text
  const switchButtonText =
    langStrings.switchButton || (html.lang === "en" ? "FR" : "EN");

  // Update all language switch buttons (batch updates)
  langButtons.forEach((langButton) => {
    if (langButton.textContent !== switchButtonText) {
      langButton.textContent = switchButtonText;
    }
  });

  // Batch DOM reads first, then writes
  const updates = [];

  // Process data-i18n elements
  i18nElements.forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (!key) return;

    const value = getNestedValue(langStrings, key);
    const currentVisibility = el.style.visibility;
    const needsVisibilityUpdate =
      currentVisibility !== "visible" && currentVisibility !== "";

    if (value !== undefined && value !== null && value !== "") {
      // Check if element should split lines
      const shouldSplitLines =
        el.hasAttribute("data-split-lines") ||
        (el.classList.contains("mobile-menu-logo") && key === "title");

      if (shouldSplitLines) {
        const parts = value.split(" ");
        if (parts.length >= 2) {
          updates.push(() => {
            if (needsVisibilityUpdate) {
              el.style.visibility = "visible";
              el.style.display = "";
            }
            // Use createElement instead of innerHTML for XSS protection
            const line1 = document.createElement("span");
            line1.className = "logo-line-1";
            line1.textContent = parts[0];
            const line2 = document.createElement("span");
            line2.className = "logo-line-2";
            line2.textContent = parts.slice(1).join(" ");
            el.textContent = ""; // Clear existing content
            el.appendChild(line1);
            el.appendChild(line2);
          });
        } else {
          updates.push(() => {
            if (needsVisibilityUpdate) {
              el.style.visibility = "visible";
              el.style.display = "";
            }
            el.textContent = value;
          });
        }
      } else {
        updates.push(() => {
          if (needsVisibilityUpdate) {
            el.style.visibility = "visible";
            el.style.display = "";
          }
          if (el.textContent !== value) {
            el.textContent = value;
          }
        });
      }
    } else if (needsVisibilityUpdate) {
      updates.push(() => {
        el.style.visibility = "visible";
        el.style.display = "";
      });
    }
  });

  // Process data-i18n-href elements
  i18nHrefElements.forEach((el) => {
    const key = el.getAttribute("data-i18n-href");
    if (!key) return;

    const value = getNestedValue(langStrings, key);
    if (value !== undefined && el.href !== value) {
      updates.push(() => {
        el.href = value;
      });
    }
  });

  // Process data-i18n-aria-label elements
  i18nAriaElements.forEach((el) => {
    const key = el.getAttribute("data-i18n-aria-label");
    if (!key) return;

    const value = getNestedValue(langStrings, key);
    if (value !== undefined) {
      const currentAria = el.getAttribute("aria-label");
      if (currentAria !== value) {
        updates.push(() => {
          el.setAttribute("aria-label", value);
        });
      }
    }
  });

  // Batch all DOM writes
  // Use requestAnimationFrame only if there are many updates to avoid blocking
  if (updates.length > 0) {
    if (updates.length > 50) {
      // For large batches, use requestAnimationFrame to avoid blocking
      requestAnimationFrame(() => {
        updates.forEach((update) => update());
      });
    } else {
      // For small batches, execute synchronously for better performance
      updates.forEach((update) => update());
    }
  }
}

/**
 * Gets language from URL search parameters
 * Uses cached URLSearchParams for better performance
 * @returns {string|null} Language code or null
 */
function getLangFromURL() {
  const params = getCachedURLParams();
  return params.get("lang") || null;
}

/**
 * Gets the current language with priority: URL > localStorage > HTML lang > default 'en'
 * @returns {string} Language code ('en' or 'fr')
 */
function getCurrentLang() {
  const urlLang = getLangFromURL();
  if (urlLang === "en" || urlLang === "fr") {
    return urlLang;
  }

  try {
    const storedLang = localStorage.getItem("lang");
    if (storedLang === "en" || storedLang === "fr") {
      return storedLang;
    }
  } catch (e) {
    // Ignore storage errors (private browsing, quota exceeded, etc.)
  }

  // Fall back to HTML lang attribute or default
  return html.lang === "fr" ? "fr" : "en";
}

/**
 * Updates the URL with the specified language parameter
 * @param {string} lang - Language code to set
 */
function setLangInURL(lang) {
  const url = new URL(window.location.href);
  url.searchParams.set("lang", lang);
  window.location.href = url.toString();
}

// Pre-compile regex patterns for better performance
const INTERNAL_LINK_REGEX = /^\/\w+$/;
const RELATIVE_LINK_REGEX = /^\.\/\w+\.html$/;

/**
 * Preserves language parameter in all internal navigation links
 * This ensures language preference persists across page navigation
 * Optimized with early returns and pre-compiled regex
 */
function preserveLangInLinks() {
  const currentLang = getCurrentLang();
  // Only need to preserve if not default (en)
  if (!currentLang || currentLang === "en") return;

  // Update all internal navigation links to include lang parameter
  const links = document.querySelectorAll('a[href^="/"], a[href^="./"]');
  const langParam = `lang=${currentLang}`;
  const updates = [];

  links.forEach((link) => {
    const href = link.getAttribute("href");
    // Early returns for common cases
    if (!href || href.includes("lang=")) return;

    // Skip external links, mailto links, and anchors (fast string checks)
    const firstChar = href[0];
    if (
      firstChar === "#" ||
      href.startsWith("http") ||
      href.startsWith("mailto:")
    ) {
      return;
    }

    // Fast path checks before regex
    const isHTML = href.endsWith(".html");
    const isRoot = href === "/";

    // Only process HTML pages and root paths
    const isInternalLink =
      isHTML ||
      isRoot ||
      INTERNAL_LINK_REGEX.test(href) ||
      RELATIVE_LINK_REGEX.test(href);

    if (!isInternalLink) return;

    // Batch URL updates
    try {
      const url = new URL(href, window.location.origin);
      url.searchParams.set("lang", currentLang);
      const newHref = url.pathname + url.search;
      if (link.getAttribute("href") !== newHref) {
        updates.push(() => link.setAttribute("href", newHref));
      }
    } catch (e) {
      // If URL parsing fails, try simple string manipulation
      const separator = href.includes("?") ? "&" : "?";
      const newHref = href + separator + langParam;
      if (link.getAttribute("href") !== newHref) {
        updates.push(() => link.setAttribute("href", newHref));
      }
    }
  });

  // Batch DOM writes
  // Use requestAnimationFrame only for large batches
  if (updates.length > 0) {
    if (updates.length > 20) {
      requestAnimationFrame(() => {
        updates.forEach((update) => update());
      });
    } else {
      updates.forEach((update) => update());
    }
  }
}

/**
 * Switches the language between English and French
 * @param {Event} event - Click event
 */
function switchLanguage(event) {
  event.preventDefault();
  const currentLang = getCurrentLang();
  const newLang = currentLang === "en" ? "fr" : "en";

  // Save to localStorage immediately
  try {
    localStorage.setItem("lang", newLang);
  } catch (e) {
    // Ignore storage errors (private browsing, quota exceeded, etc.)
  }

  // Update URL with new language parameter
  setLangInURL(newLang);
}

/**
 * Checks if a redirect has been attempted to prevent infinite loops
 * @returns {boolean} True if redirect should be allowed
 */
function shouldAllowRedirect() {
  try {
    const attempts = parseInt(
      sessionStorage.getItem(REDIRECT_ATTEMPT_KEY) || "0",
      10,
    );
    return attempts < MAX_REDIRECT_ATTEMPTS;
  } catch (e) {
    // If sessionStorage fails, allow redirect (fallback)
    return true;
  }
}

/**
 * Records a redirect attempt to prevent infinite loops
 */
function recordRedirectAttempt() {
  try {
    const attempts = parseInt(
      sessionStorage.getItem(REDIRECT_ATTEMPT_KEY) || "0",
      10,
    );
    sessionStorage.setItem(REDIRECT_ATTEMPT_KEY, String(attempts + 1));
  } catch (e) {
    // Ignore storage errors
  }
}

/**
 * Clears redirect attempt counter after successful page load
 */
function clearRedirectAttempts() {
  try {
    sessionStorage.removeItem(REDIRECT_ATTEMPT_KEY);
  } catch (e) {
    // Ignore storage errors
  }
}

/**
 * Initializes the language switcher system
 */
(async () => {
  // Get the language to use (priority: URL > localStorage > HTML lang > default)
  const targetLang = getCurrentLang();
  const urlLang = getLangFromURL();

  // If no lang in URL but we have one in localStorage, redirect to add it
  // Add protection against infinite redirect loops
  if (!urlLang && shouldAllowRedirect()) {
    try {
      const storedLang = localStorage.getItem("lang");
      if (
        storedLang &&
        (storedLang === "en" || storedLang === "fr") &&
        storedLang !== "en"
      ) {
        // Only redirect if not default (en) to avoid unnecessary redirects
        recordRedirectAttempt();
        const url = new URL(window.location.href);
        url.searchParams.set("lang", storedLang);
        window.location.replace(url.toString());
        return; // Exit early, page will reload
      }
    } catch (e) {
      // Ignore storage errors
    }
  }

  // Clear redirect attempts on successful load
  clearRedirectAttempts();

  // Update HTML lang attribute and class if needed
  if (targetLang !== html.lang) {
    html.lang = targetLang;
    html.className = `lang-${targetLang}`;
  }

  // Save to localStorage if we got it from URL
  if (urlLang && (urlLang === "en" || urlLang === "fr")) {
    try {
      localStorage.setItem("lang", urlLang);
    } catch (e) {
      // Ignore storage errors
    }
  }

  // Ensure language strings are loaded before updating
  await loadLangStrings(html.lang);

  /**
   * Initializes DOM-dependent functionality
   */
  function initDOMFeatures() {
    // Update all translatable elements
    updateTexts();
    preserveLangInLinks();

    // Use event delegation for language switcher buttons (better performance)
    // Single listener on document instead of one per button
    document.addEventListener("click", function (e) {
      const langButton = e.target.closest(".lang-switcher");
      if (langButton) {
        switchLanguage(e);
      }
    });
  }

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDOMFeatures);
  } else {
    initDOMFeatures();
  }

  // Preserve language in links when they're added dynamically
  // Use debouncing and more targeted observation for better performance
  let preserveLangTimeout;
  let linkContainer = null;
  let observer = null;

  // Try to find a more specific container to observe (e.g., nav, main, etc.)
  // Falls back to body if no better container found
  function getLinkContainer() {
    if (linkContainer && document.contains(linkContainer)) {
      return linkContainer;
    }
    // Look for common containers that might have links
    linkContainer =
      document.querySelector("nav, main, .page-nav, .page-content") ||
      document.body;
    return linkContainer;
  }

  // Create observer with cleanup capability
  function createObserver() {
    return new MutationObserver((mutations) => {
      // Only process if links might have been added
      let shouldUpdate = false;
      for (const mutation of mutations) {
        if (mutation.addedNodes.length > 0) {
          // Check if any added node is or contains a link
          for (const node of mutation.addedNodes) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              if (node.tagName === "A" || node.querySelector("a")) {
                shouldUpdate = true;
                break;
              }
            }
          }
          if (shouldUpdate) break;
        }
      }

      if (shouldUpdate) {
        clearTimeout(preserveLangTimeout);
        preserveLangTimeout = setTimeout(() => {
          preserveLangInLinks();
        }, MUTATION_DEBOUNCE_MS);
      }
    });
  }

  // Only observe if DOM is ready, and use more targeted container
  function startObserving() {
    if (observer) {
      observer.disconnect();
    }
    observer = createObserver();
    const container = getLinkContainer();
    observer.observe(container, {
      childList: true,
      subtree: true,
    });
  }

  if (document.body) {
    startObserving();
  } else {
    document.addEventListener("DOMContentLoaded", startObserving);
  }

  // Expose cleanup function for testing or manual cleanup
  window.disconnectLangObserver = () => {
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    if (preserveLangTimeout) {
      clearTimeout(preserveLangTimeout);
    }
  };

  // Make updateTexts available globally
  window.updateTranslations = updateTexts;
})();
