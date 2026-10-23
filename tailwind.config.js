/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Montserrat', 'Outfit', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Montserrat', 'sans-serif'],
      },
      colors: {
        reguA: {
          start: '#00F0FF',
          end: '#0051FF'
        },
        reguB: {
          start: '#FFE600',
          end: '#FF7A00'
        },
        reguC: {
          start: '#FF4D94',
          end: '#C80064'
        },
        reguD: {
          start: '#34D399',
          end: '#059669'
        },
        reguE: {
          start: '#C084FC',
          end: '#6D28D9'
        }
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(-100%)' }
        },
        floatDelta: {
          '0%': { opacity: 0, transform: 'translateY(10px) scale(0.8)' },
          '20%': { opacity: 1, transform: 'translateY(0) scale(1.1)' },
          '80%': { opacity: 1, transform: 'translateY(-15px) scale(1)' },
          '100%': { opacity: 0, transform: 'translateY(-30px) scale(0.9)' }
        }
      },
      animation: {
        shimmer: 'shimmer 2.5s infinite linear',
        floatDelta: 'floatDelta 2.5s ease-out forwards'
      }
    },
  },
  plugins: [],
}
