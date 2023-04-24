/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns: {
        "grid-23": "repeat(auto-fill, 23%)",
        "grid-31": "repeat(auto-fill, 31%)",
        "grid-48": "repeat(auto-fill, 48%)",
        "grid-none": "none",
      },
      gap: {
        "gap-2-per": "2%",
      },

      colors: {
        "theme-grey-dark": "#2c2c2c",
        "theme-secondary" : "#411dc9",
        "secondary-dark-hover" : "#121c7f",
        "light-white": "rgba(255, 255, 255, 0.25)",
        "light-grey": "rgba(235, 234, 226, 0.5)",
        primary: "#b2ff0b",
      },
      screens: {
        "max-width-1100px": { raw: "(max-width: 1100px)" },
        "max-width-868px": { raw: "(max-width: 868px)" },
        "max-width-750px": { raw: "(max-width: 750px)" },
        "max-width-500px": { raw: "(max-width: 500px)" },
        "min-width-1280px": { raw: "(min-width: 1280px)" },
      },
    },
  },
  plugins: [],
};

//base-transition: all 200ms ease-in-out
