/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f6f7f6',
          100: '#e3e6e3', 
          200: '#c7cdc7',
          300: '#a3ada3',
          400: '#7d887d',
          500: '#8FBC8F', // Main sage green
          600: '#6b8e6b',
          700: '#567356',
          800: '#465d46',
          900: '#3a4e3a',
        },
        wood: {
          50: '#fdf8f3',
          100: '#f7ede1',
          200: '#eed8c2', 
          300: '#e2ba95',
          400: '#d4a574', // Wood accent color
          500: '#c48c4e',
          600: '#b67943',
          700: '#966339',
          800: '#795134',
          900: '#62432c',
        }
      },
      backgroundImage: {
        'wood-texture': 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23d4a574" fill-opacity="0.1"%3E%3Cpath d="M20 20c0 11.046-8.954 20-20 20v-20h20zM0 0h20v20c0-11.046-8.954-20-20-20z"/%3E%3C/g%3E%3C/svg%3E")'
      },
      fontFamily: {
        'sans': ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif']
      },
      fontSize: {
        'base': '18px', // Increase base font size for better readability
      },
      boxShadow: {
        'soft': '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
      }
    },
  },
  plugins: [],
};