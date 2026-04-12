'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  AlertTriangle,
  Users,
  Brain,
  Map,
  Radio,
  Zap,
  Settings,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useState } from 'react';
import BroadcastModal from './BroadcastModal';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, coordinatorOnly: true },
  { href: '/report', label: 'Report Issue', icon: AlertTriangle, coordinatorOnly: false },
  { href: '/volunteer', label: 'Volunteer Portal', icon: Users, coordinatorOnly: false },
  { href: '/ai-insights', label: 'AI Insights', icon: Brain, coordinatorOnly: true },
  { href: '/map', label: 'Map View', icon: Map, coordinatorOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { userProfile } = useAuth();
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const isCoordinator = userProfile?.role === 'coordinator';

  const visibleItems = isCoordinator
    ? navItems
    : navItems.filter((item) => !item.coordinatorOnly);

  return (
    <>
      <aside
        style={{
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-default)',
          width: '220px',
          position: 'fixed',
          left: 0,
          top: '64px',
          bottom: 0,
          padding: '24px 16px',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 40,
          overflowY: 'auto',
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: '32px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '4px',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Zap size={14} color="white" />
            </div>
            <span
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              VolunteerIQ
            </span>
          </div>
          <span
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '10px',
              fontWeight: 500,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              paddingLeft: '38px',
            }}
          >
            COMMAND CENTER
          </span>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {visibleItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + '/');
            return (
              <Link
                key={href}
                href={href}
                className="sidebar-nav-item"
                style={
                  isActive
                    ? {
                        background: 'rgba(147,51,234,0.15)',
                        borderLeft: '3px solid var(--accent-primary)',
                        color: 'var(--accent-primary)',
                      }
                    : {}
                }
              >
                <Icon
                  size={18}
                  color={isActive ? 'var(--accent-primary)' : 'var(--text-secondary)'}
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Settings Link */}
        <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-default)' }}>
          <Link
            href={isCoordinator ? '/settings/coordinator' : '/settings/volunteer'}
            className="sidebar-nav-item"
            style={
              pathname.startsWith('/settings')
                ? { background: 'rgba(147,51,234,0.15)', borderLeft: '3px solid var(--accent-primary)', color: 'var(--accent-primary)' }
                : {}
            }
          >
            <Settings size={18} color={pathname.startsWith('/settings') ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
            <span>Settings</span>
          </Link>
        </div>

        {/* URGENT BROADCAST Button */}
        {isCoordinator && (
          <div style={{ marginTop: '24px' }}>
            <button
              onClick={() => setBroadcastOpen(true)}
              style={{
                background: 'var(--accent-primary)',
                color: 'white',
                width: '100%',
                height: '36px',
                borderRadius: '8px',
                border: 'none',
                fontFamily: 'DM Sans, sans-serif',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLButtonElement).style.background = 'var(--accent-primary-hover)')
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLButtonElement).style.background = 'var(--accent-primary)')
              }
            >
              <Radio size={12} />
              URGENT BROADCAST
            </button>
          </div>
        )}
      </aside>

      {broadcastOpen && <BroadcastModal onClose={() => setBroadcastOpen(false)} />}
    </>
  );
}
