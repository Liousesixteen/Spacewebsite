import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        space: {
          900: '#0a0a0f',
          800: '#12121a',
          700: '#1a1a25',
          600: '#252535',
          500: '#353550',
        },
        cosmic: {
          blue: '#4f8fff',
          purple: '#8b5cf6',
          cyan: '#22d3ee',
          pink: '#ec4899',
        },
        star: {
          white: '#ffffff',
          dim: '#a1a1aa',
          glow: '#fef08a',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'space-gradient': 'linear-gradient(to bottom, #0a0a0f, #1a1a25)',
        'cosmic-glow': 'radial-gradient(ellipse at center, rgba(79, 143, 255, 0.15) 0%, transparent 70%)',
      },
      animation: {
        'twinkle': 'twinkle 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        twinkle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(79, 143, 255, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(79, 143, 255, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
