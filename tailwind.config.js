/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';

export default {
  theme: {
    extend: {
      typography: () => ({
        shadcn: {
          css: {
            '--tw-prose-body': 'var(--color-foreground)',
            '--tw-prose-headings': 'var(--color-foreground)',
            '--tw-prose-lead': colors.neutral[600],
            '--tw-prose-links': 'var(--color-foreground)',
            '--tw-prose-bold': 'var(--color-foreground)',
            '--tw-prose-counters': colors.neutral[500],
            '--tw-prose-bullets': colors.neutral[300],
            '--tw-prose-hr': colors.neutral[200],
            '--tw-prose-quotes': 'var(--color-foreground)',
            '--tw-prose-quote-borders': colors.neutral[200],
            '--tw-prose-captions': colors.neutral[500],
            '--tw-prose-kbd': 'var(--color-foreground)',
            '--tw-prose-kbd-shadows': 'var(--color-foreground)',
            '--tw-prose-code': 'var(--color-foreground)',
            '--tw-prose-pre-code': colors.neutral[200],
            '--tw-prose-pre-bg': colors.neutral[800],
            '--tw-prose-th-borders': colors.neutral[300],
            '--tw-prose-td-borders': colors.neutral[200],
            '--tw-prose-invert-body': colors.neutral[300],
            '--tw-prose-invert-headings': colors.white,
            '--tw-prose-invert-lead': colors.neutral[400],
            '--tw-prose-invert-links': colors.white,
            '--tw-prose-invert-bold': colors.white,
            '--tw-prose-invert-counters': colors.neutral[400],
            '--tw-prose-invert-bullets': colors.neutral[600],
            '--tw-prose-invert-hr': colors.neutral[700],
            '--tw-prose-invert-quotes': colors.neutral[100],
            '--tw-prose-invert-quote-borders': colors.neutral[700],
            '--tw-prose-invert-captions': colors.neutral[400],
            '--tw-prose-invert-kbd': colors.white,
            '--tw-prose-invert-kbd-shadows': colors.white,
            '--tw-prose-invert-code': colors.white,
            '--tw-prose-invert-pre-code': colors.neutral[300],
            '--tw-prose-invert-pre-bg': 'rgb(0 0 0 / 50%)',
            '--tw-prose-invert-th-borders': colors.neutral[600],
            '--tw-prose-invert-td-borders': colors.neutral[700],
          },
        },
      }),
    },
  },
  // plugins: [require('@tailwindcss/typography')],
};
