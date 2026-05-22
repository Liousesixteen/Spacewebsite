import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-orbitron)', 'sans-serif'],
        sans: ['var(--font-exo2)', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
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
      boxShadow: {
        'glow-blue': '0 0 40px rgba(79, 143, 255, 0.3), 0 0 80px rgba(79, 143, 255, 0.1)',
        'glow-purple': '0 0 40px rgba(139, 92, 246, 0.3)',
        'glow-cyan': '0 0 40px rgba(34, 211, 238, 0.3)',
        'inner-glow': 'inset 0 0 30px rgba(79, 143, 255, 0.1)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.3), 0 1px 4px rgba(0, 0, 0, 0.2)',
        'card-hover': '0 8px 40px rgba(79, 143, 255, 0.2), 0 2px 8px rgba(0, 0, 0, 0.3)',
        'card-elevated': '0 12px 48px rgba(0, 0, 0, 0.4), 0 4px 16px rgba(0, 0, 0, 0.25)',
      },
      backdropBlur: {
        xs: '2px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'space-gradient': 'linear-gradient(to bottom, #0a0a0f, #1a1a25)',
        'cosmic-glow': 'radial-gradient(ellipse at center, rgba(79, 143, 255, 0.15) 0%, transparent 70%)',
        'gradient-btn-primary': 'linear-gradient(135deg, rgb(var(--cosmic-blue)), rgb(var(--cosmic-purple)))',
      },
      animation: {
        twinkle: 'twinkle 3s ease-in-out infinite',
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'border-glow': 'border-glow 3s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.6s ease-out',
        'fade-in': 'fade-in 0.4s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'nebula-drift': 'nebula-drift 20s linear infinite',
        'shooting-star': 'shooting-star 3s linear infinite',
        'shooting-star-2': 'shooting-star 4s linear 1s infinite',
        'shooting-star-3': 'shooting-star 3.5s linear 2s infinite',
        'shooting-star-4': 'shooting-star 5s linear 0.5s infinite',
        'bounce-chevron': 'bounce-chevron 2s ease-in-out infinite',
        'logo-pulse': 'logo-pulse 3s ease-in-out infinite',
        'gradient-underline': 'gradient-underline 0.3s ease-out',
        'slide-in-right': 'slide-in-right 0.3s ease-out',
        'bg-pulse': 'bg-pulse 3s ease-in-out infinite',
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
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        'border-glow': {
          '0%, 100%': { borderColor: 'rgba(79, 143, 255, 0.3)' },
          '50%': { borderColor: 'rgba(79, 143, 255, 0.6)' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'nebula-drift': {
          '0%': { backgroundPosition: '0% 0%, 0% 0%, 0% 0%' },
          '50%': { backgroundPosition: '5% 3%, -3% 2%, 2% -2%' },
          '100%': { backgroundPosition: '0% 0%, 0% 0%, 0% 0%' },
        },
        'shooting-star': {
          '0%': { transform: 'translateX(0) translateY(0) rotate(-35deg)', opacity: '0' },
          '5%': { opacity: '1' },
          '15%': { opacity: '1' },
          '25%': { transform: 'translateX(-300px) translateY(300px) rotate(-35deg)', opacity: '0' },
          '100%': { opacity: '0' },
        },
        'bounce-chevron': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(6px)' },
        },
        'logo-pulse': {
          '0%, 100%': { filter: 'drop-shadow(0 0 0 rgba(79, 143, 255, 0))' },
          '50%': { filter: 'drop-shadow(0 0 8px rgba(79, 143, 255, 0.6))' },
        },
        'gradient-underline': {
          '0%': { transform: 'scaleX(0)' },
          '100%': { transform: 'scaleX(1)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'bg-pulse': {
          '0%, 100%': { backgroundColor: 'rgba(79, 143, 255, 0)' },
          '50%': { backgroundColor: 'rgba(79, 143, 255, 0.05)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
