/* ═══════════════════════════════════════════════════════════════
   AuthGuard — Route Protection Component
   ═══════════════════════════════════════════════════════════════
   Wraps protected pages. Redirects to /login if not authenticated.
   Optional role check for admin/moderator pages.
   Shows loading skeleton while checking auth.
   ═══════════════════════════════════════════════════════════════ */
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/useAuth';
import type { UserRole } from '@/lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6 max-w-4xl mx-auto">
      <div className="h-8 w-48 rounded-xl" style={{background:'rgba(99,102,241,0.08)'}} />
      <div className="h-4 w-full rounded-lg" style={{background:'rgba(255,255,255,0.04)'}} />
      <div className="h-4 w-3/4 rounded-lg" style={{background:'rgba(255,255,255,0.04)'}} />
      <div className="grid grid-cols-3 gap-4 mt-6">
        {[1,2,3].map(i => (
          <div key={i} className="h-32 rounded-2xl" style={{background:'rgba(255,255,255,0.03)'}} />
        ))}
      </div>
      <div className="h-48 rounded-2xl mt-4" style={{background:'rgba(255,255,255,0.03)'}} />
    </div>
  );
}

export default function AuthGuard({ children, requiredRole, fallback }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Store intended destination for redirect after login
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('auth_redirect', window.location.pathname);
      }
      router.replace('/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Still loading — show skeleton
  if (isLoading) return fallback || <LoadingSkeleton />;

  // Not authenticated — will redirect
  if (!isAuthenticated) return fallback || <LoadingSkeleton />;

  // Role check
  if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-lg font-bold mb-2">Access Denied</h2>
        <p className="text-sm opacity-60 mb-4">
          You need <strong>{requiredRole}</strong> permissions to access this page.
        </p>
        <button
          onClick={() => router.push('/home')}
          className="btn-accent text-sm"
        >
          Go Home
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
