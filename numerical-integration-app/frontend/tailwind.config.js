import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    path.join(__dirname, 'index.html'),
    path.join(__dirname, 'src/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    extend: {
      fontSize: {
        xs: ['0.8625rem', { lineHeight: '1.15rem' }],
        sm: ['1.00625rem', { lineHeight: '1.4375rem' }],
        base: ['1.15rem', { lineHeight: '1.725rem' }],
        lg: ['1.29375rem', { lineHeight: '1.95rem' }],
        xl: ['1.4375rem', { lineHeight: '2.0125rem' }],
        '2xl': ['1.725rem', { lineHeight: '2.3rem' }],
        '3xl': ['2.15625rem', { lineHeight: '2.5875rem' }],
        '4xl': ['2.5875rem', { lineHeight: '2.875rem' }],
        '5xl': ['3.45rem', { lineHeight: '1' }],
      },
    },
  },
  plugins: [],
};
