/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'gym-green': {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
      },
      boxShadow: {
        'gym-green': '0 10px 15px -3px rgb(34 197 94 / 0.2)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      gridTemplateColumns: {
        '24': 'repeat(24, minmax(0, 1fr))',
      }
    },
  },

  plugins: [],
}
