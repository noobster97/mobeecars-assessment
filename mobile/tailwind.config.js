/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#0ea5e9",
          dark: "#0369a1",
        },
        accent: {
          like: "#22c55e",
          dislike: "#ef4444",
        },
      },
    },
  },
  plugins: [],
};
