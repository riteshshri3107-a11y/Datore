"use client";
export const dynamic = "force-dynamic";
import { useRouter } from 'next/navigation';
import { useThemeStore } from '@/store/useThemeStore';
import { getTheme } from '@/lib/theme';
import { IcoBack } from '@/components/Icons';

const SECTIONS = [
  { title: 'Acceptance of Terms', content: 'By accessing or using Datore ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Platform. We may update these terms from time to time — continued use constitutes acceptance of any changes.' },
  { title: 'Eligibility', content: 'You must be at least 16 years of age to use Datore. By creating an account, you represent that you meet this requirement and that all information you provide is accurate and complete.' },
  { title: 'Account Responsibilities', content: 'You are responsible for maintaining the confidentiality of your login credentials and for all activities under your account. Notify us immediately if you suspect unauthorized access. Datore is not liable for losses arising from unauthorized use of your account.' },
  { title: 'User Content', content: 'You retain ownership of content you post on Datore. By posting, you grant Datore a non-exclusive, worldwide, royalty-free license to use, display, and distribute your content within the Platform. You must not post content that is illegal, harmful, threatening, abusive, defamatory, or infringes on intellectual property rights.' },
  { title: 'Prohibited Conduct', content: 'You agree not to: use the Platform for unlawful purposes; harass, bully, or impersonate others; distribute spam, malware, or unauthorized advertising; attempt to gain unauthorized access to other accounts or systems; scrape or collect data without permission; circumvent security or rate-limiting measures.' },
  { title: 'Job & Service Marketplace', content: 'Datore facilitates connections between service providers and seekers. We do not guarantee the quality, safety, or legality of services offered. Users engage with providers at their own risk. Background verification features are provided as tools, not guarantees.' },
  { title: 'Payments & Wallet', content: 'Financial transactions on Datore are processed through third-party payment providers. Datore is not a bank or financial institution. Wallet balances are subject to the terms of our payment partners. Refund policies vary by transaction type.' },
  { title: 'Privacy & Data', content: 'Your use of Datore is also governed by our Privacy Policy. We collect and process data in accordance with PIPEDA (Canada) and applicable privacy regulations. Visit our Privacy Center for full details on data handling.' },
  { title: 'Intellectual Property', content: 'All Datore branding, designs, features, and technology are owned by Datore Inc. You may not copy, modify, distribute, or reverse-engineer any part of the Platform without written permission.' },
  { title: 'Limitation of Liability', content: 'Datore is provided "as is" without warranties of any kind. To the maximum extent permitted by law, Datore Inc. shall not be liable for indirect, incidental, special, or consequential damages arising from your use of the Platform.' },
  { title: 'Termination', content: 'We may suspend or terminate your account at any time for violations of these terms or for any reason with reasonable notice. Upon termination, your right to use the Platform ceases immediately. You may request data export before account deletion.' },
  { title: 'Dispute Resolution', content: 'Any disputes arising from these terms shall be resolved through binding arbitration in Toronto, Ontario, Canada, under the rules of the ADR Institute of Canada. You agree to waive any right to participate in class-action lawsuits.' },
  { title: 'Contact', content: 'For questions about these Terms of Service, contact us at legal@datore.app or write to: Datore Inc., Toronto, ON, Canada.' },
];

export default function TermsOfService() {
  const router = useRouter();
  const { isDark } = useThemeStore();
  const t = getTheme(isDark);

  return (
    <div className="space-y-4 animate-fade-in pb-10 max-w-lg mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: t.card }}>
          <IcoBack size={18} color={t.textMuted} />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">Terms of Service</h1>
          <p className="text-xs" style={{ color: t.textMuted }}>Last updated: March 1, 2026</p>
        </div>
      </div>

      <div className="rounded-xl p-4" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
        <p className="text-xs" style={{ color: t.textSecondary }}>
          Welcome to Datore. These Terms of Service govern your access to and use of the Datore platform, including all features, content, and services. Please read them carefully.
        </p>
      </div>

      <div className="space-y-3">
        {SECTIONS.map((section, i) => (
          <div key={i} className="rounded-xl p-4" style={{ background: t.card, border: `1px solid ${t.cardBorder}` }}>
            <h3 className="text-sm font-bold mb-2">{i + 1}. {section.title}</h3>
            <p className="text-[11px] leading-relaxed" style={{ color: t.textSecondary }}>{section.content}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 justify-center pt-2">
        {['PIPEDA Compliant', 'GDPR Compliant', 'Arbitration'].map(b => (
          <span key={b} className="px-3 py-1.5 rounded-lg text-[9px] font-semibold" style={{ background: t.card, border: `1px solid ${t.cardBorder}`, color: t.textSecondary }}>{b}</span>
        ))}
      </div>
    </div>
  );
}
