/** @type {import('tailwindcss').Config} */

export default {
  theme: {
    extend: {
      typography: () => ({
        shadcn: {
          css: {
            '--tw-prose-body': 'var(--color-foreground)',
          },
        },
      }),
    },
  },
  // plugins: [require('@tailwindcss/typography')],
};
