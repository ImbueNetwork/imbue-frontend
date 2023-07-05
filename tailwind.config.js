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
        primary: '#b2ff0b',
        'theme-grey-dark': '#2c2c2c',
        'theme-secondary': '#411dc9',
        'theme-black-text': '#0f0f0f',
        'secondary-dark-hover': '#121c7f',
        'light-white': 'rgba(255, 255, 255, 0.25)',
        'light-grey': '#EBEAE2',
        'dark-black': '#1E1E1E',
        'grey-background': '#EBEAE2',
        'imbue-purple': '#3B27C1',
        'imbue-purple-dark': 'var(--imbue-purple-dark, #03116A)',
        'imbue-light-purple': '#E1DDFF',
        'imbue-light-purple-two': '#9880F2',
        'imbue-light-purple-three': '#F6F5FF',
        'imbue-coral': '#FC6760',
        'imbue-foundation-blue': '#00234C',
        'imbue-lemon': '#7AA822',
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
      fontFamily: {
        Aeonik: 'Aeonik',
        src: 'url(../fonts/Aeonik-Regular.otf) format("opentype")',
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
