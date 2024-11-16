/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  safelist: ["dark"],
  prefix: "",
  plugins: [
    require("@tailwindcss/typography"),
    require("daisyui")
  ],
}
