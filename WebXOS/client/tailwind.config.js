/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        wx: {
          shelf: 'rgba(32,33,36,0.95)',
          surface: '#202124',
          surface2: '#292a2d',
          border: 'rgba(255,255,255,0.08)',
          text: '#e8eaed',
          muted: '#9aa0a6',
          accent: '#8ab4f8',
          accent2: '#c58af9',
          green: '#81c995',
          red: '#f28b82',
          yellow: '#fdd663',
        },
      },
      fontFamily: {
        sans: ['"Google Sans"', 'Roboto', 'system-ui', 'sans-serif'],
        mono: ['"Roboto Mono"', 'monospace'],
      },
      animation: {
        'scale-in': 'scaleIn 0.2s ease-out',
        'slide-up': 'slideUp 0.25s ease-out',
        'fade-in': 'fadeIn 0.15s ease-out',
      },
      keyframes: {
        scaleIn: { '0%': { transform: 'scale(0.95)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(8px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
      },
    },
  },
  plugins: [],
};
