/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: {
          950: '#0A0C10',
          900: '#0F1218',
          850: '#131720',
          800: '#171C26',
          700: '#1F2530',
          600: '#2A303C',
          500: '#3A4150',
        },
        ink: {
          100: '#F2F4F7',
          300: '#C4CAD6',
          500: '#8B93A3',
          600: '#6B7385',
        },
        signal: {
          amber: '#E0912F',
          amberDim: '#B87424',
          green: '#3FBE7C',
          blue: '#4C8FE0',
          red: '#E0555A',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        panel: '0 1px 0 rgba(255,255,255,0.03) inset, 0 8px 24px rgba(0,0,0,0.35)',
      },
    },
  },
  plugins: [],
}
