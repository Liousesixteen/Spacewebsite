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
          900: 'rgb(var(--space-900) / <alpha-value>)',
          800: 'rgb(var(--space-800) / <alpha-value>)',
          700: 'rgb(var(--space-700) / <alpha-value>)',
          600: 'rgb(var(--space-600) / <alpha-value>)',
          500: 'rgb(var(--space-500) / <alpha-value>)',
        },
        cosmic: {
          blue: 'rgb(var(--cosmic-blue) / <alpha-value>)',
          purple: 'rgb(var(--cosmic-purple) / <alpha-value>)',
          cyan: 'rgb(var(--cosmic-cyan) / <alpha-value>)',
          pink: 'rgb(var(--cosmic-pink) / <alpha-value>)',
        },
        star: {
          white: 'rgb(var(--star-white) / <alpha-value>)',
          dim: 'rgb(var(--star-dim) / <alpha-value>)',
          glow: 'rgb(var(--star-glow) / <alpha-value>)',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'space-gradient': 'linear-gradient(to bottom, #0a0a0f, #1a1a25)',
        'cosmic-glow': 'radial-gradient(ellipse at center, rgba(79, 143, 255, 0.15) 0%, transparent 70%)',
      },
      animation: {
        twinkle: 'twinkle 3s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
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
