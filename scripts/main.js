/**
 * Main entry point for Tiohtià:ke Strike website
 * Initializes all modules and sets up event listeners
 */

import { CONFIG } from './config.js';
import { SELECTORS, EVENTS } from './constants.js';
import { setupNavigation } from './navigation.js';
import { populateUrls } from './url-manager.js';
import { initParallax, cleanupEffects } from './effects.js';

/**
 * Clears unwanted hash from URL
 */
function clearMainContentHash() {
  if (window.location.hash === '#main-content') {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
}

/**
 * Initializes the application
 */
function init() {
  try {
    // Clear hash on load
    clearMainContentHash();
    
    // Listen for hash changes
    window.addEventListener(EVENTS.hashchange, clearMainContentHash);
    
    // Setup navigation
    setupNavigation();
    
    // Populate URLs from config
    populateUrls();
    
    // Initialize parallax effects
    initParallax();
    
    // Re-populate URLs when language changes
    document.addEventListener(EVENTS.languageChanged, populateUrls);
    
  } catch (error) {
    console.error('Error initializing application:', error);
    // Graceful degradation - ensure basic functionality still works
  }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  cleanupEffects();
});

// Initialize when DOM is ready (ES modules are deferred)
init();

