/**
 * Constants for DOM selectors, event names, and data attributes
 * Centralizes all string literals to prevent typos and improve maintainability
 */

export const SELECTORS = {
  // Pages
  page: '.page',
  activePage: '.page.active',
  landingPage: '#landing',
  
  // Navigation
  pageLink: '[data-page]',
  navLinks: '.nav-links',
  pageNavLinks: '.page-nav-links',
  
  // Artwork info
  artworkInfo: '#artworkInfo',
  artworkInfoBtn: '.artwork-info-btn',
  artworkCloseBtn: '.close-btn',
  
  // Hero
  heroBg: '#heroBg',
  hero: '.hero',
  
  // Content
  mainContent: 'main, [role="main"], .content-section',
  
  // Language
  langSwitcher: '.lang-switcher',
  
  // URL data attributes
  externalUrl: '[data-external-url]',
  contact: '[data-contact]',
  resource: '[data-resource]'
};

export const DATA_ATTRIBUTES = {
  page: 'data-page',
  externalUrl: 'data-external-url',
  contact: 'data-contact',
  resource: 'data-resource'
};

export const EVENTS = {
  pageChanged: 'pageChanged',
  languageChanged: 'languageChanged',
  click: 'click',
  keydown: 'keydown',
  hashchange: 'hashchange',
  resize: 'resize',
  scroll: 'scroll'
};

export const KEYS = {
  escape: 'Escape'
};

export const CSS_CLASSES = {
  active: 'active',
  page: 'page',
  landing: 'landing'
};

export const ARIA = {
  hidden: 'aria-hidden',
  pressed: 'aria-pressed'
};

