import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}', './index.html'],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translate(-50%, -110%)' },
          '100%': { opacity: '1', transform: 'translate(-50%, -100%)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}

export default config
