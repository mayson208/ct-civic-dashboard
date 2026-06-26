/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ct: {
          blue:  '#003087',
          navy:  '#001f5b',
          sky:   '#0072ce',
          light: '#e8f0fb',
          gold:  '#ffc72c',
        },
      },
    },
  },
  plugins: [],
}
