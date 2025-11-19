/**
 * Visual Effects Module
 * Handles parallax, scroll effects, and other visual enhancements
 */

import { CONFIG } from './config.js';
import { SELECTORS } from './constants.js';

let parallaxCleanup = null;
let resizeTimeout = null;

/**
 * Throttle function for performance
 */
function throttle(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Sets up mobile parallax effect (horizontal scroll)
 */
function setupMobileParallax(heroBg) {
  const handleScroll = throttle(() => {
    const landingPage = document.querySelector(SELECTORS.landingPage);
    if (landingPage?.classList.contains(SELECTORS.activePage.replace('.', ''))) {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercentage = Math.min(scrollY / maxScroll, 1);
      const bgPosition = scrollPercentage * 100;
      heroBg.style.backgroundPosition = `${bgPosition}% center`;
    }
  }, 16); // ~60fps

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}

/**
 * Sets up desktop parallax effect (vertical movement)
 */
function setupDesktopParallax(heroBg) {
  const handleScroll = throttle(() => {
    const landingPage = document.querySelector(SELECTORS.landingPage);
    if (landingPage?.classList.contains('active')) {
      const scrollY = window.scrollY;
      heroBg.style.transform = `translateY(${scrollY * CONFIG.animation.parallaxSpeed}px)`;
    }
  }, 16); // ~60fps

  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}

/**
 * Initializes parallax effects
 */
export function initParallax() {
  const heroBg = document.querySelector(SELECTORS.heroBg);
  if (!heroBg) return;

  // Clean up existing parallax
  if (parallaxCleanup) {
    parallaxCleanup();
  }

  const isMobile = window.innerWidth <= CONFIG.animation.mobileBreakpoint;
  
  if (isMobile) {
    parallaxCleanup = setupMobileParallax(heroBg);
  } else {
    parallaxCleanup = setupDesktopParallax(heroBg);
  }

  // Handle window resize
  const handleResize = throttle(() => {
    if (parallaxCleanup) {
      parallaxCleanup();
    }
    initParallax(); // Reinitialize with new breakpoint
  }, 250);

  window.addEventListener('resize', handleResize);
  
  return () => {
    if (parallaxCleanup) parallaxCleanup();
    window.removeEventListener('resize', handleResize);
  };
}

/**
 * Cleans up all effects
 */
export function cleanupEffects() {
  if (parallaxCleanup) {
    parallaxCleanup();
    parallaxCleanup = null;
  }
  if (resizeTimeout) {
    clearTimeout(resizeTimeout);
    resizeTimeout = null;
  }
}

