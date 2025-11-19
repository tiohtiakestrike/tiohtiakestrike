/**
 * Configuration file for Tiohtià:ke Strike website
 * Centralizes all URLs, paths, and configuration values
 */

export const CONFIG = {
  // Contact information
  contact: {
    email: 'TIOHTIAKESTRIKE@PROTON.ME',
    instagram: {
      url: 'https://instagram.com/tiohtiake.strike',
      handle: '@TIOHTIAKESTRIKE.STRIKE'
    },
    mailingList: {
      email: 'tiohtiakestrike-subscribe@lists.riseup.net',
      instructions: 'Send an email to tiohtiakestrike-subscribe@lists.riseup.net to subscribe.'
    }
  },

  // Resource files
  resources: {
    pamphlet: {
      en: '/resources/TIOHTIAKE STRIKE.pdf',
      fr: '/resources/GRÈVE TIOHTIAKE.pdf'
    }
  },

  // Petition form
  petition: {
    url: 'https://cryptpad.fr/form/#/2/form/view/X8D3gsHhnBnWw0pgldRGxipkdX0l7YOxJqQfTihOhnE/'
  },

  // Language configuration
  languages: {
    path: 'lang',
    default: 'en',
    supported: ['en', 'fr']
  },

  // Navigation pages
  pages: [
    { id: 'landing', labelKey: 'title' },
    { id: 'about', labelKey: 'about' },
    { id: 'petition', labelKey: 'petition' },
    { id: 'signal', labelKey: 'signal' },
    { id: 'resources', labelKey: 'resources' }
  ],

  // Asset paths
  assets: {
    heroImage: {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Paul_Signac_-_In_the_Time_of_Harmony.jpg/2560px-Paul_Signac_-_In_the_Time_of_Harmony.jpg',
      local: '/assets/In the time of Harmony.png'
    },
    artworkWikipedia: 'https://en.wikipedia.org/wiki/In_the_Time_of_Harmony'
  },

  // Animation settings
  animation: {
    parallaxSpeed: 0.5,
    transitionDuration: 0.3,
    mobileBreakpoint: 768
  }
};

