import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{html,ts}',
    './libs/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      colors: {
        /* NestSpace Design System Colors */
        bg: 'var(--bg)',
        surface: {
          DEFAULT: 'var(--surface)',
          2: 'var(--surface2)',
          3: 'var(--surface3)',
        },
        fg: {
          DEFAULT: 'var(--fg)',
          muted: 'var(--fg-muted)',
          dim: 'var(--fg-dim)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          2: 'var(--accent-2)',
          bg: 'var(--accent-bg)',
        },
        danger: 'var(--color-danger)',
        warn: 'var(--warn)',
        ok: 'var(--ok)',
        pink: 'var(--pink)',
      },
      fontFamily: {
        mono: ['var(--font-mono, \'JetBrains Mono\', ui-monospace)', 'monospace'],
      },
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
    },
  },
  plugins: [],
};

export default config;

