/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        minecraft: ['MinecraftRegular', 'sans-serif'],
        minecraftTen: ['MinecraftTen', 'monospace'],
      },
    },
  },
  plugins: [],
}
