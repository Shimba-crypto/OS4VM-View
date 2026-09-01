/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        au: {
          bg: '#070f14',
          surface: '#0f1e2a',
          surface2: '#111f2f',
          panel: 'rgba(15,30,42,0.85)',
          border: '#1e3347',
          borderHover: '#284a68',
          accent: '#22d3ee',
          accentHover: '#06b6d4',
          accentMuted: 'rgba(34,211,238,0.15)',
          text: '#e2eef6',
          muted: '#6b8ca3',
          muted2: '#425a6e',
          success: '#34d399',
          warning: '#fbbf24',
          danger: '#f87171',
        },
      },
      fontFamily: { mono: ['JetBrains Mono','ui-monospace','monospace'], sans: ['Inter','system-ui','sans-serif'] },
      animation: {
        'window-open': 'winOpen 0.16s ease-out',
        'agent-in': 'agentIn 0.22s cubic-bezier(0,0,0.2,1)',
        pulse: 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        winOpen: { '0%': { opacity: '0', transform: 'scale(0.98)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
        agentIn: { '0%': { opacity: '0', transform: 'translateY(8px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
