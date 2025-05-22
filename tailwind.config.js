// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
    "./public/templates/**/*.html"
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
  future: {
    removeDeprecatedGapUtilities: true,
    purgeLayersByDefault: true,
  },
  variants: {
    extend: {
      opacity: ['group-hover'],
      scale: ['group-hover'],
      transform: ['group-hover'],
    }
  },
  plugins: [],
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: [
      './src/**/*.{js,jsx,ts,tsx}',
      './public/index.html',
      './public/templates/**/*.html'
    ],
    options: {
      safelist: [
        /^w-/,
        /^h-/,
        /^bg-/,
        /^text-/,
        /^grid-cols-/,
        'lazy',
        'loaded',
        'animate-fade-in',
        'animate-slide-up'
      ],
    },
  }
}
