/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'heading': ['"Playfair Display"', 'serif'],
        'body': ['"Inter"', 'sans-serif'],
        'sans': ['"Inter"', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        // Fine-dine premium palette
        background: '#0D0F12',
        card: '#1A1C1F',
        text: '#ECECEC',
        'text-light': '#F5F5F5',
        accent: '#BFA181',
        'accent-secondary': '#EEDFC7',
        
        // Taste profile colors
        'taste-spicy': '#FF5733',
        'taste-sweet': '#FCA3B7',
        'taste-neutral': '#A3A3A3',
        
        // Legacy neon colors (for checkpoint reference)
        neon: {
          purple: '#8b45ff',
          pink: '#ff6b9d',
          cyan: '#45ffff',
          green: '#45ff88',
        },
        cyber: {
          dark: '#0a0a0f',
          darker: '#050508',
          light: '#1a1a2e',
          accent: '#16213e',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'gradient': 'gradient 15s ease infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(191, 161, 129, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(191, 161, 129, 0.5), 0 0 40px rgba(191, 161, 129, 0.2)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        pulseGlow: {
          '0%, 100%': { 
            boxShadow: '0 0 5px rgba(191, 161, 129, 0.3), 0 0 10px rgba(191, 161, 129, 0.2), 0 0 15px rgba(191, 161, 129, 0.1)',
            transform: 'scale(1)'
          },
          '50%': { 
            boxShadow: '0 0 20px rgba(191, 161, 129, 0.5), 0 0 25px rgba(191, 161, 129, 0.3), 0 0 30px rgba(191, 161, 129, 0.2)',
            transform: 'scale(1.02)'
          },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'luxury': '0 0 20px rgba(191, 161, 129, 0.3)',
        'luxury-strong': '0 0 30px rgba(191, 161, 129, 0.5)',
        'premium': '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
      }
    },
  },
  plugins: [],
}
