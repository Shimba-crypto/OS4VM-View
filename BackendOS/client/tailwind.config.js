/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        os: {
          bg: '#1e1e2e',
          surface: '#181825',
          surface2: '#11111b',
          overlay: 'rgba(0, 0, 0, 0.5)',
          primary: '#89b4fa',
          'primary-hover': '#b4d0fb',
          accent: '#f5c2e7',
          success: '#a6e3a1',
          danger: '#f38ba8',
          warning: '#fab387',
          text: '#cdd6f4',
          muted: '#6c7086',
          border: '#313244',
          dock: 'rgba(30, 30, 46, 0.8)',
          taskbar: 'rgba(24, 24, 37, 0.85)',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'bounce-dock': 'bounceDock 0.3s ease',
        'window-open': 'windowOpen 0.2s ease-out',
        'window-close': 'windowClose 0.15s ease-in',
      },
      keyframes: {
        bounceDock: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        windowOpen: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        windowClose: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
};
