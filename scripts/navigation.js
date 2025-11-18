/**
 * Navigation module for Tiohtià:ke Strike website
 * Handles page navigation and reusable navigation components
 */

import { CONFIG } from './config.js';
import { gsapAnimations } from './animations.js';

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
  const currentPage = document.querySelector('.page.active');
  const targetPage = document.getElementById(pageId);
  
  if (!targetPage || currentPage === targetPage) return;
  
  // Use GSAP animation if available
  if (window.gsapAnimations && window.gsapAnimations.animatePageTransition) {
    window.gsapAnimations.animatePageTransition(pageId);
  } else {
    // Fallback to simple show/hide
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });
    targetPage.classList.add('active');
  }
  
  window.scrollTo(0, 0);
  
  // Clear any hash from URL when navigating
  if (window.location.hash) {
    history.replaceState(null, '', window.location.pathname + window.location.search);
  }
  
  // Hide artwork info when navigating away from landing page
  if (pageId !== 'landing') {
    const artworkInfo = document.getElementById('artworkInfo');
    if (artworkInfo) {
      artworkInfo.classList.remove('active');
      artworkInfo.setAttribute('aria-hidden', 'true');
    }
  }
  
  // Focus management for screen readers - focus main content
  const mainContent = targetPage ? targetPage.querySelector('main, [role="main"], .content-section') : null;
  if (mainContent) {
    mainContent.setAttribute('tabindex', '-1');
    mainContent.focus();
    // Remove tabindex after focus to avoid tab order issues
    setTimeout(() => mainContent.removeAttribute('tabindex'), 100);
  }
  
  // Dispatch event for animations to refresh
  window.dispatchEvent(new CustomEvent('pageChanged', { detail: { pageId } }));
}

/**
 * Toggles the artwork info panel
 */
export function toggleArtworkInfo() {
  const artworkInfo = document.getElementById('artworkInfo');
  if (artworkInfo) {
    const isActive = artworkInfo.classList.toggle('active');
    artworkInfo.setAttribute('aria-hidden', !isActive);
    
    // Animate with GSAP if available
    if (window.gsapAnimations && window.gsapAnimations.animateArtworkPanel) {
      window.gsapAnimations.animateArtworkPanel(isActive);
    }
    
    if (isActive) {
      // Focus the close button when opening
      const closeBtn = artworkInfo.querySelector('.close-btn');
      if (closeBtn) {
        closeBtn.focus();
      }
    }
  }
}

/**
 * Sets up event delegation for navigation
 */
export function setupNavigation() {
  // Handle page navigation clicks
  document.addEventListener('click', (e) => {
    // Check if clicked element or its parent has data-page attribute
    const pageLink = e.target.closest('[data-page]');
    
    if (pageLink) {
      e.preventDefault();
      e.stopPropagation();
      const pageId = pageLink.getAttribute('data-page');
      if (pageId) {
        showPage(pageId);
      }
    }
  });

  // Handle artwork info toggle
  document.addEventListener('click', (e) => {
    if (e.target.matches('.artwork-info-btn') || e.target.closest('.artwork-info-btn')) {
      e.preventDefault();
      toggleArtworkInfo();
    }
    if (e.target.matches('.close-btn') || e.target.closest('.close-btn')) {
      e.preventDefault();
      toggleArtworkInfo();
    }
  });

  // Close artwork info panel with ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const artworkInfo = document.getElementById('artworkInfo');
      if (artworkInfo && artworkInfo.classList.contains('active')) {
        artworkInfo.classList.remove('active');
        artworkInfo.setAttribute('aria-hidden', 'true');
        // Return focus to the info button
        const infoBtn = document.querySelector('.artwork-info-btn');
        if (infoBtn) {
          infoBtn.focus();
        }
      }
    }
  });
}

// Export for global access if needed
window.showPage = showPage;
window.toggleArtworkInfo = toggleArtworkInfo;

