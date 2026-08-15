/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        mansion: {
          burgundy: '#8B2942',
          gold: '#C9A84C',
          cream: '#FFF8F0',
          'dark-brown': '#2D1B14',
          wood: '#3D2914',
          board: '#F5E6D3',
        },
      },
    },
  },
  plugins: [],
}
