import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        'brand-primary': 'var(--color-brand-primary)',
        'brand-primary-hover': 'var(--color-brand-primary-hover)',
        'brand-secondary': 'var(--color-brand-secondary)',
        'brand-accent': 'var(--color-brand-accent)',
        'brand-contrast': 'var(--color-brand-contrast)',
        
        // Surface colors
        'surface': 'var(--color-surface)',
        'surface-high': 'var(--color-surface-high)',
        'surface-muted': 'var(--color-surface-muted)',
        
        // Text colors
        'text': 'var(--color-text)',
        'text-medium': 'var(--color-text-medium)',
        'text-low': 'var(--color-text-low)',
        'text-disabled': 'var(--color-text-disabled)',
        
        // Border colors
        'border': 'var(--color-border)',
        'border-hover': 'var(--color-border-hover)',
        'border-focus': 'var(--color-border-focus)',
        
        // Status colors
        'success': 'var(--color-success)',
        'warning': 'var(--color-warning)',
        'danger': 'var(--color-danger)',
        'info': 'var(--color-info)',
      },
      spacing: {
        'siaf-none': 'var(--spacing-0)',
        'siaf-1': 'var(--spacing-1)',
        'siaf-2': 'var(--spacing-2)',
        'siaf-3': 'var(--spacing-3)',
        'siaf-4': 'var(--spacing-4)',
        'siaf-5': 'var(--spacing-5)',
        'siaf-6': 'var(--spacing-6)',
        'siaf-8': 'var(--spacing-8)',
        'siaf-10': 'var(--spacing-10)',
        'siaf-12': 'var(--spacing-12)',
        
        // Aliases
        'px-siaf-xs': 'var(--spacing-2)',
        'px-siaf-sm': 'var(--spacing-3)',
        'px-siaf-md': 'var(--spacing-4)',
        'px-siaf-lg': 'var(--spacing-6)',
        'px-siaf-xl': 'var(--spacing-8)',
        'px-siaf-xxl': 'var(--spacing-12)',
        
        'py-siaf-xs': 'var(--spacing-2)',
        'py-siaf-sm': 'var(--spacing-3)',
        'py-siaf-md': 'var(--spacing-4)',
        'py-siaf-lg': 'var(--spacing-6)',
        'py-siaf-xl': 'var(--spacing-8)',
        'py-siaf-xxl': 'var(--spacing-12)',
      },
      borderRadius: {
        'siaf-sm': 'var(--radius-siaf-sm)',
        'siaf-md': 'var(--radius-siaf-md)',
        'siaf-lg': 'var(--radius-siaf-lg)',
        'siaf-xl': 'var(--radius-siaf-xl)',
        'siaf-full': 'var(--radius-siaf-full)',
      },
      boxShadow: {
        'siaf-sm': 'var(--shadow-siaf-sm)',
        'siaf-md': 'var(--shadow-siaf-md)',
        'siaf-lg': 'var(--shadow-siaf-lg)',
        'siaf-elevation-1': 'var(--shadow-siaf-elevation-1)',
        'siaf-elevation-2': 'var(--shadow-siaf-elevation-2)',
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        base: 'var(--duration-base)',
        slow: 'var(--duration-slow)',
      },
    },
  },
  plugins: [],
} satisfies Config;
