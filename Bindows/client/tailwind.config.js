/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        win: {
          bg: '#0078d4',
          taskbar: '#202020',
          taskbarHover: '#2d2d2d',
          start: '#0078d4',
          window: '#ffffff',
          windowDark: '#1e1e1e',
          titleActive: '#0078d4',
          titleInactive: '#3a3a3a',
          border: '#2b2b2b',
          accent: '#0078d4',
          accentHover: '#106ebe',
          text: '#000000',
          textLight: '#ffffff',
          muted: '#605e5c',
          surface: '#f3f3f3',
          surfaceHover: '#e1e1e1',
          divider: '#e1e1e1',
        },
      },
      fontFamily: {
        win: ['Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      animation: {
        'window-open': 'windowOpen 0.15s ease-out',
        'start-open': 'startOpen 0.2s cubic-bezier(0.0,0,0.2,1)',
      },
      keyframes: {
        windowOpen: {
          '0%': { transform: 'scale(0.97)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        startOpen: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
