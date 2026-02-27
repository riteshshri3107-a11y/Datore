import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}', './app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: { sans: ['var(--font-primary)', 'system-ui'], display: ['var(--font-display)', 'system-ui'] },
      colors: { glass: { light: 'rgba(255,255,255,0.15)', medium: 'rgba(255,255,255,0.25)', heavy: 'rgba(255,255,255,0.4)' } },
      backdropBlur: { xs: '2px' },
      animation: { 'fade-in': 'fadeIn 0.5s ease-out', 'slide-up': 'slideUp 0.4s ease-out', 'glow': 'glow 2s ease-in-out infinite alternate' },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        glow: { '0%': { boxShadow: '0 0 5px rgba(99,102,241,0.3)' }, '100%': { boxShadow: '0 0 20px rgba(99,102,241,0.6)' } }
      }
    }
  },
  plugins: []
}
export default config
