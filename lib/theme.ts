export function getTheme(isDark: boolean, glassLevel: string = 'medium', accent: string = '#6366f1') {
  const glassOpacity = glassLevel === 'subtle' ? 0.08 : glassLevel === 'heavy' ? 0.3 : 0.15;
  const blurAmount = glassLevel === 'subtle' ? '8px' : glassLevel === 'heavy' ? '24px' : '16px';

  if (isDark) return {
    bg: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 30%, #16213e 70%, #0f0f1a 100%)',
    surface: `rgba(255,255,255,${glassOpacity})`,
    surfaceHover: `rgba(255,255,255,${glassOpacity + 0.05})`,
    surfaceBorder: `rgba(255,255,255,${glassOpacity + 0.05})`,
    text: '#f0f0f5', textSecondary: '#a0a0b8', textMuted: '#666680',
    accent, accentLight: accent + '33', accentGlow: accent + '55',
    card: `rgba(255,255,255,${glassOpacity})`,
    cardBorder: 'rgba(255,255,255,0.1)',
    input: 'rgba(255,255,255,0.08)', inputBorder: 'rgba(255,255,255,0.15)',
    blur: blurAmount,
    nav: `rgba(15,15,26,0.85)`,
    success: '#22c55e', warning: '#f59e0b', danger: '#ef4444', info: '#3b82f6',
    shadow: '0 8px 32px rgba(0,0,0,0.4)',
    glassShadow: '0 4px 30px rgba(0,0,0,0.3)',
  };

  return {
    bg: 'linear-gradient(135deg, #f5f7ff 0%, #e8ecff 30%, #f0e6ff 70%, #f5f7ff 100%)',
    surface: `rgba(255,255,255,${0.5 + glassOpacity})`,
    surfaceHover: `rgba(255,255,255,${0.6 + glassOpacity})`,
    surfaceBorder: `rgba(200,200,220,0.3)`,
    text: '#1a1a2e', textSecondary: '#555570', textMuted: '#8888a0',
    accent, accentLight: accent + '22', accentGlow: accent + '44',
    card: `rgba(255,255,255,${0.6 + glassOpacity})`,
    cardBorder: 'rgba(200,200,220,0.3)',
    input: 'rgba(255,255,255,0.7)', inputBorder: 'rgba(200,200,220,0.4)',
    blur: blurAmount,
    nav: `rgba(255,255,255,0.85)`,
    success: '#16a34a', warning: '#d97706', danger: '#dc2626', info: '#2563eb',
    shadow: '0 8px 32px rgba(100,100,140,0.15)',
    glassShadow: '0 4px 30px rgba(100,100,140,0.1)',
  };
}
