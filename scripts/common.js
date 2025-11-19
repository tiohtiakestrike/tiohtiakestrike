/**
 * Common JavaScript functions shared across all pages
 * Consolidates duplicate code for better maintainability
 */

// Mobile menu functions
function toggleMobileMenu() {
    const navLinks = document.querySelector('.page-nav-links');
    const toggleBtn = document.querySelector('.mobile-menu-toggle');
    const icon = toggleBtn ? toggleBtn.querySelector('.hamburger-icon') : null;
    
    if (navLinks && toggleBtn) {
        const isActive = navLinks.classList.toggle('active');
        toggleBtn.setAttribute('aria-expanded', isActive);
        
        if (icon) {
            icon.textContent = isActive ? '✕' : '☰';
        }
        
        document.body.style.overflow = isActive ? 'hidden' : '';
    }
}

function closeMobileMenu() {
    const navLinks = document.querySelector('.page-nav-links');
    const toggleBtn = document.querySelector('.mobile-menu-toggle');
    const icon = toggleBtn ? toggleBtn.querySelector('.hamburger-icon') : null;
    
    if (navLinks && toggleBtn) {
        navLinks.classList.remove('active');
        toggleBtn.setAttribute('aria-expanded', 'false');
        
        if (icon) {
            icon.textContent = '☰';
        }
        
        document.body.style.overflow = '';
    }
}

// Make functions globally available
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;

// Close mobile menu on escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeMobileMenu();
    }
});

// Close menu when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.closest('.mobile-menu-close')) {
        return;
    }
    
    const menuContainer = e.target.closest('.page-nav-links');
    const toggleBtn = e.target.closest('.mobile-menu-toggle');
    
    if (!menuContainer && !toggleBtn) {
        const activeMenu = document.querySelector('.page-nav-links.active');
        if (activeMenu) {
            closeMobileMenu();
        }
    }
}, true);

// Preserve language in navigation links
function addLangToLinks() {
    const currentLang = new URLSearchParams(window.location.search).get('lang') || 
                       localStorage.getItem('lang') || 
                       document.documentElement.lang;
    if (currentLang && (currentLang === 'en' || currentLang === 'fr')) {
        document.querySelectorAll('a[href^="/"], a[href^="./"]').forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.includes('lang=') && !href.startsWith('http') && 
                !href.startsWith('mailto:') && !href.startsWith('#') && 
                (href.endsWith('.html') || href === '/' || href.match(/^\/\w+$/))) {
                const separator = href.includes('?') ? '&' : '?';
                link.setAttribute('href', href + separator + 'lang=' + currentLang);
            }
        });
    }
}

// Initialize language link preservation
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addLangToLinks);
} else {
    addLangToLinks();
}

