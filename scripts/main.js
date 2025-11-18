/**
 * Main entry point for Tiohtià:ke Strike website
 * Initializes all modules and sets up event listeners
 */

import { CONFIG } from './config.js';
import { setupNavigation } from './navigation.js';

/**
 * Populates URLs from configuration
 */
function populateUrls() {
  // Populate external URLs
  document.querySelectorAll('[data-external-url]').forEach(el => {
    const key = el.dataset.externalUrl;
    let url;
    
    if (key === 'petition') {
      url = CONFIG.petition.url;
    } else if (key === 'instagram') {
      url = CONFIG.contact.instagram.url;
    } else if (key === 'artworkWikipedia') {
      url = CONFIG.assets.artworkWikipedia;
    }
    
    if (url) {
      el.href = url;
      // Remove the data attribute after setting href
      el.removeAttribute('data-external-url');
    }
  });
  
  // Populate contact links
  document.querySelectorAll('[data-contact]').forEach(el => {
    const key = el.dataset.contact;
    let url;
    
    if (key === 'email') {
      url = `mailto:${CONFIG.contact.email}`;
    } else if (key === 'mailingList') {
      url = `mailto:${CONFIG.contact.mailingList.email}`;
    }
    
    if (url) {
      el.href = url;
      // Remove the data attribute after setting href
      el.removeAttribute('data-contact');
    }
  });
  
  // Populate resource links (language-aware)
  document.querySelectorAll('[data-resource]').forEach(el => {
    const key = el.dataset.resource;
    const currentLang = document.documentElement.lang || 'en';
    
    if (key === 'pamphlet' && CONFIG.resources.pamphlet[currentLang]) {
      el.href = CONFIG.resources.pamphlet[currentLang];
      // Remove the data attribute after setting href
      el.removeAttribute('data-resource');
    }
  });
  
  // Re-populate URLs when language changes
  document.addEventListener('languageChanged', () => {
    populateUrls();
  });
}

// Clear any #main-content hash on page load
if (window.location.hash === '#main-content') {
  history.replaceState(null, '', window.location.pathname + window.location.search);
}

// Listen for hash changes and clear #main-content if it appears
window.addEventListener('hashchange', function() {
  if (window.location.hash === '#main-content') {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
});

// Setup navigation and populate URLs
// ES modules are deferred, so DOM should be ready
try {
  setupNavigation();
  populateUrls();
} catch (error) {
  console.error('Error initializing navigation:', error);
  // Fallback: ensure showPage is available globally
  if (typeof window.showPage === 'function') {
    // Navigation should still work via window.showPage
  }
}

// Mobile parallax scroll effect for painting
const heroBg = document.getElementById('heroBg');
const isMobile = window.innerWidth <= CONFIG.animation.mobileBreakpoint;

if (heroBg) {
  if (isMobile) {
    window.addEventListener('scroll', () => {
      if (document.getElementById('landing')?.classList.contains('active')) {
        const scrollY = window.scrollY;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercentage = scrollY / maxScroll;
        
        // Move background from left (0%) to right (100%) as user scrolls
        const bgPosition = scrollPercentage * 100;
        heroBg.style.backgroundPosition = `${bgPosition}% center`;
      }
    });
  } else {
    // Desktop parallax effect
    window.addEventListener('scroll', () => {
      if (document.getElementById('landing')?.classList.contains('active')) {
        const scrollY = window.scrollY;
        heroBg.style.transform = `translateY(${scrollY * CONFIG.animation.parallaxSpeed}px)`;
      }
    });
  }
}

// Handle window resize for parallax
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // Re-check if mobile/desktop and adjust parallax accordingly
    // This is handled by the scroll listeners above
  }, 250);
});

