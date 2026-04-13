/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'neon-black':      '#000000',
        'neon-dark-grey':  '#1A1A1A',
        'neon-violet':     '#8A2BE2',
        'neon-blue':       '#0000FF',
        'neon-light-blue': '#00BFFF',
        'neon-text-light': '#E0E0E0',
        'neon-text-dark':  '#A0A0A0',
        success: '#4ABA79',
        warning: '#E0B95B',
        danger:  '#E05252',
        info:    '#00BFFF',
      },
      boxShadow: {
        'neon-glow-violet': '0 0 10px rgba(138, 43, 226, 0.7), 0 0 20px rgba(138, 43, 226, 0.5)',
        'neon-glow-blue':   '0 0 10px rgba(0, 0, 255, 0.7), 0 0 20px rgba(0, 0, 255, 0.5)',
      },
      fontFamily: {
        sans: ['System'],
      },
    },
  },
  plugins: [],
};
