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
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a', // Deep Royal Blue
          950: '#0f172a',
        },
        skybrand: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0284c7', // Sky Blue
          600: '#0369a1',
          700: '#075985',
        },
        gold: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706', // Luxury Gold
          700: '#b45309',
          800: '#92400e',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'Manrope', 'Inter', 'sans-serif'],
        display: ['Cinzel', 'Poppins', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 10px 30px -5px rgba(0, 0, 0, 0.05)',
        'card': '0 4px 20px -2px rgba(15, 23, 42, 0.06)',
        'luxury': '0 20px 40px -15px rgba(30, 58, 138, 0.15)',
        'gold-glow': '0 0 20px rgba(245, 158, 11, 0.25)',
      },
    },
  },
  plugins: [],
}
