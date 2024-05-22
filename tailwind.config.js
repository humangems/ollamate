/** @type {import('tailwindcss').Config} */
import { radixThemePreset } from 'radix-themes-tw';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [require('@tailwindcss/typography')],
  presets: [radixThemePreset],
};
