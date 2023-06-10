/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'lightgrey': '#565656',
        'primary': '#56BAA7'
      },
      fontFamily: {
        'motserrat': ['Montserrat', 'sans']
      }
    },
  },
  plugins: [],
}

