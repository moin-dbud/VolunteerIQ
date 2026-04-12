'use client';

import { useEffect, useState, useRef } from 'react';
import {
  collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Issue, User, GeminiInsightsResponse } from '@/lib/types';
import AppShell from '@/components/AppShell';
import {
  Sparkles, BarChart2, MessageCircle, Send, ExternalLink,
  Rocket, Map, ChevronDown, ArrowLeft, CheckCircle, XCircle, Search,
} from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/lib/toast-context';
import { useAuth } from '@/lib/auth-context';

// ── Types ─────────────────────────────────────────────────────────────────────
type Step = 'select' | 'generating' | 'report';
interface InsightsData extends GeminiInsightsResponse {
  bestVolunteerProximity?: string;
}
type DispatchState = 'idle' | 'dispatching' | 'awaiting' | 'accepted' | 'no_more';

// ── Helpers ───────────────────────────────────────────────────────────────────
function ProgressBar({ targetPct }: { targetPct: number }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { const t = setTimeout(() => setWidth(targetPct), 100); return () => clearTimeout(t); }, [targetPct]);
  return (
    <div style={{ width: '100%', height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${width}%`, background: 'var(--accent-primary)', borderRadius: '2px', transition: 'width 1200ms ease-out' }} />
    </div>
  );
}

function IndeterminateBar() {
  return (
    <div style={{ width: '100%', height: '4px', background: 'var(--bg-elevated)', borderRadius: '2px', overflow: 'hidden', position: 'relative' }}>
      <div style={{
        position: 'absolute', height: '100%', width: '40%',
        background: 'linear-gradient(90deg, transparent, var(--accent-primary), transparent)',
        borderRadius: '2px',
        animation: 'slideIndeterminate 1.4s ease-in-out infinite',
      }} />
      <style>{`@keyframes slideIndeterminate { 0% { left: -40% } 100% { left: 100% } }`}</style>
    </div>
  );
}

function MockBarChart({ data }: { data?: number[] }) {
  const bars = data ?? [35, 52, 68, 80, 94];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '60px', marginTop: '12px' }}>
      {bars.map((h, i) => (
        <div key={i} style={{ flex: 1, height: `${h}%`, background: `rgba(147,51,234,${0.3 + i * 0.14})`, borderRadius: '4px 4px 0 0', transition: 'height 0.5s ease' }} />
      ))}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AIInsightsPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  // Live data from Firestore
  const [allIssues, setAllIssues] = useState<Issue[]>([]);
  const [volunteers, setVolunteers] = useState<User[]>([]);

  // Step flow
  const [step, setStep] = useState<Step>('select');
  const [selectedIssueId, setSelectedIssueId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [insights, setInsights] = useState<InsightsData | null>(null);
  const [excludedVols, setExcludedVols] = useState<string[]>([]);

  // Dispatch state
  const [dispatchState, setDispatchState] = useState<DispatchState>('idle');
  const [dispatchId, setDispatchId] = useState('');
  const [waLink, setWaLink] = useState<string | null>(null);
  const [confirmWaLink, setConfirmWaLink] = useState<string | null>(null);

  // Sidebar stats
  const activeCount = volunteers.filter((v) => v.availabilityStatus === 'available').length || volunteers.length;

  useEffect(() => {
    // Subscribe to non-closed issues for the dropdown
    const issueQ = query(collection(db, 'issues'), where('status', '!=', 'completed'));
    const unsubIssues = onSnapshot(issueQ, (snap) => {
      const docs = snap.docs.map((d) => ({ issueId: d.id, ...d.data() } as Issue));
      // Sort: high urgency first
      const rank: Record<string, number> = { high: 0, urgent: 0, medium: 1, low: 2 };
      docs.sort((a, b) => (rank[a.urgency] ?? 1) - (rank[b.urgency] ?? 1));
      setAllIssues(docs);
    });

    const volQ = query(collection(db, 'users'), where('role', '==', 'volunteer'));
    const unsubVols = onSnapshot(volQ, (snap) => setVolunteers(snap.docs.map((d) => d.data() as User)));

    return () => { unsubIssues(); unsubVols(); };
  }, []);

  const selectedIssue = allIssues.find((i) => i.issueId === selectedIssueId) ?? null;

  // Filtered issues for dropdown search
  const filteredIssues = allIssues.filter((i) =>
    !searchTerm || i.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ── Generate Report ─────────────────────────────────────────────────────────
  const generateReport = async (excludeList: string[] = excludedVols) => {
    if (!selectedIssueId) return;
    setStep('generating');
    setInsights(null);
    setDispatchState('idle');
    setDispatchId('');
    setWaLink(null);
    setConfirmWaLink(null);
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ issueId: selectedIssueId, excludeVolunteers: excludeList }),
      });
      if (res.ok) {
        const data: InsightsData = await res.json();
        setInsights(data);
        setStep('report');
      } else {
        throw new Error('API error');
      }
    } catch (err) {
      console.error('[Insights]', err);
      addToast('Failed to generate report. Please try again.', 'error');
      setStep('select');
    }
  };

  // ── Dispatch ────────────────────────────────────────────────────────────────
  const handleDispatch = async () => {
    if (!insights?.bestVolunteerMatchUid || !selectedIssueId || !user) return;
    setDispatchState('dispatching');
    try {
      const res = await fetch('/api/dispatch-volunteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueId: selectedIssueId,
          volunteerUid: insights.bestVolunteerMatchUid,
          coordinatorUid: user.uid,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDispatchId(data.dispatchId);
        setWaLink(data.waLink ?? null);
        setDispatchState('awaiting');
        addToast(
          data.hasPhone
            ? 'WhatsApp link ready — click "Open WhatsApp" to send the dispatch message.'
            : 'Dispatch recorded. Volunteer has no phone number saved.',
          data.hasPhone ? 'success' : 'info'
        );
      } else throw new Error('Dispatch failed');
    } catch {
      addToast('Failed to dispatch volunteer.', 'error');
      setDispatchState('idle');
    }
  };

  const handleAccepted = async () => {
    if (!dispatchId || !selectedIssueId || !insights?.bestVolunteerMatchUid) return;
    try {
      const res = await fetch('/api/dispatch-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dispatchId, response: 'accepted', issueId: selectedIssueId, volunteerUid: insights.bestVolunteerMatchUid }),
      });
      const data = await res.json();
      if (data.success) {
        setConfirmWaLink(data.waLink ?? null);
        setDispatchState('accepted');
        addToast('Volunteer assigned! Click the confirmation link to notify them.', 'success');
      }
    } catch { addToast('Failed to confirm assignment.', 'error'); }
  };

  const handleRejected = async () => {
    if (!dispatchId || !selectedIssueId || !insights?.bestVolunteerMatchUid) return;
    const rejectedUid = insights.bestVolunteerMatchUid;
    try {
      await fetch('/api/dispatch-response', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dispatchId, response: 'rejected', issueId: selectedIssueId, volunteerUid: rejectedUid }),
      });
      addToast('Generating new volunteer recommendation...', 'info');
      const newExcluded = [...excludedVols, rejectedUid];
      setExcludedVols(newExcluded);

      // Check if any more volunteers available
      const remaining = volunteers.filter((v) => !newExcluded.includes(v.uid));
      if (remaining.length === 0) {
        setDispatchState('no_more');
        setStep('report');
        return;
      }
      await generateReport(newExcluded);
    } catch { addToast('Failed to record rejection.', 'error'); }
  };

  const resetFlow = () => {
    setStep('select');
    setSelectedIssueId('');
    setInsights(null);
    setDispatchState('idle');
    setDispatchId('');
    setExcludedVols([]);
    setSearchTerm('');
  };

  // Compute best vol display
  const bestVol = insights?.bestVolunteerMatchUid
    ? volunteers.find((v) => v.uid === insights.bestVolunteerMatchUid)
    : null;
  const bestVolName = insights?.bestVolunteerMatchName || bestVol?.name || 'No match found';
  const bestVolSkill = insights?.bestVolunteerMatchSkill || bestVol?.skills?.[0] || 'General';
  const bestVolProximity = insights?.bestVolunteerProximity || '< 5km away';
  const bestVolInitials = bestVolName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  // ── SIDEBAR ─────────────────────────────────────────────────────────────────
  const openTickets = allIssues.filter((i) => (i as any).ticketStatus === 'open' || i.status === 'pending');

  const Sidebar = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Network Health */}
      <div className="card" style={{ padding: '20px' }}>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px' }}>
          NETWORK HEALTH
        </p>
        {[
          { dot: '#22c55e', label: 'Active Volunteers', value: activeCount.toString() },
          { dot: '#9333ea',  label: 'AI Nodes',         value: 'Online' },
          { dot: '#ef4444', label: 'Open Tickets',      value: openTickets.length > 0 ? `${openTickets.length} Critical` : '0' },
        ].map(({ dot, label, value }, i, arr) => (
          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: i < arr.length - 1 ? '1px solid var(--border-default)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: dot }} />
              <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{label}</span>
            </div>
            <span style={{ fontSize: '14px', fontWeight: 600, color: dot === '#ef4444' ? '#ef4444' : dot === '#22c55e' ? '#22c55e' : 'var(--text-primary)' }}>{value}</span>
          </div>
        ))}
      </div>

      {/* Map Thumbnail */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ height: '120px', background: 'linear-gradient(135deg, #1a1a2e, #0f1729)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Map size={40} color="var(--text-muted)" style={{ opacity: 0.4 }} />
        </div>
        <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', marginBottom: '2px' }}>ACTIVE MAP</p>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Sector 4 Surveillance</p>
          </div>
          <Link href="/map"><ExternalLink size={16} color="var(--accent-primary)" /></Link>
        </div>
      </div>

      {/* AI Assistant Pro */}
      <div className="card" style={{ background: 'linear-gradient(135deg, rgba(147,51,234,0.12), rgba(192,38,211,0.08))', border: '1px solid rgba(147,51,234,0.3)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <Rocket size={20} color="var(--accent-primary)" />
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>AI Assistant Pro</span>
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
          Unlock advanced multi-modal analysis for disaster zone imagery and drone feeds.
        </p>
        <button className="btn-gradient" style={{ height: '40px', fontSize: '13px' }}
          onClick={() => addToast('Coming soon! AI Assistant Pro will be available in the next release.', 'info')}>
          Upgrade Workspace
        </button>
      </div>
    </div>
  );

  // ── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <AppShell requireCoordinator>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <p className="label-small" style={{ marginBottom: '8px' }}>PREDICTIVE INTELLIGENCE ENGINE</p>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '36px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
          Gemini AI Insights:{' '}
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Smart Resource Allocation</span>
        </h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px' }}>
        {/* Main Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* ── STEP 1: Issue Selection ─────────────────────────────────────── */}
          {step === 'select' && (
            <div className="card" style={{ padding: '32px' }}>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Select an Issue to Analyze
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                  Choose a reported issue to generate an AI dispatch recommendation
                </p>
              </div>

              {/* Search input */}
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input className="input-field" style={{ paddingLeft: '38px' }} placeholder="Search issues by title..."
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>

              {/* Issues list */}
              <div style={{ border: '1px solid var(--border-default)', borderRadius: '10px', overflow: 'hidden', marginBottom: '20px', maxHeight: '320px', overflowY: 'auto' }}>
                {filteredIssues.length === 0 ? (
                  <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px' }}>
                    No open issues found.
                  </div>
                ) : filteredIssues.map((issue, idx) => {
                  const isSelected = selectedIssueId === issue.issueId;
                  const urgency = issue.urgency || 'low';
                  const ticketNum = (issue as any).ticketNumber ?? `VIQ-${issue.issueId?.slice(-4).toUpperCase()}`;
                  return (
                    <div key={issue.issueId}
                      onClick={() => setSelectedIssueId(issue.issueId!)}
                      style={{
                        padding: '14px 16px', cursor: 'pointer',
                        background: isSelected ? 'rgba(147,51,234,0.12)' : idx % 2 === 0 ? 'var(--bg-surface)' : 'var(--bg-elevated)',
                        borderLeft: `3px solid ${isSelected ? 'var(--accent-primary)' : 'transparent'}`,
                        borderBottom: idx < filteredIssues.length - 1 ? '1px solid var(--border-default)' : 'none',
                        transition: 'background 0.15s ease',
                        display: 'flex', alignItems: 'center', gap: '12px',
                      }}>
                      <span className={`badge-${(urgency as string) === 'urgent' ? 'urgent' : urgency}`} style={{ flexShrink: 0 }}>
                        {urgency.toUpperCase()}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: isSelected ? 'var(--accent-primary)' : 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {issue.title}
                        </p>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {issue.location} &nbsp;·&nbsp; {ticketNum}
                        </p>
                      </div>
                      {isSelected && <Sparkles size={14} color="var(--accent-primary)" />}
                    </div>
                  );
                })}
              </div>

              {/* Generate button */}
              <button
                onClick={() => generateReport()}
                disabled={!selectedIssueId}
                style={{
                  width: '100%', height: '52px', border: 'none', borderRadius: '10px', cursor: selectedIssueId ? 'pointer' : 'not-allowed',
                  background: selectedIssueId ? 'linear-gradient(135deg, #9333ea, #c026d3)' : 'var(--bg-elevated)',
                  color: selectedIssueId ? 'white' : 'var(--text-muted)',
                  fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 600,
                  transition: 'all 0.2s ease', boxShadow: selectedIssueId ? '0 4px 20px rgba(147,51,234,0.35)' : 'none',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                }}>
                <Sparkles size={18} />
                Generate Intelligence Report
              </button>
            </div>
          )}

          {/* ── STEP 2: Generating ──────────────────────────────────────────── */}
          {step === 'generating' && (
            <div className="card" style={{ padding: '48px 32px', textAlign: 'center' }}>
              <div style={{ marginBottom: '20px', display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'rgba(147,51,234,0.12)', animation: 'pulse 2s infinite' }}>
                <Sparkles size={48} color="var(--accent-primary)" />
              </div>
              <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Gemini Intelligence Engine
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '32px' }}>
                Analyzing issue details, volunteer skills, and proximity data...
              </p>
              <IndeterminateBar />
            </div>
          )}

          {/* ── STEP 3: Report ──────────────────────────────────────────────── */}
          {step === 'report' && insights && (
            <>
              {/* Back button */}
              <button onClick={resetFlow}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', padding: '0', marginBottom: '4px' }}>
                <ArrowLeft size={14} /> Analyze Different Issue
              </button>

              {/* Gemini Intelligence Report Card */}
              <div style={{
                background: 'var(--bg-surface)', border: '1px solid rgba(147,51,234,0.4)',
                borderLeft: '4px solid transparent',
                borderImage: 'linear-gradient(180deg, #9333ea, #c026d3) 1',
                borderRadius: '16px', padding: '28px',
                boxShadow: '0 0 30px rgba(147,51,234,0.12)',
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Decorative */}
                <div style={{ position: 'absolute', top: '16px', right: '20px', opacity: 0.15 }}>
                  <Sparkles size={48} color="var(--text-muted)" />
                </div>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
                  <Sparkles size={20} color="var(--accent-primary)" />
                  <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Gemini Intelligence Report
                  </span>
                </div>

                {dispatchState === 'no_more' ? (
                  <div style={{ textAlign: 'center', padding: '24px', background: 'var(--bg-elevated)', borderRadius: '10px', border: '1px solid var(--border-default)' }}>
                    <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                      No More Available Volunteers
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                      No more available volunteers match this issue. Consider broadening the search or waiting for new volunteers to come online.
                    </p>
                    <button onClick={resetFlow} style={{ marginTop: '16px', background: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: '14px' }}>
                      Start New Analysis
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
                    {/* Left: Issue Analysis */}
                    <div>
                      {selectedIssue && (
                        <div style={{ marginBottom: '18px' }}>
                          <p className="label-muted" style={{ marginBottom: '6px' }}>ANALYZING ISSUE</p>
                          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '3px' }}>
                            {selectedIssue.title}
                          </p>
                          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{selectedIssue.location}</p>
                        </div>
                      )}

                      <div style={{ marginBottom: '16px' }}>
                        <p className="label-muted" style={{ marginBottom: '8px' }}>SUGGESTED PRIORITY</p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <span className="badge-high">Urgent</span>
                          {selectedIssue?.priorityReason && (
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                              {selectedIssue.priorityReason}
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className="label-muted" style={{ marginBottom: '6px' }}>SUGGESTED CATEGORY</p>
                        <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {selectedIssue?.suggestedCategory || selectedIssue?.category}
                        </p>
                      </div>
                    </div>

                    {/* Right: Volunteer Match */}
                    <div>
                      <p className="label-muted" style={{ marginBottom: '12px' }}>BEST VOLUNTEER MATCH</p>
                      <div style={{
                        background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
                        borderRadius: '10px', padding: '16px',
                        display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px',
                      }}>
                        <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: 'white', flexShrink: 0 }}>
                          {bestVolInitials || '?'}
                        </div>
                        <div>
                          <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>{bestVolName}</p>
                          <p style={{ fontSize: '12px', color: 'var(--accent-primary)', marginTop: '2px' }}>
                            {bestVolSkill} &nbsp;·&nbsp; {bestVolProximity}
                          </p>
                        </div>
                      </div>

                      {/* Dispatch State A: initial button */}
                      {dispatchState === 'idle' && (
                        <button onClick={handleDispatch} disabled={!insights.bestVolunteerMatchUid}
                          style={{ width: '100%', height: '42px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--text-primary)', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background 0.15s ease' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(147,51,234,0.1)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-elevated)')}>
                          <Send size={14} /> Dispatch Request
                        </button>
                      )}

                      {/* Dispatch State: loading */}
                      {dispatchState === 'dispatching' && (
                        <button disabled style={{ width: '100%', height: '42px', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', cursor: 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <div className="spinner" style={{ width: 14, height: 14 }} /> Preparing dispatch...
                        </button>
                      )}

                      {/* Dispatch State B: awaiting — show WhatsApp link + accept/reject */}
                      {dispatchState === 'awaiting' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {/* WhatsApp open link */}
                          {waLink ? (
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                width: '100%', height: '42px', background: 'linear-gradient(135deg, #25D366, #128C7E)',
                                border: 'none', borderRadius: '8px', color: 'white', fontFamily: 'DM Sans, sans-serif',
                                fontSize: '14px', fontWeight: 700, cursor: 'pointer', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', gap: '8px', textDecoration: 'none',
                                boxShadow: '0 4px 16px rgba(37,211,102,0.35)',
                              }}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                              Open WhatsApp — Send Dispatch
                            </a>
                          ) : (
                            <div style={{ width: '100%', height: '42px', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '13px', color: '#ef4444', fontFamily: 'DM Sans, sans-serif' }}>No phone number saved for this volunteer</span>
                            </div>
                          )}
                          {/* Accept / Reject */}
                          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>
                            After sending, mark the volunteer's response:
                          </p>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={handleAccepted} style={{ flex: 1, height: '40px', background: 'rgba(34,197,94,0.15)', border: '1px solid #22c55e', borderRadius: '8px', color: '#22c55e', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                              <CheckCircle size={14} /> Accepted
                            </button>
                            <button onClick={handleRejected} style={{ flex: 1, height: '40px', background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444', fontFamily: 'DM Sans, sans-serif', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                              <XCircle size={14} /> Rejected
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Dispatch State: accepted — show confirmation link */}
                      {dispatchState === 'accepted' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ width: '100%', height: '42px', background: 'rgba(34,197,94,0.12)', border: '1px solid #22c55e', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                            <CheckCircle size={16} color="#22c55e" />
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#22c55e', fontFamily: 'DM Sans, sans-serif' }}>Assigned ✓</span>
                          </div>
                          {confirmWaLink && (
                            <a
                              href={confirmWaLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                width: '100%', height: '38px', background: 'rgba(37,211,102,0.1)',
                                border: '1px solid #25D366', borderRadius: '8px', color: '#25D366',
                                fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 600,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                gap: '6px', textDecoration: 'none',
                              }}
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                              Send Confirmation via WhatsApp
                            </a>
                          )}
                          <button onClick={resetFlow} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <ArrowLeft size={12} /> Analyze Different Issue
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border-default)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Real-time Data Synthesis...</span>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 600, color: 'var(--accent-primary)' }}>94% Accuracy</span>
                  </div>
                  <ProgressBar targetPct={94} />
                </div>
              </div>

              {/* Bottom Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BarChart2 size={18} color="var(--accent-primary)" />
                      <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Impact Forecast</span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '4px', padding: '3px 8px' }}>LIVE</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    {insights.forecastText || 'Estimated recovery time reduced with suggested volunteer deployment.'}
                  </p>
                  <MockBarChart />
                </div>

                <div className="card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MessageCircle size={18} color="var(--accent-primary)" />
                      <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Sentiment Analysis</span>
                    </div>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--accent-primary)', background: 'rgba(147,51,234,0.1)', border: '1px solid rgba(147,51,234,0.3)', borderRadius: '4px', padding: '3px 8px' }}>GEMINI</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                    {insights.sentimentText || 'Community feedback trending positive in areas with volunteer presence.'}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '40px', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {insights.satisfactionScore?.toFixed(1) ?? '8.4'}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Avg. Satisfaction Index</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Sidebar */}
        <Sidebar />
      </div>
    </AppShell>
  );
}
