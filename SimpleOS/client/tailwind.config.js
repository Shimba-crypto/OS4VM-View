/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        xfce: {
          bg: '#2c2c2c',
          panel: '#3c3c3c',
          panelHover: '#4a4a4a',
          desktop: '#214283',
          window: '#f0f0f0',
          windowTitle: '#2c2c2c',
          windowBorder: '#999',
          text: '#222',
          textLight: '#666',
          textWhite: '#fff',
          accent: '#3b82f6',
          border: '#888',
          button: '#e0e0e0',
          buttonHover: '#ccc',
          active: '#2563eb',
          taskbar: '#3c3c3c',
          icon: '#fff',
        },
      },
    },
  },
  plugins: [],
};
