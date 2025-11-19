/**
 * URL Manager - Handles dynamic URL population from configuration
 * Extensible system for managing different URL types
 */

import { CONFIG } from './config.js';
import { SELECTORS, DATA_ATTRIBUTES } from './constants.js';

/**
 * URL resolvers map - easily extensible for new URL types
 */
const URL_RESOLVERS = {
  external: {
    petition: () => CONFIG.petition.url,
    instagram: () => CONFIG.contact.instagram.url,
    artworkWikipedia: () => CONFIG.assets.artworkWikipedia
  },
  contact: {
    email: () => `mailto:${CONFIG.contact.email}`,
    mailingList: () => `mailto:${CONFIG.contact.mailingList.email}`
  },
  resource: {
    pamphlet: (lang = 'en') => {
      const currentLang = lang || document.documentElement.lang || CONFIG.languages.default;
      return CONFIG.resources.pamphlet[currentLang] || CONFIG.resources.pamphlet[CONFIG.languages.default];
    }
  }
};

/**
 * Populates external URLs from configuration
 */
function populateExternalUrls() {
  document.querySelectorAll(SELECTORS.externalUrl).forEach(el => {
    const key = el.dataset.externalUrl;
    const resolver = URL_RESOLVERS.external[key];
    
    if (resolver) {
      const url = resolver();
      if (url) {
        el.href = url;
        el.removeAttribute(DATA_ATTRIBUTES.externalUrl);
      }
    } else {
      console.warn(`Unknown external URL key: ${key}`);
    }
  });
}

/**
 * Populates contact links (mailto:)
 */
function populateContactLinks() {
  document.querySelectorAll(SELECTORS.contact).forEach(el => {
    const key = el.dataset.contact;
    const resolver = URL_RESOLVERS.contact[key];
    
    if (resolver) {
      const url = resolver();
      if (url) {
        el.href = url;
        el.removeAttribute(DATA_ATTRIBUTES.contact);
      }
    } else {
      console.warn(`Unknown contact key: ${key}`);
    }
  });
}

/**
 * Populates resource links (language-aware)
 */
function populateResourceLinks() {
  const currentLang = document.documentElement.lang || CONFIG.languages.default;
  
  document.querySelectorAll(SELECTORS.resource).forEach(el => {
    const key = el.dataset.resource;
    const resolver = URL_RESOLVERS.resource[key];
    
    if (resolver) {
      const url = resolver(currentLang);
      if (url) {
        el.href = url;
        el.removeAttribute(DATA_ATTRIBUTES.resource);
      }
    } else {
      console.warn(`Unknown resource key: ${key}`);
    }
  });
}

/**
 * Populates all URLs from configuration
 */
export function populateUrls() {
  try {
    populateExternalUrls();
    populateContactLinks();
    populateResourceLinks();
  } catch (error) {
    console.error('Error populating URLs:', error);
  }
}

/**
 * Registers a new URL resolver for extensibility
 * @param {string} type - Type of URL (external, contact, resource)
 * @param {string} key - Key identifier
 * @param {Function} resolver - Function that returns the URL
 */
export function registerUrlResolver(type, key, resolver) {
  if (!URL_RESOLVERS[type]) {
    URL_RESOLVERS[type] = {};
  }
  URL_RESOLVERS[type][key] = resolver;
}

