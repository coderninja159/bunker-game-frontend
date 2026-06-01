/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['Orbitron', 'Courier New', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        // Deep terminal bases
        terminal: {
          dark: '#030712', // tailwind gray-950
          darker: '#020617', // slate-950
          card: 'rgba(15, 23, 42, 0.45)', // glassy dark slate
        },
        // Location dynamic color ranges
        forest: {
          glow: '#10b981', // emerald
          moss: '#065f46',
          bg: '#022c22',
        },
        alien: {
          glow: '#d946ef', // fuchsia
          toxic: '#86198f',
          bg: '#1e1b4b',
        },
        bunker: {
          glow: '#f97316', // orange
          rust: '#9a3412',
          bg: '#1c1917',
        },
        water: {
          glow: '#06b6d4', // cyan
          deep: '#075985',
          bg: '#0f172a',
        },
        desert: {
          glow: '#eab308', // yellow
          dust: '#854d0e',
          bg: '#292524',
        }
      },
      animation: {
        'terminal-glow': 'terminal-glow 4s ease-in-out infinite alternate',
        'pulse-warning': 'pulse-warning 1.5s ease-in-out infinite',
        'cyber-scan': 'cyber-scan 6s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'glitch': 'glitch 1s linear infinite',
      },
      keyframes: {
        'terminal-glow': {
          '0%': { boxShadow: '0 0 15px rgba(16, 185, 129, 0.1) inset' },
          '100%': { boxShadow: '0 0 35px rgba(16, 185, 129, 0.25) inset' }
        },
        'pulse-warning': {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 25px rgba(239, 68, 68, 0.6)' },
          '50%': { opacity: '0.4', boxShadow: '0 0 5px rgba(239, 68, 68, 0.1)' }
        },
        'cyber-scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' }
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' }
        },
        'glitch': {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        }
      }
    },
  },
  plugins: [],
}
