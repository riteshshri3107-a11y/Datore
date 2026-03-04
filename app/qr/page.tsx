"use client";
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

/* CR-03: QR Code Deep-Link Landing Page
   Resolves the 404 error when scanning Datore QR codes.
   Routes: /qr, /qr?user=<id>, /qr?action=verify, /qr?redirect=<path>
   Provides branded fallback instead of 404 for invalid QR URLs. */

export default function QRLandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading'|'redirecting'|'fallback'>('loading');

  useEffect(() => {
    const userId = searchParams.get('user') || searchParams.get('u') || searchParams.get('id');
    const action = searchParams.get('action') || searchParams.get('a');
    const redirect = searchParams.get('redirect') || searchParams.get('r');
    const profile = searchParams.get('profile') || searchParams.get('p');

    // Handle various QR deep-link scenarios
    if (userId) {
      setStatus('redirecting');
      router.replace(`/worker/${userId}`);
      return;
    }

    if (profile) {
      setStatus('redirecting');
      router.replace(`/profile?id=${profile}`);
      return;
    }

    if (action === 'verify' || action === 'scan') {
      setStatus('redirecting');
      router.replace('/qr-verify');
      return;
    }

    if (redirect) {
      setStatus('redirecting');
      // Only allow internal redirects
      const safeRedirect = redirect.startsWith('/') ? redirect : `/${redirect}`;
      router.replace(safeRedirect);
      return;
    }

    // Default: redirect to QR verification page after brief branding display
    setStatus('fallback');
    const timer = setTimeout(() => {
      router.replace('/qr-verify');
    }, 3000);
    return () => clearTimeout(timer);
  }, [searchParams, router]);

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'linear-gradient(135deg,#0c0c16,#1a1a2e)', color:'white', padding:24 }}>
      <div style={{ textAlign:'center', maxWidth:400 }}>
        {/* Datore Branding */}
        <div style={{ width:80, height:80, borderRadius:20, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', boxShadow:'0 4px 30px rgba(99,102,241,0.4)' }}>
          <svg width="32" height="36" viewBox="0 0 16 18" fill="none">
            <path d="M15 8.134a1 1 0 010 1.732l-13 7.5A1 1 0 010 16.5v-15A1 1 0 012 .634l13 7.5z" fill="white"/>
          </svg>
        </div>
        <h1 style={{ fontSize:28, fontWeight:800, marginBottom:8, background:'linear-gradient(135deg,#6366f1,#a78bfa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Datore</h1>

        {status === 'loading' && (
          <>
            <div style={{ width:32, height:32, border:'3px solid rgba(99,102,241,0.3)', borderTopColor:'#6366f1', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'24px auto' }} />
            <p style={{ fontSize:14, opacity:0.7 }}>Verifying QR code...</p>
          </>
        )}

        {status === 'redirecting' && (
          <>
            <div style={{ width:32, height:32, border:'3px solid rgba(34,197,94,0.3)', borderTopColor:'#22c55e', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'24px auto' }} />
            <p style={{ fontSize:14, color:'#22c55e' }}>Redirecting...</p>
          </>
        )}

        {status === 'fallback' && (
          <>
            <p style={{ fontSize:14, opacity:0.7, marginBottom:24 }}>Welcome to Datore! Redirecting you to the app...</p>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <button onClick={() => router.replace('/qr-verify')} style={{ padding:'14px 32px', borderRadius:14, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'white', border:'none', cursor:'pointer', fontSize:14, fontWeight:700 }}>
                Open QR Scanner
              </button>
              <button onClick={() => router.replace('/home')} style={{ padding:'14px 32px', borderRadius:14, background:'rgba(255,255,255,0.08)', color:'white', border:'1px solid rgba(255,255,255,0.1)', cursor:'pointer', fontSize:14, fontWeight:500 }}>
                Go to Home Feed
              </button>
              <button onClick={() => router.replace('/login')} style={{ padding:'14px 32px', borderRadius:14, background:'transparent', color:'rgba(255,255,255,0.5)', border:'none', cursor:'pointer', fontSize:12 }}>
                Sign In / Sign Up
              </button>
            </div>
          </>
        )}

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
