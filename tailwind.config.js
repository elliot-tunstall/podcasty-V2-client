/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sf-compact': ['-apple-system', 'SF Compact Display', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 