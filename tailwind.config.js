/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        kaki: {
          50: '#f5f6f3',
          100: '#eceee8',
          200: '#d9ddd1',
          300: '#bcc4ae',
          400: '#9ca68a',
          500: '#788267',
          600: '#626b53',
          700: '#4e5642',
          800: '#3d4434',
          900: '#2c3125',
        },
        marron: {
          50: '#f8f5f3',
          100: '#efe8e4',
          200: '#dfd1ca',
          300: '#c7aea3',
          400: '#a88a7c',
          500: '#5c4a3c',
          600: '#4f3f33',
          700: '#41342a',
          800: '#33291f',
          900: '#251e17',
        },
      },
    },
  },
  plugins: [],
};
