/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,jsx,ts,tsx,css}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        blueprimary: "#4AAAD6", // Custom blue
        redprimary: "#E14E54", // Custom red
        yellowprimary: "#FAB700", // Custom yellow
        greenprimary: "#153D39", // Custom green
      },
      animation: {
        bounce200: "bounce 1s infinite 200ms",
        bounce400: "bounce 1s infinite 400ms",
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require("tailwindcss-rtl"),
    function ({ addUtilities }) {
      const newUtilities = {
        ".flex-center": {
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      };

      addUtilities(newUtilities);
    },
  ],
};
