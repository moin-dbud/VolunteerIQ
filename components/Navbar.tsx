'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, Settings } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/report', label: 'Report' },
  { href: '/volunteer', label: 'Volunteer' },
  { href: '/ai-insights', label: 'AI Insights' },
];

export default function Navbar() {
  const pathname = usePathname();
  const { userProfile, logOut } = useAuth();
  const isCoordinator = userProfile?.role === 'coordinator';

  const initials = userProfile?.name
    ? userProfile.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <header
      style={{
        background: 'rgba(13, 13, 20, 0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-default)',
        height: '64px',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
      }}
    >
      {/* Left: Logo */}
      <span
        style={{
          fontFamily: 'Space Grotesk, sans-serif',
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          letterSpacing: '-0.02em',
        }}
      >
        VolunteerIQ
      </span>

      {/* Center: Nav Links (coordinator only) */}
      {isCoordinator && (
        <nav style={{ display: 'flex', gap: '4px' }}>
          {navLinks.map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                style={{
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                  padding: '8px 14px',
                  textDecoration: 'none',
                  borderBottom: isActive
                    ? '2px solid var(--accent-primary)'
                    : '2px solid transparent',
                  transition: 'color 0.15s ease',
                }}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      )}

      {/* Right: Search + Icons + Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Search bar */}
        <div style={{ position: 'relative' }}>
          <Search
            size={15}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Search..."
            readOnly
            style={{
              width: '240px',
              height: '36px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              borderRadius: '18px',
              paddingLeft: '36px',
              paddingRight: '12px',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '13px',
              color: 'var(--text-muted)',
              outline: 'none',
              cursor: 'default',
            }}
          />
        </div>

        {/* Bell */}
        <button
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Bell size={20} />
        </button>

        {/* Settings → role-aware navigation */}
        <Link
          href={isCoordinator ? '/settings/coordinator' : '/settings/volunteer'}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
          }}
          title="Settings"
        >
          <Settings size={20} />
        </Link>

        {/* Avatar */}
        <button
          onClick={logOut}
          title="Click to sign out"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: 'var(--accent-primary)',
            color: 'white',
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {initials}
        </button>
      </div>
    </header>
  );
}
