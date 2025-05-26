// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
    "./public/templates/**/*.html"
  ],
  safelist: [
    {
      pattern: /^w-/,
      variants: ['hover', 'focus']
    },
    {
      pattern: /^h-/,
      variants: ['hover', 'focus']
    },
    {
      pattern: /^bg-/,
      variants: ['hover', 'focus']
    },
    {
      pattern: /^text-/,
      variants: ['hover', 'focus']
    },
    {
      pattern: /^grid-cols-/,
      variants: ['hover', 'focus']
    }
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    },
  },
  variants: {
    extend: {
      opacity: ['group-hover'],
      scale: ['group-hover'],
      transform: ['group-hover'],
    }
  },  plugins: [],
  safelist: [
    // Pattern-based classes
    {
      pattern: /^w-/,
      variants: ['hover', 'focus']
    },
    {
      pattern: /^h-/,
      variants: ['hover', 'focus']
    },
    {
      pattern: /^bg-/,
      variants: ['hover', 'focus']
    },
    {
      pattern: /^text-/,
      variants: ['hover', 'focus']
    },
    {
      pattern: /^grid-cols-/,
      variants: ['hover', 'focus']
    },
    // Simple strings
    'lazy',
    'loaded',
    'animate-fade-in',
    'animate-slide-up'
  ]
}
