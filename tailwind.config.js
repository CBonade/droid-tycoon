/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        'sw-void':    '#0a0a14',
        'sw-deep':    '#0f0f1e',
        'sw-surface': '#14142a',
        'sw-border':  '#1e1e40',
        'sw-gold':    '#C9A84C',
        'sw-gold-lt': '#E8C97A',
        'sw-blue':    '#4FC3F7',
        'sw-red':     '#EF4444',
        'sw-muted':   '#4a4a6a',
        'sw-dim':     '#7a7a9a',
        rarity: {
          base:    '#6B7280',
          gold:    '#F59E0B',
          diamond: '#22D3EE',
          beskar:  '#94A3B8',
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
      boxShadow: {
        'gold':    '0 0 12px rgba(201,168,76,0.5)',
        'blue':    '0 0 12px rgba(79,195,247,0.5)',
        'rarity-gold':    '0 0 8px rgba(245,158,11,0.6)',
        'rarity-diamond': '0 0 8px rgba(34,211,238,0.6)',
        'rarity-rainbow': '0 0 10px rgba(139,92,246,0.5)',
        'rarity-beskar':  '0 0 8px rgba(148,163,184,0.5)',
      },
      animation: {
        'rainbow-shift': 'rainbow-shift 3s ease infinite',
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
      },
      keyframes: {
        'rainbow-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%':       { backgroundPosition: '100% 50%' },
        },
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 6px rgba(201,168,76,0.4)' },
          '50%':       { boxShadow: '0 0 16px rgba(201,168,76,0.8)' },
        },
      },
    },
  },
  plugins: [],
}
