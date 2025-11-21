/**
 * Common JavaScript functions shared across all pages
 * Consolidates duplicate code for better maintainability
 */

// Constants
const MENU_ICON_OPEN = "✕";
const MENU_ICON_CLOSED = "☰";

// Cache DOM elements for better performance
let cachedNavLinks = null;
let cachedToggleBtn = null;
let cachedIcon = null;
let isMenuOpen = false;

/**
 * Gets and caches mobile menu DOM elements
 * @returns {Object|null} Object with navLinks, toggleBtn, icon or null
 */
function getMenuElements() {
  // Only query DOM if cache is invalid
  if (!cachedNavLinks || !document.contains(cachedNavLinks)) {
    cachedNavLinks = document.querySelector(".page-nav-links");
    cachedToggleBtn = document.querySelector(".mobile-menu-toggle");
    cachedIcon = cachedToggleBtn?.querySelector(".hamburger-icon");
  }

  if (!cachedNavLinks || !cachedToggleBtn) return null;

  return {
    navLinks: cachedNavLinks,
    toggleBtn: cachedToggleBtn,
    icon: cachedIcon,
  };
}

/**
 * Sets the mobile menu state (open or closed)
 * @param {boolean} isOpen - Whether the menu should be open
 */
function setMobileMenuState(isOpen) {
  const elements = getMenuElements();
  if (!elements) return;

  const { navLinks, toggleBtn, icon } = elements;
  isMenuOpen = isOpen;

  // Batch DOM updates
  navLinks.classList.toggle("active", isOpen);
  toggleBtn.setAttribute("aria-expanded", isOpen);

  if (icon) {
    icon.textContent = isOpen ? MENU_ICON_OPEN : MENU_ICON_CLOSED;
  }

  // Update body styles and classes (synchronous is fine for these operations)
  if (isOpen) {
    document.body.style.overflow = "hidden";
    document.body.classList.add("mobile-menu-open");
  } else {
    document.body.style.overflow = "";
    document.body.classList.remove("mobile-menu-open");
  }
}

/**
 * Toggles the mobile menu open/closed state
 */
function toggleMobileMenu() {
  const elements = getMenuElements();
  if (!elements) return;

  setMobileMenuState(!isMenuOpen);
}

/**
 * Closes the mobile menu
 */
function closeMobileMenu() {
  setMobileMenuState(false);
}

// Make functions globally available
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;

/**
 * Initialize mobile menu event listeners
 * Ensures DOM is ready before attaching listeners
 */
function initMobileMenuListeners() {
  // Close mobile menu on escape key (use capture phase for early handling)
  document.addEventListener(
    "keydown",
    function (e) {
      if (e.key === "Escape" && isMenuOpen) {
        closeMobileMenu();
      }
    },
    true,
  );

  // Close menu when clicking outside (use event delegation)
  document.addEventListener(
    "click",
    function (e) {
      // Early return if menu is closed
      if (!isMenuOpen) return;

      // Don't close if clicking the close button
      if (e.target.closest(".mobile-menu-close")) {
        return;
      }

      const menuContainer = e.target.closest(".page-nav-links");
      const toggleBtn = e.target.closest(".mobile-menu-toggle");

      // Close if clicking outside both menu and toggle button
      if (!menuContainer && !toggleBtn) {
        closeMobileMenu();
      }
    },
    true,
  );
}

// Initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initMobileMenuListeners);
} else {
  initMobileMenuListeners();
}
