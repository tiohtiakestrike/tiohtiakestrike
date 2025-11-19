/**
 * Navigation module for Tiohtià:ke Strike website
 * Handles page navigation and reusable navigation components
 */

import { CONFIG } from './config.js';
import { SELECTORS, EVENTS, KEYS, CSS_CLASSES, ARIA, DATA_ATTRIBUTES } from './constants.js';

/**
 * Creates navigation HTML for a given page
 * @param {string} currentPageId - ID of the current page
 * @param {boolean} isLanding - Whether this is the landing page
 * @returns {string} HTML string for navigation
 */
export function createNavigation(currentPageId = 'landing', isLanding = false) {
  const navLinks = CONFIG.pages
    .filter(page => page.id !== 'landing') // Landing page doesn't show nav links
    .map(page => {
      const isActive = page.id === currentPageId;
      return `
        <a href="#" 
           data-page="${page.id}" 
           data-i18n="${page.labelKey}" 
           aria-label="Go to ${page.labelKey} page"
           ${isActive ? 'aria-current="page"' : ''}
           ${isActive ? 'class="active"' : ''}>
          ${page.labelKey}
        </a>
      `;
    })
    .join('');

  const logoClass = isLanding ? 'logo logo-no-pointer' : 'logo';
  const logoOnClick = isLanding ? '' : 'data-page="landing"';

  return `
    <nav class="page-nav" role="navigation" aria-label="Main navigation">
      <a href="#" 
         ${logoOnClick}
         class="${logoClass}" 
         data-i18n="title" 
         aria-label="Tiohtià:ke Strike - Home">
        Tiohtià:ke Strike
      </a>
      ${!isLanding ? `<div class="page-nav-links">${navLinks}</div>` : ''}
      <div class="lang-switcher-container">
        <button class="lang-switcher" aria-label="Switch language" aria-pressed="false">FR</button>
      </div>
    </nav>
  `;
}

/**
 * Shows a specific page with animation
 * @param {string} pageId - ID of the page to show
 */
export function showPage(pageId) {
  const currentPage = document.querySelector(SELECTORS.activePage);
  const targetPage = document.getElementById(pageId);
  
  if (!targetPage || currentPage === targetPage) return;
  
  try {
    // Use GSAP animation if available
    if (window.gsapAnimations?.animatePageTransition) {
      window.gsapAnimations.animatePageTransition(pageId);
    } else {
      // Fallback to simple show/hide
      document.querySelectorAll(SELECTORS.page).forEach(page => {
        page.classList.remove(CSS_CLASSES.active);
      });
      targetPage.classList.add(CSS_CLASSES.active);
    }
    
    window.scrollTo(0, 0);
    
    // Clear any hash from URL when navigating
    if (window.location.hash) {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    
    // Hide artwork info when navigating away from landing page
    if (pageId !== 'landing') {
      const artworkInfo = document.querySelector(SELECTORS.artworkInfo);
      if (artworkInfo) {
        artworkInfo.classList.remove(CSS_CLASSES.active);
        artworkInfo.setAttribute(ARIA.hidden, 'true');
      }
    }
    
    // Focus management for screen readers
    const mainContent = targetPage?.querySelector(SELECTORS.mainContent);
    if (mainContent) {
      mainContent.setAttribute('tabindex', '-1');
      mainContent.focus();
      setTimeout(() => mainContent.removeAttribute('tabindex'), 100);
    }
    
    // Dispatch event for animations to refresh
    window.dispatchEvent(new CustomEvent(EVENTS.pageChanged, { detail: { pageId } }));
  } catch (error) {
    console.error('Error showing page:', error);
    // Fallback: just show the page
    document.querySelectorAll(SELECTORS.page).forEach(page => {
      page.classList.remove(CSS_CLASSES.active);
    });
    targetPage.classList.add(CSS_CLASSES.active);
  }
}

/**
 * Toggles the artwork info panel
 */
export function toggleArtworkInfo() {
  const artworkInfo = document.querySelector(SELECTORS.artworkInfo);
  if (!artworkInfo) return;
  
  try {
    const isActive = artworkInfo.classList.toggle(CSS_CLASSES.active);
    artworkInfo.setAttribute(ARIA.hidden, !isActive);
    
    // Animate with GSAP if available
    if (window.gsapAnimations?.animateArtworkPanel) {
      window.gsapAnimations.animateArtworkPanel(isActive);
    }
    
    if (isActive) {
      // Focus the close button when opening
      const closeBtn = artworkInfo.querySelector(SELECTORS.artworkCloseBtn);
      closeBtn?.focus();
    }
  } catch (error) {
    console.error('Error toggling artwork info:', error);
  }
}

/**
 * Sets up event delegation for navigation
 */
export function setupNavigation() {
  // Handle page navigation clicks
  document.addEventListener(EVENTS.click, (e) => {
    const pageLink = e.target.closest(SELECTORS.pageLink);
    
    if (pageLink) {
      e.preventDefault();
      e.stopPropagation();
      const pageId = pageLink.getAttribute(DATA_ATTRIBUTES.page);
      if (pageId) {
        showPage(pageId);
      }
    }
  });

  // Handle artwork info toggle
  document.addEventListener(EVENTS.click, (e) => {
    if (e.target.matches(SELECTORS.artworkInfoBtn) || e.target.closest(SELECTORS.artworkInfoBtn)) {
      e.preventDefault();
      toggleArtworkInfo();
    }
    if (e.target.matches(SELECTORS.artworkCloseBtn) || e.target.closest(SELECTORS.artworkCloseBtn)) {
      e.preventDefault();
      toggleArtworkInfo();
    }
  });

  // Close artwork info panel with ESC key
  document.addEventListener(EVENTS.keydown, (e) => {
    if (e.key === KEYS.escape) {
      const artworkInfo = document.querySelector(SELECTORS.artworkInfo);
      if (artworkInfo?.classList.contains(CSS_CLASSES.active)) {
        artworkInfo.classList.remove(CSS_CLASSES.active);
        artworkInfo.setAttribute(ARIA.hidden, 'true');
        // Return focus to the info button
        document.querySelector(SELECTORS.artworkInfoBtn)?.focus();
      }
    }
  });
}

// Export for global access if needed
window.showPage = showPage;
window.toggleArtworkInfo = toggleArtworkInfo;

