/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class", // 👈 THIS LINE IS ESSENTIAL
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', "system-ui", "sans-serif"],
        display: ['"Poppins"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
