"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { getTheme } from '@/lib/theme';
import { getSavedItems } from '@/lib/supabase';

type SavedTab = 'all' | 'post' | 'listing' | 'job' | 'reel';

export default function SavedPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const { user } = useAuthStore();
  const t = getTheme(isDark, glassLevel, accentColor);
  const [tab, setTab] = useState<SavedTab>('all');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSaved();
  }, [user]);

  const fetchSaved = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await getSavedItems(user.id);
      setItems(data || []);
    } catch {
      setItems([]);
    }
    setLoading(false);
  };

  const filteredItems = tab === 'all' ? items : items.filter(i => i.target_type === tab);

  const typeIcon: Record<string, string> = {
    post: '📝',
    listing: '🛒',
    job: '💼',
    reel: '🎬',
  };

  const typeLabel: Record<string, string> = {
    post: 'Post',
    listing: 'Listing',
    job: 'Job',
    reel: 'Reel',
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleItemClick = (item: any) => {
    switch (item.target_type) {
      case 'post': router.push('/home'); break;
      case 'listing': router.push(`/marketplace`); break;
      case 'job': router.push(`/jobplace`); break;
      case 'reel': router.push('/reels'); break;
      default: break;
    }
  };

  const tabs: { key: SavedTab; label: string; icon: string }[] = [
    { key: 'all', label: 'All', icon: '📌' },
    { key: 'post', label: 'Posts', icon: '📝' },
    { key: 'listing', label: 'Listings', icon: '🛒' },
    { key: 'job', label: 'Jobs', icon: '💼' },
    { key: 'reel', label: 'Reels', icon: '🎬' },
  ];

  const countByType = (type: string) => items.filter(i => i.target_type === type).length;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-lg">{'<-'}</button>
        <h1 className="text-xl font-bold">💾 Saved</h1>
        <span className="text-[10px] px-2.5 py-1 rounded-full ml-auto" style={{ background: t.accentLight, color: t.accent }}>
          {items.length} items
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-0.5 rounded-xl overflow-x-auto" style={{ background: t.card, scrollbarWidth: 'none' }}>
        {tabs.map(tb => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className="flex-1 py-2 rounded-lg text-[9px] font-semibold whitespace-nowrap px-2"
            style={{
              background: tab === tb.key ? t.accent : 'transparent',
              color: tab === tb.key ? '#fff' : t.textMuted,
            }}
          >
            {tb.icon} {tb.label} {tb.key !== 'all' ? `(${countByType(tb.key)})` : `(${items.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 glass-card rounded-2xl" style={{ background: t.card, borderColor: t.cardBorder }}>
          <p className="text-sm" style={{ color: t.textSecondary }}>Loading saved items...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-2xl" style={{ background: t.card, borderColor: t.cardBorder }}>
          <p className="text-3xl mb-3">💾</p>
          <p style={{ color: t.textSecondary }}>
            {!user ? 'Sign in to see your saved items' : tab === 'all' ? 'No saved items yet' : `No saved ${typeLabel[tab]?.toLowerCase() || 'items'}`}
          </p>
          <p className="text-xs mt-2" style={{ color: t.textMuted }}>
            Bookmark posts, listings, and jobs to find them here
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => handleItemClick(item)}
              className="glass-card rounded-xl p-3.5 flex items-center gap-3 cursor-pointer"
              style={{ background: t.card, borderColor: t.cardBorder }}
            >
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg,${t.accent}22,#8b5cf622)`,
                }}
              >
                {typeIcon[item.target_type] || '📌'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[8px] px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      background: t.accentLight,
                      color: t.accent,
                    }}
                  >
                    {typeLabel[item.target_type] || 'Item'}
                  </span>
                  <span className="text-[10px]" style={{ color: t.textMuted }}>
                    {item.created_at ? formatDate(item.created_at) : ''}
                  </span>
                </div>
                <p className="text-xs mt-1 truncate" style={{ color: t.textSecondary }}>
                  ID: {item.target_id ? item.target_id.slice(0, 8) + '...' : 'Unknown'}
                </p>
              </div>
              <span className="text-xs" style={{ color: t.textMuted }}>{'>'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
