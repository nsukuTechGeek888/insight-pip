/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // InsightPip brand
        'ip-blue':       'var(--ip-blue)',
        'ip-blue-hover': 'var(--ip-blue-hover)',
        'ip-blue-press': 'var(--ip-blue-press)',
        'ip-blue-soft':  'var(--ip-blue-soft)',

        // Light surfaces
        'ip-bg':        'var(--ip-bg)',
        'ip-surface':   'var(--ip-surface)',
        'ip-surface-2': 'var(--ip-surface-2)',
        'ip-surface-3': 'var(--ip-surface-3)',
        'ip-border':    'var(--ip-border)',
        'ip-border-strong': 'var(--ip-border-strong)',

        // Dark header
        'ip-header':        'var(--ip-header-bg)',
        'ip-header-2':      'var(--ip-header-bg-2)',
        'ip-header-border': 'var(--ip-header-border)',
        'ip-header-text':   'var(--ip-header-text)',
        'ip-header-text-2': 'var(--ip-header-text-2)',

        // Text (light)
        'ip-text':        'var(--ip-text)',
        'ip-text-2':      'var(--ip-text-2)',
        'ip-text-3':      'var(--ip-text-3)',
        'ip-text-invert': 'var(--ip-text-invert)',

        // Semantic
        'ip-green':      'var(--ip-green)',
        'ip-green-soft': 'var(--ip-green-soft)',
        'ip-amber':      'var(--ip-amber)',
        'ip-amber-soft': 'var(--ip-amber-soft)',
        'ip-red':        'var(--ip-red)',
        'ip-red-soft':   'var(--ip-red-soft)',
        'ip-gold':       'var(--ip-gold)',
        'ip-gold-soft':  'var(--ip-gold-soft)',
      },
      borderRadius: {
        'ip-sm':   'var(--ip-r-sm)',
        'ip-md':   'var(--ip-r-md)',
        'ip-lg':   'var(--ip-r-lg)',
        'ip-pill': 'var(--ip-r-pill)',
      },
      boxShadow: {
        'ip-xs': 'var(--ip-shadow-xs)',
        'ip-sm': 'var(--ip-shadow-sm)',
        'ip-md': 'var(--ip-shadow-md)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      transitionTimingFunction: {
        'ip': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      transitionDuration: {
        'ip-fast': '150ms',
        'ip-base': '200ms',
        'ip-slow': '250ms',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}