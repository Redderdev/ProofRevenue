import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0A0F1C',
          900: '#0B1220',
          800: '#141B2E',
          700: '#1F2740',
          600: '#2B3552',
          400: '#5B6478',
          300: '#8A93A8',
          200: '#C7CBD6',
          100: '#E6E4DD',
        },
        paper: {
          DEFAULT: '#F6F4EE',
          alt: '#EFEDE5',
          dim: '#E6E3D8',
        },
        line: {
          DEFAULT: '#DEDAD0',
          strong: '#C9C4B6',
        },
        emerald: {
          DEFAULT: 'oklch(0.62 0.14 158)',
          soft: 'oklch(0.92 0.06 158)',
          ink: 'oklch(0.34 0.08 158)',
        },
        amber: {
          DEFAULT: 'oklch(0.72 0.14 75)',
          soft: 'oklch(0.94 0.06 75)',
        },
        ruby: {
          DEFAULT: 'oklch(0.58 0.17 25)',
          soft: 'oklch(0.94 0.05 25)',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};

export default config;
