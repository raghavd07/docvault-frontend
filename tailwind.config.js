/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {

      colors: {
        primary: '#6366f1',   // indigo accent
        secondary: '#8b5cf6',

        /* dashboard surfaces */
        surface: '#1e293b',
        background: '#0f172a',

        /* borders */
        borderSubtle: '#334155'
      },

      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
      },

      boxShadow: {
        card: '0 10px 25px rgba(0,0,0,0.25)'
      }

    },
  },
  plugins: [],
}