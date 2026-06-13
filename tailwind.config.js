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
        background: "#140C30",
        surface: "#14253E",
        card: "#153D4C",
        primary: "#156F69",
        secondary: "#168777",
        accent: "#16A085",
      },
    },
  },
  plugins: [],
};