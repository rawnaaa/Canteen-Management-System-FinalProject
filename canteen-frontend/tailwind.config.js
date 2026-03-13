/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canteen: {
          orange: '#f97316',
          dark:   '#1f2937',
        },
      },
    },
  },
  plugins: [],
}