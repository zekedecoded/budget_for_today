/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#111D13',
          deep: '#0B150D',
          light: '#1A2B1C',
          mid: '#243526',
        },
        panel: {
          DEFAULT: '#2A3528',
          dark: '#222B20',
          light: '#344232',
          bg: '#2F3D2D',
        },
        pixel: {
          border: '#0A1A0E',
          'border-light': '#2D4A30',
          highlight: '#3A5C3D',
        },
        amber: {
          DEFAULT: '#D4A843',
          light: '#E4C06A',
          dim: '#A6832F',
        },
        overspend: {
          DEFAULT: '#C45B4A',
          light: '#D97A6B',
          dim: '#8E3E32',
        },
        moss: {
          DEFAULT: '#5B8C5A',
          light: '#7AB879',
          dim: '#3D6B3C',
        },
        cream: {
          DEFAULT: '#E8DCC8',
          muted: 'rgba(232, 220, 200, 0.6)',
          faint: 'rgba(232, 220, 200, 0.3)',
          dark: '#1A2B1C',
        },
        xp: {
          track: '#0A1A0E',
          fill: '#D4A843',
          glow: '#E4C06A',
          tick: '#2D4A30',
        },
      },
      fontFamily: {
        pixel: ['VT323', 'monospace'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'pixel-xs': ['12px', { lineHeight: '16px' }],
        'pixel-sm': ['14px', { lineHeight: '18px' }],
        'pixel-base': ['16px', { lineHeight: '20px' }],
        'pixel-lg': ['20px', { lineHeight: '24px' }],
        'pixel-xl': ['24px', { lineHeight: '28px' }],
        'pixel-2xl': ['32px', { lineHeight: '36px' }],
        'pixel-3xl': ['40px', { lineHeight: '44px' }],
        'pixel-4xl': ['48px', { lineHeight: '52px' }],
      },
      keyframes: {
        'pixel-sparkle': {
          '0%, 100%': { opacity: '0', transform: 'scale(0)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
        'xp-fill': {
          '0%': { width: '0%' },
          '100%': { width: 'var(--xp-width)' },
        },
        'coin-flip': {
          '0%': { transform: 'rotateY(0deg) scale(1)' },
          '50%': { transform: 'rotateY(90deg) scale(0.8)' },
          '100%': { transform: 'rotateY(0deg) scale(1)' },
        },
        'level-up': {
          '0%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(212, 168, 67, 0)' },
          '50%': { transform: 'scale(1.05)', boxShadow: '0 0 12px 4px rgba(212, 168, 67, 0.4)' },
          '100%': { transform: 'scale(1)', boxShadow: '0 0 0 0 rgba(212, 168, 67, 0)' },
        },
        'tally-pop': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '60%': { transform: 'scale(1.15)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'line-print': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'pixel-sparkle': 'pixel-sparkle 0.6s ease-out both',
        'xp-fill': 'xp-fill 0.8s ease-out both',
        'coin-flip': 'coin-flip 0.4s ease-out',
        'level-up': 'level-up 0.6s ease-out',
        'tally-pop': 'tally-pop 0.3s ease-out both',
        'line-print': 'line-print 0.25s ease-out both',
        'fade-in-up': 'fade-in-up 0.3s ease-out both',
        'slide-in': 'slide-in 0.2s ease-out both',
      },
      boxShadow: {
        'pixel': '2px 2px 0 #0A1A0E',
        'pixel-sm': '1px 1px 0 #0A1A0E',
        'pixel-inset': 'inset 2px 2px 0 rgba(0,0,0,0.15)',
        'pixel-glow': '0 0 8px rgba(212, 168, 67, 0.3)',
      },
    },
  },
  plugins: [],
}
