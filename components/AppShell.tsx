'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface AppShellProps {
  children: React.ReactNode;
  requireCoordinator?: boolean;
}

// ─── Mobile gate — shown to logged-in users on narrow screens ─────────────────
function MobileGate() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#080808',
      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
      backgroundSize: '28px 28px',
      padding: '40px 24px',
      textAlign: 'center',
      fontFamily: "'Space Grotesk', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Radial glow */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(40,40,40,0.9) 0%, transparent 70%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 340 }}>
        {/* Logo pill */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 999, padding: '8px 18px',
          marginBottom: 40,
        }}>
          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>✦</span>
          <span style={{ color: '#fff', fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>VolunteerIQ</span>
        </div>

        {/* Icon */}
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 28px',
          fontSize: 32,
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          🖥️
        </div>

        <h1 style={{
          fontSize: 26, fontWeight: 700, color: '#fff',
          lineHeight: 1.25, margin: '0 0 16px',
          letterSpacing: '-0.02em',
        }}>
          Open on a laptop
        </h1>

        <p style={{
          fontSize: 15, color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.7, margin: '0 0 32px',
        }}>
          The VolunteerIQ Command Center is built for desktop. For the best experience, open this link on a laptop or desktop computer with a screen width of 1024px or wider.
        </p>

        {/* Stats row */}
        <div style={{
          display: 'flex', gap: 0, justifyContent: 'center',
          borderTop: '1px solid rgba(255,255,255,0.07)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          padding: '20px 0', marginBottom: 28,
        }}>
          {[
            { val: '94%',    label: 'AI Accuracy' },
            { val: '<20m',   label: 'Avg Dispatch' },
            { val: '1,400+', label: 'Volunteers' },
          ].map((s, i) => (
            <div key={s.label} style={{
              flex: 1,
              borderRight: i < 2 ? '1px solid rgba(255,255,255,0.07)' : 'none',
              padding: '0 12px',
            }}>
              <p style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 18, fontWeight: 500, color: '#fff',
                margin: '0 0 4px',
              }}>{s.val}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', margin: 0, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        <p style={{
          fontSize: 11, color: 'rgba(255,255,255,0.2)',
          letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          Your account is ready — just switch to desktop
        </p>
      </div>
    </div>
  );
}

export default function AppShell({ children, requireCoordinator = false }: AppShellProps) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Detect narrow viewport
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && user && requireCoordinator && userProfile?.role !== 'coordinator') {
      router.push('/volunteer');
    }
  }, [user, userProfile, loading, requireCoordinator, router]);

  if (!mounted || loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--bg-base)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return null;

  // Show mobile gate for logged-in users on small screens
  if (isMobile) {
    return <MobileGate />;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      <Navbar />
      <div style={{ display: 'flex', minHeight: 'calc(100vh - 64px)' }}>
        <Sidebar />
        <main
          className="page-enter"
          style={{
            marginLeft: '220px',
            flex: 1,
            padding: '32px 40px',
            minHeight: 'calc(100vh - 64px)',
            overflowY: 'auto',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
