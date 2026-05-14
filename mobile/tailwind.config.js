/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Brand — matches Mobee Cars (red accent, black wordmark, white surface)
        primary: {
          DEFAULT: "#EF4444",
          50: "#FEF2F2",
          100: "#FEE2E2",
          200: "#FECACA",
          300: "#FCA5A5",
          400: "#F87171",
          500: "#EF4444",
          600: "#DC2626",
          700: "#B91C1C",
          800: "#991B1B",
          900: "#7F1D1D",
        },
        surface: {
          DEFAULT: "#FFFFFF",
          subtle: "#F8FAFC",
          elevated: "#FFFFFF",
        },
        fg: {
          DEFAULT: "#0F172A",
          muted: "#475569",
          subtle: "#94A3B8",
        },
        accent: {
          like: "#10B981",
          dislike: "#EF4444",
          pending: "#F59E0B",
        },
      },
    },
  },
  plugins: [],
};
