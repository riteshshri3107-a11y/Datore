"use client";
export const dynamic = "force-dynamic";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack } from '@/components/Icons';

interface ActivityItem {
  id: string;
  type: string;
  title: string;
  desc: string;
  time: string;
  icon: string;
  category: string;
}

export default function ActivityDataPage() {
  const router = useRouter();
  const { isDark, glassLevel, accentColor } = useThemeStore();
  const t = getTheme(isDark, glassLevel, accentColor);

  const [activeTab, setActiveTab] = useState<'timeline' | 'data' | 'storage'>('timeline');
  const [activityFilter, setActivityFilter] = useState('all');

  const [activities] = useState<ActivityItem[]>([
    { id: 'a1', type: 'post', title: 'Created a new post', desc: 'Shared an update about AARNAIT AI robotics program launch', time: '2 hours ago', icon: '📝', category: 'social' },
    { id: 'a2', type: 'job', title: 'Posted a new job', desc: 'House Cleaner Needed - Brampton, $35/hr', time: '5 hours ago', icon: '💼', category: 'jobs' },
    { id: 'a3', type: 'listing', title: 'Listed an item for sale', desc: 'Used MacBook Pro 2023 - $1,200', time: '1 day ago', icon: '🛍️', category: 'marketplace' },
    { id: 'a4', type: 'review', title: 'Left a review', desc: 'Gave 5 stars to Sarah Chen for babysitting', time: '2 days ago', icon: '⭐', category: 'reviews' },
    { id: 'a5', type: 'profile', title: 'Updated profile picture', desc: 'Changed your Professional avatar', time: '3 days ago', icon: '📷', category: 'account' },
    { id: 'a6', type: 'message', title: 'Started a conversation', desc: 'Messaged Priya Sharma about cleaning job', time: '4 days ago', icon: '💬', category: 'social' },
    { id: 'a7', type: 'community', title: 'Joined a community', desc: 'Toronto Dog Walkers - 127 members', time: '5 days ago', icon: '👥', category: 'social' },
    { id: 'a8', type: 'payment', title: 'Received payment', desc: '$45.00 CAD from Tom Wilson for house cleaning', time: '1 week ago', icon: '💰', category: 'payments' },
    { id: 'a9', type: 'login', title: 'Logged in from new device', desc: 'iPhone 15, Safari Mobile, Toronto ON', time: '1 week ago', icon: '📱', category: 'account' },
    { id: 'a10', type: 'setting', title: 'Changed privacy settings', desc: 'Turned off search engine indexing', time: '2 weeks ago', icon: '🔒', category: 'account' },
    { id: 'a11', type: 'hire', title: 'Hired a worker', desc: 'Booked Priya Sharma for cleaning on Mar 5', time: '2 weeks ago', icon: '🤝', category: 'jobs' },
    { id: 'a12', type: 'reaction', title: 'Reacted to a post', desc: 'Loved Maria Santos\'s community event photo', time: '3 weeks ago', icon: '❤️', category: 'social' },
  ]);

  const categories = [
    { key: 'all', label: 'All Activity' },
    { key: 'social', label: 'Social' },
    { key: 'jobs', label: 'Jobs' },
    { key: 'marketplace', label: 'Marketplace' },
    { key: 'payments', label: 'Payments' },
    { key: 'account', label: 'Account' },
  ];

  const filteredActivities = activityFilter === 'all'
    ? activities
    : activities.filter(a => a.category === activityFilter);

  // Storage breakdown
  const storageItems = [
    { label: 'Photos & Videos', size: '234 MB', pct: 45, color: '#6366f1' },
    { label: 'Messages & Chats', size: '89 MB', pct: 17, color: '#ec4899' },
    { label: 'Posts & Comments', size: '56 MB', pct: 11, color: '#22c55e' },
    { label: 'Job Documents', size: '43 MB', pct: 8, color: '#f59e0b' },
    { label: 'Profile Data', size: '12 MB', pct: 2, color: '#3b82f6' },
    { label: 'Cache & Temp', size: '87 MB', pct: 17, color: '#9ca3af' },
  ];
  const totalStorage = '521 MB';

  const tabs = [
    { key: 'timeline' as const, label: 'Activity Log', icon: '📋' },
    { key: 'data' as const, label: 'Your Data', icon: '📦' },
    { key: 'storage' as const, label: 'Storage', icon: '💾' },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push('/settings')} style={{ background: 'none', border: 'none', color: t.text, cursor: 'pointer' }}>
          <IcoBack size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">Activity & Data</h1>
          <p className="text-[10px]" style={{ color: t.textMuted }}>
            Review your activity history and manage your data
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

      {/* TIMELINE TAB */}
      {activeTab === 'timeline' && (
        <div className="space-y-3">
          {/* Category Filters */}
          <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {categories.map(cat => (
              <button
                key={cat.key}
                onClick={() => setActivityFilter(cat.key)}
                className="px-3 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all"
                style={{
                  background: activityFilter === cat.key ? `${t.accent}15` : 'transparent',
                  color: activityFilter === cat.key ? t.accent : t.textMuted,
                  border: `1px solid ${activityFilter === cat.key ? `${t.accent}30` : 'transparent'}`,
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Activity Timeline */}
          <div className="rounded-2xl p-4" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            {filteredActivities.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-2xl mb-2">📭</p>
                <p className="text-xs font-medium">No activity in this category</p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div
                  className="absolute left-[15px] top-4 bottom-4 w-[2px]"
                  style={{ background: t.cardBorder }}
                />
                <div className="space-y-0">
                  {filteredActivities.map((activity, idx) => (
                    <div key={activity.id} className="flex items-start gap-3 py-3 relative">
                      {/* Timeline dot */}
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 relative z-10"
                        style={{ background: t.card, border: `2px solid ${t.accent}40` }}
                      >
                        {activity.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold">{activity.title}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: t.textSecondary }}>{activity.desc}</p>
                        <p className="text-[9px] mt-1" style={{ color: t.textMuted }}>{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DATA TAB */}
      {activeTab === 'data' && (
        <div className="space-y-3">
          {/* Download Your Data */}
          <div className="rounded-2xl p-4" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-xs font-bold mb-1">Download Your Data</p>
            <p className="text-[10px] mb-3" style={{ color: t.textMuted }}>
              Get a copy of everything you have shared on Datore. Your data package includes your profile information, posts, messages, job history, reviews, and transaction records.
            </p>

            <div className="space-y-2 mb-4">
              {[
                { label: 'Profile Information', desc: 'Name, bio, skills, location, contact details', icon: '👤', size: '12 KB' },
                { label: 'Posts & Comments', desc: 'All your social posts, comments, and reactions', icon: '📝', size: '56 MB' },
                { label: 'Messages', desc: 'Chat conversations with other users', icon: '💬', size: '89 MB' },
                { label: 'Job History', desc: 'Posted jobs, applications, and completion records', icon: '💼', size: '23 MB' },
                { label: 'Marketplace Listings', desc: 'Items you have listed, bought, or sold', icon: '🛍️', size: '34 MB' },
                { label: 'Reviews & Ratings', desc: 'Reviews you have given and received', icon: '⭐', size: '8 KB' },
                { label: 'Payment History', desc: 'Transaction records and wallet activity', icon: '💰', size: '15 KB' },
                { label: 'Photos & Media', desc: 'All uploaded images and videos', icon: '📷', size: '234 MB' },
              ].map(item => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
                >
                  <span className="text-lg">{item.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium">{item.label}</p>
                    <p className="text-[9px]" style={{ color: t.textMuted }}>{item.desc}</p>
                  </div>
                  <span className="text-[9px] font-mono shrink-0" style={{ color: t.textMuted }}>{item.size}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                className="py-3 rounded-xl text-xs font-bold text-white"
                style={{ background: t.accent }}
              >
                Download All (JSON)
              </button>
              <button
                className="py-3 rounded-xl text-xs font-bold"
                style={{ background: `${t.accent}12`, color: t.accent }}
              >
                Download All (CSV)
              </button>
            </div>
          </div>

          {/* Data Retention */}
          <div className="rounded-2xl p-4" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-xs font-bold mb-2">Data Retention Policy</p>
            {[
              { label: 'Messages', retention: 'Kept until you delete them', icon: '💬' },
              { label: 'Posts', retention: 'Kept until you delete them', icon: '📝' },
              { label: 'Job Records', retention: 'Kept for 7 years (legal requirement)', icon: '💼' },
              { label: 'Payment Records', retention: 'Kept for 7 years (tax compliance)', icon: '💰' },
              { label: 'Login History', retention: 'Kept for 90 days', icon: '🔑' },
              { label: 'Search History', retention: 'Kept for 30 days', icon: '🔍' },
            ].map(item => (
              <div
                key={item.label}
                className="flex items-center gap-2 py-2"
                style={{ borderTop: `1px solid ${t.cardBorder}` }}
              >
                <span className="text-sm">{item.icon}</span>
                <p className="text-[10px] font-medium flex-1">{item.label}</p>
                <p className="text-[9px]" style={{ color: t.textMuted }}>{item.retention}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STORAGE TAB */}
      {activeTab === 'storage' && (
        <div className="space-y-3">
          <div className="rounded-2xl p-4" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-bold">Storage Used</p>
                <p className="text-[9px]" style={{ color: t.textMuted }}>
                  {totalStorage} of 2 GB used
                </p>
              </div>
              <p className="text-lg font-bold" style={{ color: t.accent }}>26%</p>
            </div>

            {/* Storage Bar */}
            <div className="w-full h-4 rounded-full overflow-hidden flex mb-4" style={{ background: isDark ? '#1a1a2e' : '#e5e7eb' }}>
              {storageItems.map(item => (
                <div
                  key={item.label}
                  className="h-full"
                  style={{ width: `${item.pct}%`, background: item.color }}
                  title={`${item.label}: ${item.size}`}
                />
              ))}
            </div>

            {/* Breakdown */}
            <div className="space-y-2">
              {storageItems.map(item => (
                <div key={item.label} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ background: item.color }} />
                  <p className="text-[11px] font-medium flex-1">{item.label}</p>
                  <p className="text-[10px]" style={{ color: t.textMuted }}>{item.size}</p>
                  <p className="text-[10px] font-bold w-8 text-right" style={{ color: t.textSecondary }}>{item.pct}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* Clear Data Actions */}
          <div className="rounded-2xl p-4 space-y-2" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <p className="text-xs font-bold mb-1">Free Up Space</p>
            {[
              { label: 'Clear Cache & Temp Files', size: '87 MB', color: '#9ca3af' },
              { label: 'Clear Search History', size: '2 MB', color: '#3b82f6' },
              { label: 'Remove Old Message Attachments', size: '45 MB', color: '#ec4899' },
            ].map(action => (
              <div
                key={action.label}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}
              >
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: action.color }} />
                <div className="flex-1">
                  <p className="text-[11px] font-medium">{action.label}</p>
                  <p className="text-[9px]" style={{ color: t.textMuted }}>Frees up ~{action.size}</p>
                </div>
                <button
                  className="text-[10px] px-3 py-1 rounded-lg font-medium"
                  style={{ background: `${t.accent}12`, color: t.accent }}
                >
                  Clear
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="h-4" />
    </div>
  );
}
