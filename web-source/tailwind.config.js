/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      },
      animation: {
        'bounce-in': 'bounceIn 0.4s ease-out',
        'shake': 'shake 0.4s ease-in-out',
        'fade-in': 'fadeIn 0.3s ease-in',
        'pulse-glow': 'pulseGlow 1s ease-in-out infinite'
      },
      keyframes: {
        bounceIn: {
          '0%': { transform: 'scale(0.5)', opacity: '0' },
          '70%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-5px)' },
          '80%': { transform: 'translateX(5px)' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 6px rgba(139,92,246,0.4)' },
          '50%': { boxShadow: '0 0 20px rgba(139,92,246,0.9)' }
        }
      }
    }
  },
  plugins: []
};
