/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: {
      xs: { min: "0px", max: "430px" },

      sm: { min: "431px", max: "767px" },
      // => @media (min-width: 640px and max-width: 767px) { ... }

      md: { min: "768px", max: "1023px" },
      // => @media (min-width: 768px and max-width: 1023px) { ... }

      lg: { min: "1024px" }
      // => @media (min-width: 1024px and max-width: 1279px) { ... }
    },
    extend: {
      width: {
        95: "95%",
        90: "90%",
        85: "85%"
      }
    }
  },
  plugins: []
};
