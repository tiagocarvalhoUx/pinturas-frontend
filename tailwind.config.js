/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'luxury-black':      '#121212',
        'luxury-dark-grey':  '#1E1E1E',
        'luxury-gold':       '#D4AF37',
        'luxury-light-gold': '#E0B95B',
        'luxury-deep-gold':  '#B8960C',
        'luxury-text-light': '#F5F5F5',
        'luxury-text-dark':  '#A0A0A0',
        success: '#4ABA79',
        warning: '#E0B95B',
        danger:  '#E05252',
        info:    '#5AAAE0',
      },
      boxShadow: {
        'gold-glow': '0 0 15px rgba(212, 175, 55, 0.4)',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
