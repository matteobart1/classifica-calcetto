/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'primary': '#2c2d2e',
        'gold': '#9b8f28',
      },
      animation: {
        'spin-slow': 'spin 2s linear infinite',
      },
      backgroundImage: {
        'hero-pattern': "url('https://res.cloudinary.com/dp44j757l/image/upload/v1741821059/IMG_7369_ngnl0j.jpg')",
      },
    },
  },
  plugins: [],
} 