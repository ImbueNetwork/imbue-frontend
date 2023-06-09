/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        'grid-23': 'repeat(auto-fill, 23%)',
        'grid-31': 'repeat(auto-fill, 31%)',
        'grid-48': 'repeat(auto-fill, 48%)',
        'grid-none': 'none',
      },
      gap: {
        'gap-2-per': '2%',
      },

      colors: {
        'theme-grey-dark': '#2c2c2c',
        'theme-secondary': '#411dc9',
        'theme-coral': '#FC6760',
        'theme-black-text': '#0f0f0f',
        'secondary-dark-hover': '#121c7f',
        'light-white': 'rgba(255, 255, 255, 0.25)',
        'light-grey': 'rgba(235, 234, 226, 0.5)',
        'dark-black': '#1E1E1E',
        'imbue-purple': '#3B27C1',
        primary: '#b2ff0b',
      },
      screens: {
        'max-width-1800px': { raw: '(max-width: 1800px)' },
        'max-width-1100px': { raw: '(max-width: 1100px)' },
        'max-width-868px': { raw: '(max-width: 868px)' },
        'max-width-750px': { raw: '(max-width: 750px)' },
        'max-width-500px': { raw: '(max-width: 500px)' },
        'min-width-1280px': { raw: '(min-width: 1280px)' },
        'min-width-750px': { raw: '(min-width: 750px)' },
        'min-width-500px': { raw: '(min-width: 500px)' },
        'max-sm': { raw: '(max-width: 640px)' },
        'max-md': { raw: '(max-width: 768px)' },
        'max-lg': { raw: '(max-width: 1024px)' },
        'max-xl': { raw: '(max-width: 1280px)' },
      },
    },
  },

  plugins: [
    require('postcss-import'),
    require('tailwindcss/nesting')(require('postcss-nesting')),
    require('autoprefixer'),
    require('tailwindcss'),
  ],
};

//base-transition: all 200ms ease-in-out
