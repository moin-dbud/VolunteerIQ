'use client';

import { useEffect, useState, useRef } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  limit,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Issue, User } from '@/lib/types';
import AppShell from '@/components/AppShell';
import {
  BarChart2,
  AlertTriangle,
  Users,
  CheckCircle2,
  ExternalLink,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import IssueDetailModal from '@/components/IssueDetailModal';
import MapWrapper from '@/components/MapWrapper';

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number>(0);

  useEffect(() => {
    const duration = 800;
    const start = performance.now();
    const from = 0;
    const to = value;

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        ref.current = requestAnimationFrame(animate);
      }
    };

    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);

  return <span>{display.toLocaleString()}</span>;
}

function StatCard({
  label,
  value,
  icon,
  valueColor,
  iconBg,
  iconColor,
  badge,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  valueColor?: string;
  iconBg: string;
  iconColor?: string;
  badge?: React.ReactNode;
}) {
  return (
    <div
      className="card card-hover"
      style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative' }}
    >
      {badge && <div style={{ position: 'absolute', top: '16px', right: '16px' }}>{badge}</div>}
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '8px',
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <div>
        <p className="label-muted" style={{ marginBottom: '4px' }}>
          {label}
        </p>
        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '32px',
            fontWeight: 500,
            color: valueColor || 'var(--text-primary)',
            lineHeight: 1,
          }}
        >
          <AnimatedNumber value={value} />
        </p>
      </div>
    </div>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const p = priority?.toLowerCase();
  if (p === 'high') return <span className="badge-high">HIGH</span>;
  if (p === 'medium') return <span className="badge-medium">MEDIUM</span>;
  if (p === 'low') return <span className="badge-low">LOW</span>;
  if (p === 'urgent') return <span className="badge-urgent">URGENT</span>;
  return <span className="badge-low">{priority || 'N/A'}</span>;
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`status-badge status-${status}`}>
      <span className="status-dot" />
      {status?.toUpperCase()}
    </span>
  );
}

export default function DashboardPage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [recentIssues, setRecentIssues] = useState<Issue[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);

  // Category counts for Impact Distribution
  const categoryCounts = {
    Infrastructure: issues.filter((i) =>
      i.category?.toLowerCase().includes('infra') ||
      i.suggestedCategory?.toLowerCase().includes('infra')
    ).length,
    Environment: issues.filter((i) =>
      i.category?.toLowerCase().includes('env') ||
      i.suggestedCategory?.toLowerCase().includes('env')
    ).length,
    'Public Safety': issues.filter((i) =>
      i.category?.toLowerCase().includes('safety') ||
      i.suggestedCategory?.toLowerCase().includes('safety')
    ).length,
    'Health & Welfare': issues.filter((i) =>
      i.category?.toLowerCase().includes('health') ||
      i.suggestedCategory?.toLowerCase().includes('health')
    ).length,
  };

  const totalIssues = issues.length || 1;

  const catBars = [
    { label: 'Infrastructure', count: categoryCounts.Infrastructure, color: 'var(--cat-infrastructure)' },
    { label: 'Environment', count: categoryCounts.Environment, color: 'var(--cat-environment)' },
    { label: 'Public Safety', count: categoryCounts['Public Safety'], color: 'var(--cat-public-safety)' },
    { label: 'Health & Welfare', count: categoryCounts['Health & Welfare'], color: 'var(--cat-health)' },
  ];

  useEffect(() => {
    // Real-time all issues listener
    const unsubscribeIssues = onSnapshot(collection(db, 'issues'), (snap) => {
      const docs = snap.docs.map((d) => ({ issueId: d.id, ...d.data() } as Issue));
      setIssues(docs);
      setLoading(false);
    });

    // Recent 8 issues ordered by createdAt desc
    const recentQ = query(collection(db, 'issues'), orderBy('createdAt', 'desc'), limit(8));
    const unsubscribeRecent = onSnapshot(recentQ, (snap) => {
      setRecentIssues(snap.docs.map((d) => ({ issueId: d.id, ...d.data() } as Issue)));
    });

    // Volunteers
    const volQ = query(collection(db, 'users'), where('role', '==', 'volunteer'));
    const unsubscribeVols = onSnapshot(volQ, (snap) => {
      setVolunteers(snap.docs.map((d) => d.data() as User));
    });

    return () => {
      unsubscribeIssues();
      unsubscribeRecent();
      unsubscribeVols();
    };
  }, []);

  const pending = issues.filter((i) => i.status === 'pending').length;
  const assigned = issues.filter((i) => i.status === 'assigned').length;
  const completed = issues.filter((i) => i.status === 'completed').length;

  return (
    <AppShell requireCoordinator>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <p className="label-small" style={{ marginBottom: '8px' }}>
          OPERATIONAL OVERVIEW
        </p>
        <h1
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '36px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.2,
          }}
        >
          Real-time{' '}
          <span style={{ color: 'var(--accent-secondary)' }}>Pulse</span> of Community Impact
        </h1>
      </div>

      {/* Stat Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        <StatCard
          label="TOTAL ISSUES"
          value={issues.length}
          icon={<BarChart2 size={18} color="#9333ea" />}
          iconBg="rgba(147,51,234,0.15)"
          badge={
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#22c55e' }}>+12%</span>
          }
        />
        <StatCard
          label="PENDING ACTION"
          value={pending}
          icon={<AlertTriangle size={18} color="#ef4444" />}
          iconBg="rgba(239,68,68,0.15)"
          valueColor="var(--urgency-high)"
          badge={
            pending > 30 ? (
              <span className="badge-urgent" style={{ fontSize: '10px', padding: '2px 6px' }}>
                URGENT
              </span>
            ) : undefined
          }
        />
        <StatCard
          label="CURRENTLY ASSIGNED"
          value={assigned}
          icon={<Users size={18} color="#9333ea" />}
          iconBg="rgba(147,51,234,0.15)"
          valueColor="var(--accent-primary)"
        />
        <StatCard
          label="COMPLETED TASKS"
          value={completed}
          icon={<CheckCircle2 size={18} color="#22c55e" />}
          iconBg="rgba(34,197,94,0.15)"
        />
      </div>

      {/* Bottom Row: Impact Distribution + Recent Submissions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '5fr 7fr',
          gap: '24px',
          marginBottom: '24px',
        }}
      >
        {/* Impact Distribution */}
        <div className="card">
          <h3
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '18px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              marginBottom: '4px',
            }}
          >
            Impact Distribution
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Issues segmented by category
          </p>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton" style={{ height: '36px' }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {catBars.map(({ label, count, color }) => {
                const pct = totalIssues > 0 ? Math.round((count / totalIssues) * 100) : 0;
                return (
                  <div key={label}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '6px',
                      }}
                    >
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        {label}
                      </span>
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '13px',
                          color: 'var(--text-primary)',
                          fontWeight: 500,
                        }}
                      >
                        {pct}%
                      </span>
                    </div>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Active Volunteers */}
          <div
            style={{
              marginTop: '28px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-default)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p className="label-muted">ACTIVE VOLUNTEERS</p>
                <p
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: '28px',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    marginTop: '4px',
                  }}
                >
                  {volunteers.length}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#22c55e',
                    background: 'rgba(34,197,94,0.1)',
                    border: '1px solid rgba(34,197,94,0.3)',
                    borderRadius: '4px',
                    padding: '3px 8px',
                  }}
                >
                  ● Pulse Active
                </span>
                <div style={{ display: 'flex', gap: '-4px' }}>
                  {volunteers.slice(0, 3).map((v, i) => (
                    <div
                      key={i}
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        background: `hsl(${(i * 120) % 360}, 60%, 35%)`,
                        border: '2px solid var(--bg-surface)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: 'white',
                        marginLeft: i > 0 ? '-6px' : '0',
                      }}
                    >
                      {v.name?.[0]?.toUpperCase() || 'V'}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Submissions */}
        <div style={{ background: 'var(--bg-surface)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-default)' }}>
          <div
            style={{
              padding: '20px 24px',
              background: 'var(--bg-elevated)',
              borderBottom: '1px solid var(--border-default)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}
            >
              Recent Submissions
            </h3>
            <Link
              href="/report"
              style={{
                fontSize: '13px',
                color: 'var(--accent-primary)',
                textDecoration: 'none',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              View All Issues <ExternalLink size={12} />
            </Link>
          </div>

          {/* Table Header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr 1fr',
              padding: '12px 20px',
              borderBottom: '1px solid var(--border-default)',
            }}
          >
            {['ISSUE TITLE', 'PRIORITY', 'CATEGORY', 'STATUS'].map((h) => (
              <span key={h} className="label-muted">
                {h}
              </span>
            ))}
          </div>

          {/* Table Rows */}
          {loading ? (
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton" style={{ height: '40px' }} />
              ))}
            </div>
          ) : recentIssues.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <AlertTriangle size={48} color="var(--text-muted)" style={{ opacity: 0.4, margin: '0 auto 12px' }} />
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', color: 'var(--text-muted)' }}>
                No issues reported yet
              </p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '240px', margin: '8px auto 0' }}>
                Reports will appear here once submitted.
              </p>
            </div>
          ) : (
            recentIssues.map((issue, idx) => (
              <div
                key={issue.issueId}
                onClick={() => setSelectedIssue(issue)}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr',
                  padding: '14px 20px',
                  borderBottom: idx < recentIssues.length - 1 ? '1px solid var(--border-default)' : 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  alignItems: 'center',
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.background = 'var(--bg-elevated)')
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.background = 'transparent')
                }
              >
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' }}>
                    {issue.title}
                  </p>
                  {issue.location && (
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <MapPin size={11} /> {issue.location}
                    </p>
                  )}
                </div>
                <PriorityBadge priority={issue.suggestedPriority || issue.urgency} />
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {issue.suggestedCategory || issue.category}
                </span>
                <StatusBadge status={issue.status} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Active Incident Map */}
      <div className="card" style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
              Active Incident Map
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Real-time heat visualization of reports
            </p>
          </div>
          <Link href="/map">
            <button
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}
            >
              <ExternalLink size={14} /> Expand Interactive Map
            </button>
          </Link>
        </div>
        <div style={{ height: '260px', borderRadius: '8px', overflow: 'hidden' }}>
          <MapWrapper issues={issues} interactive={false} />
        </div>
      </div>

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          volunteers={volunteers}
          onClose={() => setSelectedIssue(null)}
        />
      )}
    </AppShell>
  );
}
