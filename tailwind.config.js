/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx,css}"],

  darkMode: "class",

  theme: {
    extend: {
      colors: {
        blueprimary: "#4AAAD6",
        redprimary: "#E14E54",
        yellowprimary: "#FAB700",
        greenprimary: "#153D39",
      },

      // ⭐ Added your splash screen animations
      keyframes: {
        textUp: {
          "0%": { opacity: "0", transform: "translateY(100px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        emojiLeft: {
          "0%": { opacity: "0", transform: "translateX(100px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
      },

      animation: {
        bounce200: "bounce 1s infinite 200ms",
        bounce400: "bounce 1s infinite 400ms",

        // ⭐ Added splash animations
        textUp: "textUp 1s cubic-bezier(.68,-0.55,.27,1.55) 0.2s forwards",
        emojiLeft:
          "emojiLeft 1s cubic-bezier(.68,-0.55,.27,1.55) 0.8s forwards",
      },
    },
  },

  variants: {
    extend: {},
  },

  plugins: [
    require("tailwindcss-rtl"),

    // your .flex-center utility
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
