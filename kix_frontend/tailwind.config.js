/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'brand-black': '#050505',
        'brand-gray': '#111111',
        'brand-white': '#f8f8f4',
        'brand-accent': '#c6ff3f',
      },
    },
  },
  plugins: [],
}

