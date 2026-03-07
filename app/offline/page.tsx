'use client';

export default function OfflinePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(180deg, #0a0a16 0%, #0f0f1e 30%, #121225 100%)',
      color: '#e2e8f0',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      textAlign: 'center',
      padding: '2rem',
    }}>
      <div style={{ maxWidth: 420 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0 1 22.56 9" />
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: 8 }}>
          You&apos;re Offline
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: 24, lineHeight: 1.6 }}>
          It looks like you&apos;ve lost your internet connection.
          Some features may still be available from cache.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '14px 32px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white',
            border: 'none',
            borderRadius: 14,
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'transform 0.2s ease',
          }}
          onMouseDown={(e) => ((e.target as HTMLElement).style.transform = 'scale(0.97)')}
          onMouseUp={(e) => ((e.target as HTMLElement).style.transform = 'scale(1)')}
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
