/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0D0F12',
        card: '#1A1C1F',
        text: '#ECECEC',
        'text-light': '#F5F5F5',
        accent: '#BFA181',
        'accent-light': '#EEDFC7',
        spicy: '#FF5733',
        sweet: '#FCA3B7',
        neutral: '#A3A3A3',
        savory: '#A3A3A3',
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-accent': 'glow-accent 2s ease-in-out infinite alternate',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        'glow-accent': {
          '0%': { boxShadow: '0 0 5px rgba(191, 161, 129, 0.3), 0 0 10px rgba(191, 161, 129, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(191, 161, 129, 0.6), 0 0 30px rgba(191, 161, 129, 0.3)' }
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
