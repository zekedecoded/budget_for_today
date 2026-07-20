/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        pokemon: {
          blue: '#3B4CCA',
          'blue-dark': '#2A3E9E',
          red: '#FF1C1C',
          'red-dark': '#CC0000',
          yellow: '#FFDE00',
          'yellow-dark': '#D4B800',
          navy: '#0A1832',
          'navy-light': '#1A2D4A',
          gold: '#FFD700',
          cream: '#FFF8E7',
          white: '#FFFFFF',
          gray: '#B0B8C8',
        },
      },
      fontFamily: {
        display: ['Bungee', 'system-ui', 'sans-serif'],
        amount: ['Anton', 'system-ui', 'sans-serif'],
        body: ['Karla', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'float-slow': 'float 4s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'shine': 'shine 3s ease-in-out infinite',
        'sparkle': 'sparkle 1.5s ease-in-out infinite',
        'pokeball-spin': 'pokeballSpin 1s linear infinite',
        'charge-pulse': 'chargePulse 0.6s ease-in-out infinite',
        'reveal-pop': 'revealPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        'slide-up': 'slideUp 0.4s ease-out forwards',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'flash-bang': 'flashBang 0.3s ease-out forwards',
        'card-hover': 'cardHover 0.3s ease-out',
        'press': 'press 0.1s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(59,76,202,0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(59,76,202,0.6)' },
        },
        shine: {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
        sparkle: {
          '0%, 100%': { opacity: '0', transform: 'scale(0) rotate(0deg)' },
          '50%': { opacity: '1', transform: 'scale(1) rotate(180deg)' },
        },
        pokeballSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        chargePulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.5' },
          '50%': { transform: 'scale(1.05)', opacity: '1' },
        },
        revealPop: {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '60%': { transform: 'scale(1.15)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(12px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        flashBang: {
          '0%': { opacity: '0', transform: 'scale(0.5)' },
          '30%': { opacity: '1', transform: 'scale(1.2)' },
          '100%': { opacity: '0', transform: 'scale(2)' },
        },
        cardHover: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(-4px)' },
        },
        press: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(2px)' },
        },
      },
    },
  },
  plugins: [],
}
