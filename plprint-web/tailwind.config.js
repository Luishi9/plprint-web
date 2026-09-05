/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}', 'node_modules/flowbite-react/dist/**/*.js'],
  theme: {
    extend: {
      colors: {
        border: 'color-mix(in srgb, var(--border) calc(<alpha-value> * 100%), transparent)',
        input: 'color-mix(in srgb, var(--input) calc(<alpha-value> * 100%), transparent)',
        ring: 'color-mix(in srgb, var(--ring) calc(<alpha-value> * 100%), transparent)',
        background: 'color-mix(in srgb, var(--background) calc(<alpha-value> * 100%), transparent)',
        foreground: 'color-mix(in srgb, var(--foreground) calc(<alpha-value> * 100%), transparent)',
        primary: {
          DEFAULT: 'color-mix(in srgb, var(--primary) calc(<alpha-value> * 100%), transparent)',
          foreground: 'color-mix(in srgb, var(--primary-foreground) calc(<alpha-value> * 100%), transparent)',
        },
        secondary: {
          DEFAULT: 'color-mix(in srgb, var(--secondary) calc(<alpha-value> * 100%), transparent)',
          foreground: 'color-mix(in srgb, var(--secondary-foreground) calc(<alpha-value> * 100%), transparent)',
        },
        destructive: {
          DEFAULT: 'color-mix(in srgb, var(--destructive) calc(<alpha-value> * 100%), transparent)',
          foreground: 'color-mix(in srgb, var(--destructive-foreground) calc(<alpha-value> * 100%), transparent)',
        },
        muted: {
          DEFAULT: 'color-mix(in srgb, var(--muted) calc(<alpha-value> * 100%), transparent)',
          foreground: 'color-mix(in srgb, var(--muted-foreground) calc(<alpha-value> * 100%), transparent)',
        },
        accent: {
          DEFAULT: 'color-mix(in srgb, var(--accent) calc(<alpha-value> * 100%), transparent)',
          foreground: 'color-mix(in srgb, var(--accent-foreground) calc(<alpha-value> * 100%), transparent)',
        },
        card: {
          DEFAULT: 'color-mix(in srgb, var(--card) calc(<alpha-value> * 100%), transparent)',
          foreground: 'color-mix(in srgb, var(--card-foreground) calc(<alpha-value> * 100%), transparent)',
        },
        popover: {
          DEFAULT: 'color-mix(in srgb, var(--popover) calc(<alpha-value> * 100%), transparent)',
          foreground: 'color-mix(in srgb, var(--popover-foreground) calc(<alpha-value> * 100%), transparent)',
        },
        'water-leaf': {
          '50': '#f2fbfa',
          '100': '#d4f3ef',
          '200': '#92e1d8',
          '300': '#75d3cc',
          '400': '#48b9b4',
          '500': '#2e9e9b',
          '600': '#237e7d',
          '700': '#206565',
          '800': '#1d5152',
          '900': '#1c4545',
          '950': '#0b2628',
        },
        sidebar: {
          DEFAULT: 'color-mix(in srgb, var(--sidebar) calc(<alpha-value> * 100%), transparent)',
          foreground: 'color-mix(in srgb, var(--sidebar-foreground) calc(<alpha-value> * 100%), transparent)',
          primary: 'color-mix(in srgb, var(--sidebar-primary) calc(<alpha-value> * 100%), transparent)',
          'primary-foreground': 'color-mix(in srgb, var(--sidebar-primary-foreground) calc(<alpha-value> * 100%), transparent)',
          accent: 'color-mix(in srgb, var(--sidebar-accent) calc(<alpha-value> * 100%), transparent)',
          'accent-foreground': 'color-mix(in srgb, var(--sidebar-accent-foreground) calc(<alpha-value> * 100%), transparent)',
          border: 'color-mix(in srgb, var(--sidebar-border) calc(<alpha-value> * 100%), transparent)',
          ring: 'color-mix(in srgb, var(--sidebar-ring) calc(<alpha-value> * 100%), transparent)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
    },
  },
  plugins: [require('flowbite/plugin'), require('flowbite-react/plugin/tailwindcss')],
};
