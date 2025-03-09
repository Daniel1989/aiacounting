/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: false, // Disable dark mode
  theme: {
    extend: {
      colors: {
        emerald: {
          100: '#d1fae5',
          200: '#a1e0cf',
          300: '#9acdbc',
          400: '#34d399',
          500: '#9ecdc1',
          600: '#059669',
          700: '#047857',
        },
      },
    },
  },
  plugins: [],
} 