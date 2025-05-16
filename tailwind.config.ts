
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        arcane: {
          dark: '#1A1F2C',
          darker: '#0F1319',
          stone: '#403E43',
          'stone-dark': '#221F26',
          purple: {
            light: '#D6BCFA',
            DEFAULT: '#9B87F5',
            dark: '#7E69AB',
            darker: '#6E59A5',
          },
          blue: {
            DEFAULT: '#1EAEDB',
            dark: '#0EA5E9',
          },
          glow: {
            purple: '#9b87f590',
            blue: '#1EAEDB90',
          },
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      fontFamily: {
        'arcane': ['Cinzel', 'serif'],
        'body': ['Inter', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'rune-fade': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.8' },
        },
        'portal-spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-glow': 'pulse-glow 2s infinite ease-in-out',
        'float': 'float 6s infinite ease-in-out',
        'shimmer': 'shimmer 3s infinite linear',
        'rune-fade': 'rune-fade 4s infinite ease-in-out',
        'portal-spin': 'portal-spin 20s infinite linear',
      },
      backgroundImage: {
        'stone-texture': "url('/stone-texture.png')",
        'arcane-grid': "linear-gradient(to right, #7E69AB15 1px, transparent 1px), linear-gradient(to bottom, #7E69AB15 1px, transparent 1px)",
        'glow-circle': "radial-gradient(circle, rgba(155,135,245,0.4) 0%, rgba(155,135,245,0) 70%)",
        'rune-overlay': "url('/rune-overlay.png')",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
