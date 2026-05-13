/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef9ff',
          100: '#d8f1ff',
          200: '#b9e7ff',
          300: '#88d7ff',
          400: '#51bcff',
          500: '#299bfc',
          600: '#1279f1',
          700: '#0b60de',
          800: '#1050b4',
          900: '#13468e',
          950: '#102b57',
        },
        surface: {
          900: '#0d0f14',
          800: '#12151c',
          700: '#181c26',
          600: '#1e2333',
          500: '#252c3f',
          400: '#2e3650',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(16px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};