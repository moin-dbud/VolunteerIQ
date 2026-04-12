/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        grotesk: ['Space Grotesk', 'sans-serif'],
        sans: ['DM Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: {
          base: '#0a0a0f',
          surface: '#111118',
          elevated: '#1a1a24',
          sidebar: '#0d0d14',
        },
        accent: {
          primary: '#9333ea',
          'primary-hover': '#7c22d4',
          secondary: '#c026d3',
        },
        urgency: {
          high: '#ef4444',
          medium: '#f59e0b',
          low: '#6366f1',
          urgent: '#dc2626',
        },
        status: {
          pending: '#ef4444',
          assigned: '#f97316',
          completed: '#22c55e',
        },
        cat: {
          infrastructure: '#9333ea',
          environment: '#c026d3',
          'public-safety': '#ef4444',
          health: '#8b5cf6',
        },
        text: {
          primary: '#ffffff',
          secondary: '#a1a1aa',
          muted: '#52525b',
          accent: '#9333ea',
        },
        border: {
          default: '#27272a',
          focus: '#9333ea',
        },
      },
      borderRadius: {
        DEFAULT: '8px',
        md: '8px',
        lg: '12px',
        xl: '16px',
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
        spin: 'spin 1s linear infinite',
        'count-up': 'count-up 800ms ease-out',
        'fade-in': 'fadeIn 300ms ease-out',
        'slide-in-right': 'slideInRight 300ms ease-out',
        'bounce-in': 'bounceIn 400ms cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.3) translateY(-20px)' },
          '50%': { transform: 'scale(1.05) translateY(4px)' },
          '70%': { transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
