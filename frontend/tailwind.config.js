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
        navy: {
          900: '#0B132B',
          800: '#1C2541',
          700: '#3A506B',
        },
        electric: {
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
        },
        purpleBrand: {
          500: '#8B5CF6',
          600: '#7C3AED',
          700: '#6D28D9',
        }
      }
    },
  },
  plugins: [],
}
