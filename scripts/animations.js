// GSAP Animations for Tiohtià:ke Strike Website
// Purpose: Enhance communication by guiding attention and creating natural reading flow

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

// Split text utility for character/word animations
function splitText(element) {
    if (!element) return null;
    // Check if already split
    if (element.querySelector('.word')) return element.querySelectorAll('.word');
    const text = element.textContent.trim();
    if (!text) return null;
    const words = text.split(/\s+/);
    element.innerHTML = words.map(word => `<span class="word-wrapper"><span class="word">${word}</span></span>`).join(' ');
    return element.querySelectorAll('.word');
}

// Check for reduced motion preference
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Set initial state for animated elements (only if motion is allowed)
if (!prefersReducedMotion) {
    gsap.set('.hero-content h1', { opacity: 0, y: 30 });
    gsap.set('.hero-content .subtitle', { opacity: 0, y: 30 });
    gsap.set('.nav-links a', { opacity: 0, y: 20 });
    gsap.set('.resource-card', { opacity: 0, y: 30 });
    gsap.set('.content-section h2', { opacity: 0, x: -30 });
    gsap.set('.content-section p', { opacity: 0, y: 20 });
    gsap.set('.content-section ul', { opacity: 0, y: 20 });
    gsap.set('.contact-item', { opacity: 0, scale: 0.9 });
    gsap.set('.petition-button', { opacity: 0, scale: 0.95 });
    gsap.set('.divider', { scaleX: 0 });
}

// Landing page hero animation - Creates welcoming first impression with storytelling
function animateLandingPage() {
    if (prefersReducedMotion) {
        // Just show everything immediately
        gsap.set('.hero-content h1, .hero-content .subtitle, .nav-links a', { opacity: 1, y: 0 });
        return;
    }
    
    const h1 = document.querySelector('.hero-content h1');
    const subtitle = document.querySelector('.hero-content .subtitle');
    
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    
    // Title appears with character-by-character reveal for dramatic effect
    if (h1) {
        const words = splitText(h1);
        if (words && words.length) {
            gsap.set(words, { opacity: 0, y: 30, rotationX: -90 });
            tl.to(words, {
                opacity: 1,
                y: 0,
                rotationX: 0,
                duration: 0.6,
                stagger: 0.05,
                ease: 'back.out(1.2)'
            });
        } else {
            tl.to(h1, {
                opacity: 1,
                y: 0,
                duration: 0.8
            });
        }
    }
    
    // Subtitle follows with word-by-word reveal
    if (subtitle) {
        const words = splitText(subtitle);
        if (words && words.length) {
            gsap.set(words, { opacity: 0, y: 20 });
            tl.to(words, {
                opacity: 1,
                y: 0,
                duration: 0.4,
                stagger: 0.03,
                ease: 'power2.out'
            }, '-=0.3');
        } else {
            tl.to(subtitle, {
                opacity: 1,
                y: 0,
                duration: 0.8
            }, '-=0.4');
        }
    }
    
    // Navigation appears last - guides to action with staggered reveal
    tl.to('.nav-links a', {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        stagger: {
            amount: 0.4,
            from: 'center'
        },
        ease: 'back.out(1.2)',
        onComplete: () => {
            // Subtle pulse on nav links to indicate interactivity
            gsap.to('.nav-links a', {
                y: -1,
                duration: 0.3,
                yoyo: true,
                repeat: 1,
                stagger: 0.05,
                ease: 'power1.inOut'
            });
        }
    }, '-=0.2');
}

// Animate content sections on page load - Creates natural reading flow with storytelling
function animateContentSection() {
    const contentSection = document.querySelector('.page.active .content-section');
    if (!contentSection) return;
    
    if (prefersReducedMotion) {
        gsap.set(contentSection.querySelectorAll('h2, p, ul, .resource-card, .contact-item, .petition-button, .divider'), 
            { opacity: 1, x: 0, y: 0, scale: 1, scaleX: 1 });
        return;
    }
    
    // Setup scroll-triggered animations for storytelling
    setupScrollReveals(contentSection);
    
    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
    
    // Heading appears first with dramatic reveal - establishes section topic
    const h2 = contentSection.querySelector('h2');
    if (h2) {
        tl.to(h2, {
            opacity: 1,
            x: 0,
            scale: 1,
            duration: 0.8,
            ease: 'back.out(1.2)'
        });
    }
    
    // Paragraphs follow in sequence with word reveals - guides reading
    const paragraphs = contentSection.querySelectorAll('p');
    if (paragraphs.length) {
        paragraphs.forEach((p, index) => {
            const words = splitText(p);
            if (words && words.length) {
                gsap.set(words, { opacity: 0, y: 15 });
                tl.to(words, {
                    opacity: 1,
                    y: 0,
                    duration: 0.3,
                    stagger: 0.02,
                    ease: 'power2.out'
                }, index === 0 ? '-=0.4' : '-=0.2');
            } else {
                tl.to(p, {
                    opacity: 1,
                    y: 0,
                    duration: 0.5
                }, index === 0 ? '-=0.4' : '-=0.2');
            }
        });
    }
    
    // Lists appear with staggered item reveals - each point tells part of the story
    const lists = contentSection.querySelectorAll('ul');
    if (lists.length) {
        lists.forEach(list => {
            const items = list.querySelectorAll('li');
            gsap.set(items, { opacity: 0, x: -20 });
            tl.to(items, {
                opacity: 1,
                x: 0,
                duration: 0.4,
                stagger: 0.1,
                ease: 'power2.out'
            }, '-=0.2');
        });
    }
    
    // Dividers expand to show section breaks with center-out animation
    const dividers = contentSection.querySelectorAll('.divider');
    if (dividers.length) {
        dividers.forEach(divider => {
            tl.to(divider, {
                scaleX: 1,
                duration: 0.8,
                ease: 'power2.out',
                onStart: () => {
                    // Animate the center dot
                    const dot = divider.querySelector('::after') || divider;
                    gsap.fromTo(divider, 
                        { '--dot-scale': 0 },
                        { '--dot-scale': 1, duration: 0.4, ease: 'back.out(2)' }
                    );
                }
            }, '-=0.2');
        });
    }
    
    // Resource cards appear - highlights available resources
    const cards = contentSection.querySelectorAll('.resource-card');
    if (cards.length) {
        tl.to(cards, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.15,
            ease: 'back.out(1.2)'
        }, '-=0.3');
    }
    
    // Petition button gets special attention - key call to action
    const petitionBtn = contentSection.querySelector('.petition-button');
    if (petitionBtn) {
        tl.to(petitionBtn, {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            ease: 'back.out(1.2)'
        }, '-=0.2')
        .to(petitionBtn, {
            scale: 1.02,
            duration: 0.3,
            yoyo: true,
            repeat: 1,
            ease: 'power1.inOut'
        }, '-=0.1');
    }
    
    // Contact items appear last - secondary actions
    const contactItems = contentSection.querySelectorAll('.contact-item');
    if (contactItems.length) {
        tl.to(contactItems, {
            opacity: 1,
            scale: 1,
            duration: 0.5,
            stagger: 0.1
        }, '-=0.2');
    }
}

// Setup scroll-triggered reveals for storytelling sections
function setupScrollReveals(contentSection) {
    if (!contentSection || prefersReducedMotion) return;
    
    // Animate headings with dramatic reveals as they come into view
    const headings = contentSection.querySelectorAll('h2');
    headings.forEach((heading, index) => {
        gsap.fromTo(heading,
            { opacity: 0, y: 60, scale: 0.9, rotationX: -15 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                rotationX: 0,
                duration: 1.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: heading,
                    start: 'top 75%',
                    end: 'top 50%',
                    toggleActions: 'play none none reverse',
                    markers: false
                }
            }
        );
    });
    
    // Animate paragraphs with word-by-word reveals on scroll
    const paragraphs = contentSection.querySelectorAll('p');
    paragraphs.forEach((p, pIndex) => {
        const words = splitText(p);
        if (words && words.length > 0) {
            gsap.set(words, { opacity: 0, y: 20 });
            ScrollTrigger.create({
                trigger: p,
                start: 'top 80%',
                onEnter: () => {
                    gsap.to(words, {
                        opacity: 1,
                        y: 0,
                        duration: 0.4,
                        stagger: 0.03,
                        ease: 'power2.out'
                    });
                }
            });
        }
    });
    
    // Animate list items with scroll trigger for dramatic reveals - each tells part of story
    const lists = contentSection.querySelectorAll('ul');
    lists.forEach(list => {
        const items = list.querySelectorAll('li');
        items.forEach((item, index) => {
            gsap.fromTo(item,
                { opacity: 0, x: -40, rotationY: 20, scale: 0.95 },
                {
                    opacity: 1,
                    x: 0,
                    rotationY: 0,
                    scale: 1,
                    duration: 0.7,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: item,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse',
                        markers: false
                    },
                    delay: index * 0.08
                }
            );
        });
    });
    
    // Animate dividers with center-out expansion
    const dividers = contentSection.querySelectorAll('.divider');
    dividers.forEach(divider => {
        ScrollTrigger.create({
            trigger: divider,
            start: 'top 80%',
            onEnter: () => {
                gsap.fromTo(divider,
                    { scaleX: 0, opacity: 0 },
                    { 
                        scaleX: 1, 
                        opacity: 1,
                        duration: 1,
                        ease: 'power2.out',
                        onComplete: () => {
                            divider.classList.add('revealed');
                        }
                    }
                );
            }
        });
    });
}

// Animate resource cards with scroll trigger - Reveals resources as user scrolls
function setupResourceCardAnimations() {
    if (prefersReducedMotion) return;
    
    gsap.utils.toArray('.resource-card').forEach((card, index) => {
        gsap.fromTo(card, 
            { opacity: 0, y: 40, scale: 0.95 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.8,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                    // Add slight delay for staggered effect
                    onEnter: () => {
                        gsap.to(card, {
                            scale: 1.02,
                            duration: 0.2,
                            yoyo: true,
                            repeat: 1,
                            ease: 'power1.inOut'
                        });
                    }
                }
            }
        );
    });
}

// Animate artwork info panel
function animateArtworkPanel(isOpening) {
    const panel = document.getElementById('artworkInfo');
    if (!panel) return;
    
    if (isOpening) {
        gsap.fromTo(panel, 
            { opacity: 0, scale: 0.9, y: 20 },
            { 
                opacity: 1, 
                scale: 1, 
                y: 0, 
                duration: 0.4, 
                ease: 'back.out(1.2)' 
            }
        );
    } else {
        gsap.to(panel, {
            opacity: 0,
            scale: 0.9,
            y: 20,
            duration: 0.3,
            ease: 'power2.in'
        });
    }
}

// Smooth page transitions - Creates sense of progression and continuity
function animatePageTransition(pageId) {
    const currentPage = document.querySelector('.page.active');
    const targetPage = document.getElementById(pageId);
    
    if (!currentPage || !targetPage || currentPage === targetPage) return;
    
    if (prefersReducedMotion) {
        currentPage.classList.remove('active');
        targetPage.classList.add('active');
        return;
    }
    
    // Hide current page with subtle fade
    gsap.to(currentPage, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: () => {
            currentPage.classList.remove('active');
            targetPage.classList.add('active');
            targetPage.style.opacity = '0';
            
            // Reset and animate new page content
            const h2 = targetPage.querySelector('.content-section h2');
            const paragraphs = targetPage.querySelectorAll('.content-section p');
            const lists = targetPage.querySelectorAll('.content-section ul');
            const cards = targetPage.querySelectorAll('.resource-card');
            const contactItems = targetPage.querySelectorAll('.contact-item');
            const petitionBtn = targetPage.querySelector('.petition-button');
            const dividers = targetPage.querySelectorAll('.divider');
            
            if (h2) gsap.set(h2, { opacity: 0, x: -30 });
            if (paragraphs.length) gsap.set(paragraphs, { opacity: 0, y: 20 });
            if (lists.length) gsap.set(lists, { opacity: 0, y: 20 });
            if (cards.length) gsap.set(cards, { opacity: 0, y: 30 });
            if (contactItems.length) gsap.set(contactItems, { opacity: 0, scale: 0.9 });
            if (petitionBtn) gsap.set(petitionBtn, { opacity: 0, scale: 0.95 });
            if (dividers.length) gsap.set(dividers, { scaleX: 0 });
            
            // Fade in new page
            gsap.to(targetPage, {
                opacity: 1,
                duration: 0.3,
                ease: 'power2.out',
                onComplete: () => {
                    // Animate content in reading order
                    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
                    
                    if (h2) {
                        tl.to(h2, { opacity: 1, x: 0, duration: 0.6 });
                    }
                    
                    if (paragraphs.length) {
                        tl.to(paragraphs, {
                            opacity: 1,
                            y: 0,
                            duration: 0.5,
                            stagger: 0.08
                        }, '-=0.3');
                    }
                    
                    if (lists.length) {
                        tl.to(lists, { opacity: 1, y: 0, duration: 0.5 }, '-=0.2');
                    }
                    
                    if (dividers.length) {
                        tl.to(dividers, {
                            scaleX: 1,
                            duration: 0.6,
                            ease: 'power2.out'
                        }, '-=0.2');
                    }
                    
                    if (cards.length) {
                        tl.to(cards, {
                            opacity: 1,
                            y: 0,
                            duration: 0.6,
                            stagger: 0.15
                        }, '-=0.3');
                    }
                    
                    if (petitionBtn) {
                        tl.to(petitionBtn, {
                            opacity: 1,
                            scale: 1,
                            duration: 0.5,
                            ease: 'back.out(1.2)'
                        }, '-=0.2');
                    }
                    
                    if (contactItems.length) {
                        tl.to(contactItems, {
                            opacity: 1,
                            scale: 1,
                            duration: 0.5,
                            stagger: 0.1
                        }, '-=0.2');
                    }
                }
            });
        }
    });
}

// Button hover animations - Provides clear feedback for interactivity
function setupButtonAnimations() {
    if (prefersReducedMotion) return;
    
    // Petition button - Most important CTA, gets prominent feedback
    const petitionBtn = document.querySelector('.petition-button');
    if (petitionBtn) {
        petitionBtn.addEventListener('mouseenter', () => {
            gsap.to(petitionBtn, {
                scale: 1.05,
                y: -2,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        petitionBtn.addEventListener('mouseleave', () => {
            gsap.to(petitionBtn, {
                scale: 1,
                y: 0,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
    }
    
    // Navigation links - Subtle lift indicates clickability
    document.querySelectorAll('.nav-links a, .page-nav-links a').forEach(link => {
        link.addEventListener('mouseenter', () => {
            gsap.to(link, {
                y: -2,
                duration: 0.2,
                ease: 'power2.out'
            });
        });
        
        link.addEventListener('mouseleave', () => {
            gsap.to(link, {
                y: 0,
                duration: 0.2,
                ease: 'power2.out'
            });
        });
    });
    
    // Contact items - Gentle scale indicates interactivity
    document.querySelectorAll('.contact-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            gsap.to(item, {
                scale: 1.05,
                duration: 0.2,
                ease: 'power2.out'
            });
        });
        
        item.addEventListener('mouseleave', () => {
            gsap.to(item, {
                scale: 1,
                duration: 0.2,
                ease: 'power2.out'
            });
        });
    });
    
    // Resource card links - Subtle feedback
    document.querySelectorAll('.resource-card a').forEach(link => {
        link.addEventListener('mouseenter', () => {
            gsap.to(link, {
                x: 3,
                duration: 0.2,
                ease: 'power2.out'
            });
        });
        
        link.addEventListener('mouseleave', () => {
            gsap.to(link, {
                x: 0,
                duration: 0.2,
                ease: 'power2.out'
            });
        });
    });
}

// Parallax effect for hero background (if on landing page)
function setupParallaxEffect() {
    const heroBg = document.getElementById('heroBg');
    if (!heroBg) return;
    
    gsap.to(heroBg, {
        yPercent: 30,
        ease: 'none',
        scrollTrigger: {
            trigger: '.hero',
            start: 'top top',
            end: 'bottom top',
            scrub: true
        }
    });
}

// Magnetic effect for interactive elements
function setupMagneticEffects() {
    if (prefersReducedMotion) return;
    
    document.querySelectorAll('.petition-button, .nav-links a, .resource-card').forEach(element => {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            gsap.to(element, {
                x: x * 0.1,
                y: y * 0.1,
                duration: 0.3,
                ease: 'power2.out'
            });
        });
        
        element.addEventListener('mouseleave', () => {
            gsap.to(element, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'power2.out'
            });
        });
    });
}

// Animate dividers with center-out effect
function animateDividers() {
    if (prefersReducedMotion) return;
    
    document.querySelectorAll('.divider').forEach(divider => {
        ScrollTrigger.create({
            trigger: divider,
            start: 'top 80%',
            onEnter: () => {
                gsap.fromTo(divider,
                    { scaleX: 0, opacity: 0 },
                    { 
                        scaleX: 1, 
                        opacity: 1,
                        duration: 0.8,
                        ease: 'power2.out',
                        onComplete: () => {
                            // Animate the center dot
                            gsap.to(divider, {
                                '--dot-opacity': 1,
                                duration: 0.4,
                                ease: 'back.out(2)'
                            });
                        }
                    }
                );
            }
        });
    });
}

// Initialize animations when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Set initial opacity for pages
    gsap.set('.page', { opacity: 1 });
    
    // Animate landing page on load
    if (document.getElementById('landing')?.classList.contains('active')) {
        animateLandingPage();
        if (!prefersReducedMotion) {
            setupParallaxEffect();
        }
    } else {
        // Animate current page
        setTimeout(animateContentSection, 100);
    }
    
    // Setup scroll-triggered animations (only if motion is allowed)
    if (!prefersReducedMotion) {
        setupResourceCardAnimations();
        setupMagneticEffects();
        animateDividers();
    }
    
    // Button animations always work (subtle feedback)
    setupButtonAnimations();
    
    // Add subtle attention to important elements after page load
    setTimeout(() => {
        if (!prefersReducedMotion) {
            // Gentle pulse on petition button to draw attention
            const petitionBtn = document.querySelector('.petition-button');
            if (petitionBtn && document.querySelector('.page.active')?.id === 'petition') {
                gsap.to(petitionBtn, {
                    boxShadow: '0 6px 20px rgba(184, 93, 58, 0.6)',
                    duration: 2,
                    yoyo: true,
                    repeat: 1,
                    ease: 'power1.inOut'
                });
            }
        }
    }, 2000);
    
    // Refresh ScrollTriggers when page changes
    window.addEventListener('pageChanged', () => {
        ScrollTrigger.refresh();
        setTimeout(() => {
            animateContentSection();
            if (!prefersReducedMotion) {
                setupScrollReveals(document.querySelector('.page.active .content-section'));
            }
        }, 100);
    });
});

// Export functions for use in other scripts
window.gsapAnimations = {
    animatePageTransition,
    animateArtworkPanel,
    animateContentSection
};

