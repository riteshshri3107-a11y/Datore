"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack } from '@/components/Icons';

export default function AccessibilityPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor, toggle, setGlass, setAccent } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const ACCENTS = ['#6366f1', '#ec4899', '#22c55e', '#f59e0b', '#3b82f6', '#8b5cf6', '#ef4444', '#06b6d4'];

  const [activeTab, setActiveTab] = useState<'display' | 'accessibility' | 'language'>('display');

  // Display
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'xlarge'>('medium');
  const [compactMode, setCompactMode] = useState(false);
  const [autoplayVideos, setAutoplayVideos] = useState(true);
  const [showPreviews, setShowPreviews] = useState(true);

  // Accessibility
  const [reduceMotion, setReduceMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [screenReaderMode, setScreenReaderMode] = useState(false);
  const [largeButtons, setLargeButtons] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [keyboardNav, setKeyboardNav] = useState(true);

  // Language
  const [language, setLanguage] = useState('en');
  const [contentLanguages, setContentLanguages] = useState<string[]>(['en']);
  const [autoTranslate, setAutoTranslate] = useState(false);

  const languages = [
    { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
    { code: 'fr', label: 'French', native: 'Français', flag: '🇫🇷' },
    { code: 'es', label: 'Spanish', native: 'Español', flag: '🇪🇸' },
    { code: 'pt', label: 'Portuguese', native: 'Português', flag: '🇧🇷' },
    { code: 'zh', label: 'Chinese', native: '中文', flag: '🇨🇳' },
    { code: 'ar', label: 'Arabic', native: 'العربية', flag: '🇸🇦' },
    { code: 'pa', label: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
  ];

  const ToggleSwitch = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className="w-11 h-6 rounded-full relative transition-colors shrink-0"
      style={{ background: value ? t.accent : isDark ? '#333' : '#ccc' }}
    >
      <div
        className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all shadow-sm"
        style={{ left: value ? '22px' : '2px' }}
      />
    </button>
  );

  const tabs = [
    { key: 'display' as const, label: 'Display', icon: '🎨' },
    { key: 'accessibility' as const, label: 'Accessibility', icon: '♿' },
    { key: 'language' as const, label: 'Language', icon: '🌐' },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/settings')} style={{ background: 'none', border: 'none', color: t.text, cursor: 'pointer' }}>
          <IcoBack size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Accessibility & Display</h1>
          <p className="text-[10px]" style={{ color: t.textMuted }}>
            Customize how Datore looks and feels for you
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-medium whitespace-nowrap transition-all"
            style={{
              background: activeTab === tab.key ? `${t.accent}18` : 'transparent',
              color: activeTab === tab.key ? t.accent : t.textSecondary,
              border: activeTab === tab.key ? `1px solid ${t.accent}40` : '1px solid transparent',
            }}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* DISPLAY TAB */}
      {activeTab === 'display' && (
        <div className="space-y-3">
          {/* Theme Section */}
          <div className="rounded-2xl p-4 space-y-4" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-xs font-bold">Theme</p>

            {/* Dark Mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{isDark ? '🌙' : '☀️'}</span>
                <div>
                  <p className="text-xs font-medium">{isDark ? 'Dark Mode' : 'Light Mode'}</p>
                  <p className="text-[9px]" style={{ color: t.textMuted }}>Toggle between dark and light appearance</p>
                </div>
              </div>
              <ToggleSwitch value={isDark} onChange={() => toggle()} />
            </div>

            {/* Glass Effect */}
            <div>
              <p className="text-[10px] font-medium mb-2">Glass Intensity</p>
              <p className="text-[9px] mb-2" style={{ color: t.textMuted }}>
                Control the frosted glass blur effect throughout the interface
              </p>
              <div className="flex gap-2">
                {(['subtle', 'medium', 'heavy'] as const).map(g => (
                  <button
                    key={g}
                    onClick={() => setGlass(g)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-medium capitalize transition-all"
                    style={{
                      background: glassLevel === g ? `${t.accent}18` : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                      color: glassLevel === g ? t.accent : t.textSecondary,
                      border: `1.5px solid ${glassLevel === g ? t.accent : t.cardBorder}`,
                    }}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Accent Color */}
            <div>
              <p className="text-[10px] font-medium mb-2">Accent Color</p>
              <p className="text-[9px] mb-2" style={{ color: t.textMuted }}>
                Choose a highlight color for buttons, links, and active elements
              </p>
              <div className="flex gap-2.5 flex-wrap">
                {ACCENTS.map(c => (
                  <button
                    key={c}
                    onClick={() => setAccent(c)}
                    className="w-9 h-9 rounded-full transition-all"
                    style={{
                      background: c,
                      border: accentColor === c ? '3px solid white' : '2px solid transparent',
                      transform: accentColor === c ? 'scale(1.15)' : 'scale(1)',
                      boxShadow: accentColor === c ? `0 0 14px ${c}55` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Font Size */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-xs font-bold">Text Size</p>
            <div className="flex gap-2">
              {[
                { key: 'small' as const, label: 'S', desc: 'Small' },
                { key: 'medium' as const, label: 'M', desc: 'Medium' },
                { key: 'large' as const, label: 'L', desc: 'Large' },
                { key: 'xlarge' as const, label: 'XL', desc: 'Extra Large' },
              ].map(size => (
                <button
                  key={size.key}
                  onClick={() => setFontSize(size.key)}
                  className="flex-1 py-3 rounded-xl text-center transition-all"
                  style={{
                    background: fontSize === size.key ? `${t.accent}15` : 'transparent',
                    border: `1.5px solid ${fontSize === size.key ? t.accent : t.cardBorder}`,
                  }}
                >
                  <p
                    className="font-bold mb-0.5"
                    style={{
                      color: fontSize === size.key ? t.accent : t.text,
                      fontSize: size.key === 'small' ? 12 : size.key === 'medium' ? 14 : size.key === 'large' ? 16 : 18,
                    }}
                  >
                    {size.label}
                  </p>
                  <p className="text-[8px]" style={{ color: t.textMuted }}>{size.desc}</p>
                </button>
              ))}
            </div>
            {/* Preview */}
            <div className="p-3 rounded-xl" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
              <p
                className="font-medium"
                style={{
                  fontSize: fontSize === 'small' ? 11 : fontSize === 'medium' ? 13 : fontSize === 'large' ? 15 : 17,
                }}
              >
                Preview: This is how your text will appear across Datore.
              </p>
            </div>
          </div>

          {/* Layout Preferences */}
          <div className="rounded-2xl p-4 space-y-3" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-xs font-bold">Layout</p>
            {[
              { label: 'Compact Mode', desc: 'Reduce spacing to show more content', value: compactMode, set: setCompactMode, icon: '📐' },
              { label: 'Autoplay Videos', desc: 'Play video previews automatically in feed', value: autoplayVideos, set: setAutoplayVideos, icon: '▶️' },
              { label: 'Link Previews', desc: 'Show thumbnail previews for shared links', value: showPreviews, set: setShowPreviews, icon: '🖼️' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between gap-3 py-1">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="text-xs font-medium">{item.label}</p>
                    <p className="text-[9px]" style={{ color: t.textMuted }}>{item.desc}</p>
                  </div>
                </div>
                <ToggleSwitch value={item.value} onChange={item.set} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACCESSIBILITY TAB */}
      {activeTab === 'accessibility' && (
        <div className="space-y-3">
          {/* Key Accessibility Notice */}
          <div
            className="rounded-2xl p-4"
            style={{ background: `${t.accent}08`, border: `1px solid ${t.accent}15` }}
          >
            <p className="text-xs font-bold mb-1" style={{ color: t.accent }}>
              Accessibility Commitment
            </p>
            <p className="text-[10px]" style={{ color: t.textSecondary }}>
              Datore is committed to making the platform accessible to everyone. These settings help customize your experience. If you encounter accessibility barriers, please contact our support team.
            </p>
          </div>

          <div className="rounded-2xl p-4 space-y-3" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-xs font-bold">Visual Adjustments</p>
            {[
              { label: 'Reduce Motion', desc: 'Minimize animations and transitions throughout the app', value: reduceMotion, set: setReduceMotion, icon: '🎞️' },
              { label: 'High Contrast', desc: 'Increase contrast between text and backgrounds', value: highContrast, set: setHighContrast, icon: '🔲' },
              { label: 'Screen Reader Optimized', desc: 'Enhance compatibility with VoiceOver, TalkBack, and NVDA', value: screenReaderMode, set: setScreenReaderMode, icon: '🗣️' },
              { label: 'Larger Touch Targets', desc: 'Make buttons and interactive elements larger for easier tapping', value: largeButtons, set: setLargeButtons, icon: '👆' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between gap-3 py-1">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="text-xs font-medium">{item.label}</p>
                    <p className="text-[9px]" style={{ color: t.textMuted }}>{item.desc}</p>
                  </div>
                </div>
                <ToggleSwitch value={item.value} onChange={item.set} />
              </div>
            ))}
          </div>

          <div className="rounded-2xl p-4 space-y-3" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-xs font-bold">Media & Content</p>
            {[
              { label: 'Auto-Captions', desc: 'Show captions on videos when available', value: captionsEnabled, set: setCaptionsEnabled, icon: '💬' },
              { label: 'Keyboard Navigation', desc: 'Navigate the entire app using keyboard shortcuts', value: keyboardNav, set: setKeyboardNav, icon: '⌨️' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between gap-3 py-1">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <span className="text-lg">{item.icon}</span>
                  <div>
                    <p className="text-xs font-medium">{item.label}</p>
                    <p className="text-[9px]" style={{ color: t.textMuted }}>{item.desc}</p>
                  </div>
                </div>
                <ToggleSwitch value={item.value} onChange={item.set} />
              </div>
            ))}
          </div>

          {/* Keyboard Shortcuts Guide */}
          {keyboardNav && (
            <div className="rounded-2xl p-4" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
              <p className="text-xs font-bold mb-2">Keyboard Shortcuts</p>
              <div className="space-y-1.5">
                {[
                  { keys: 'G + H', action: 'Go to Home feed' },
                  { keys: 'G + P', action: 'Go to Profile' },
                  { keys: 'G + S', action: 'Go to Settings' },
                  { keys: 'G + J', action: 'Go to Jobplace' },
                  { keys: 'N', action: 'New post' },
                  { keys: '/', action: 'Focus search bar' },
                  { keys: 'Esc', action: 'Close modal / Go back' },
                ].map(shortcut => (
                  <div key={shortcut.keys} className="flex items-center gap-3">
                    <div
                      className="flex gap-1"
                    >
                      {shortcut.keys.split(' + ').map((k, i) => (
                        <span key={i}>
                          <span
                            className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold"
                            style={{
                              background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                              border: `1px solid ${t.cardBorder}`,
                            }}
                          >
                            {k}
                          </span>
                          {i < shortcut.keys.split(' + ').length - 1 && (
                            <span className="text-[8px] mx-0.5" style={{ color: t.textMuted }}>+</span>
                          )}
                        </span>
                      ))}
                    </div>
                    <p className="text-[10px]" style={{ color: t.textSecondary }}>{shortcut.action}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* LANGUAGE TAB */}
      {activeTab === 'language' && (
        <div className="space-y-3">
          {/* Interface Language */}
          <div className="rounded-2xl p-4" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-xs font-bold mb-1">Interface Language</p>
            <p className="text-[10px] mb-3" style={{ color: t.textMuted }}>
              Choose the language for menus, buttons, and system text.
            </p>
            <div className="space-y-1.5">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
                  style={{
                    background: language === lang.code ? `${t.accent}10` : 'transparent',
                    border: `1.5px solid ${language === lang.code ? t.accent : t.cardBorder}`,
                  }}
                >
                  <span className="text-lg">{lang.flag}</span>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-medium">{lang.label}</p>
                    <p className="text-[9px]" style={{ color: t.textMuted }}>{lang.native}</p>
                  </div>
                  {language === lang.code && (
                    <span className="text-xs" style={{ color: t.accent }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Content Languages */}
          <div className="rounded-2xl p-4" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-xs font-bold mb-1">Content Languages</p>
            <p className="text-[10px] mb-3" style={{ color: t.textMuted }}>
              Select which languages you want to see in your feed. Posts in other languages can be auto-translated.
            </p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {languages.map(lang => (
                <button
                  key={lang.code}
                  onClick={() =>
                    setContentLanguages(prev =>
                      prev.includes(lang.code)
                        ? prev.filter(l => l !== lang.code)
                        : [...prev, lang.code]
                    )
                  }
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all"
                  style={{
                    background: contentLanguages.includes(lang.code) ? `${t.accent}15` : 'transparent',
                    border: `1.5px solid ${contentLanguages.includes(lang.code) ? t.accent : t.cardBorder}`,
                    color: contentLanguages.includes(lang.code) ? t.accent : t.textMuted,
                  }}
                >
                  <span>{lang.flag}</span>
                  {lang.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between py-2" style={{ borderTop: `1px solid ${t.cardBorder}` }}>
              <div>
                <p className="text-xs font-medium">Auto-Translate Posts</p>
                <p className="text-[9px]" style={{ color: t.textMuted }}>
                  Automatically translate posts not in your selected languages
                </p>
              </div>
              <ToggleSwitch value={autoTranslate} onChange={setAutoTranslate} />
            </div>
          </div>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
