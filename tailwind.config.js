const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors: {
      rose: '#f2c4ce',
      'rose-deep': '#e8a0b0',
      lavender: '#d4b8e0',
      'lavender-deep': '#9b7fd4',
      sage: '#c8d8c0',
      'sage-deep': '#7faa75',
      cream: '#fdf6f0',
      'cream-dark': '#f5ede4',
      text: '#4a3540',
      'text-light': '#9a7a85',
      gold: '#c9a96e',
      white: '#ffffff',
      black: '#000000',
      transparent: 'transparent',
      current: 'currentColor',
    },
    fontFamily: {
      display: ['var(--font-display)', ...fontFamily.serif],
      body: ['var(--font-body)', ...fontFamily.sans],
    },
    extend: {
      animation: {
        float: 'float 4s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
      boxShadow: {
        soft: '0 4px 24px 0 rgba(74, 53, 64, 0.08)',
        'soft-lg': '0 8px 40px 0 rgba(74, 53, 64, 0.12)',
      },
    },
  },
  plugins: [],
}
