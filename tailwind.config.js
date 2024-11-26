/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        inter: ['"Inter"', 'sans-serif']
      }
    }
  },
  daisyui: {
    themes: ['fantasy', 'dark']
  },
  darkMode: ['selector', '[data-theme="dark"]'],
  plugins: [require('@tailwindcss/typography'), require('daisyui')]
}
