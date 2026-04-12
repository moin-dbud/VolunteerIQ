'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  collection, addDoc, serverTimestamp, onSnapshot,
  query, orderBy, limit, startAfter, where,
  updateDoc, doc, QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import AppShell from '@/components/AppShell';
import {
  FileText, Tag, MapPin, AlertCircle, Info,
  Zap, ShieldCheck, Clock, ChevronDown,
  AlertTriangle, CheckCircle, Clock3, XCircle, Users, Ticket,
  RefreshCw, ChevronRight,
} from 'lucide-react';
import { CATEGORY_OPTIONS, getCategoryEmoji, Issue } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

// ── Geocode ───────────────────────────────────────────────────────────────────
async function geocodeLocation(location: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    const data = await res.json();
    return data[0] ? { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) } : null;
  } catch { return null; }
}

// ── Ticket status config ──────────────────────────────────────────────────────
const TICKET_STATUSES = [
  { value: 'open',               label: 'Ticket Open',          dot: '#ef4444', bg: 'rgba(239,68,68,0.15)',    border: 'rgba(239,68,68,0.4)'    },
  { value: 'in_progress',        label: 'In Progress',          dot: '#f59e0b', bg: 'rgba(245,158,11,0.15)',   border: 'rgba(245,158,11,0.4)'   },
  { value: 'volunteers_assigned',label: 'Volunteers Assigned',   dot: '#9333ea', bg: 'rgba(147,51,234,0.15)',   border: 'rgba(147,51,234,0.4)'   },
  { value: 'closed',             label: 'Ticket Closed',        dot: '#22c55e', bg: 'rgba(34,197,94,0.15)',    border: 'rgba(34,197,94,0.4)'    },
];

const URGENCY_LEFT_BORDER: Record<string, string> = {
  high: '#ef4444', urgent: '#dc2626', medium: '#f59e0b', low: '#6366f1',
};

function timeAgo(ts: any): string {
  try {
    const date = ts?.toDate ? ts.toDate() : new Date(ts);
    return formatDistanceToNow(date, { addSuffix: true });
  } catch { return ''; }
}

function TicketStatusBadge({ status }: { status: string }) {
  const cfg = TICKET_STATUSES.find((s) => s.value === status) ?? TICKET_STATUSES[0];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 8px', borderRadius: '4px',
      background: cfg.bg, border: `1px solid ${cfg.border}`,
      fontSize: '10px', fontWeight: 600, fontFamily: 'DM Sans, sans-serif',
      letterSpacing: '0.07em', textTransform: 'uppercase',
      color: cfg.dot, whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  );
}

const PAGE_SIZE = 10;

type FilterKey = 'all' | 'open' | 'in_progress' | 'volunteers_assigned' | 'closed' | 'mine';

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',                label: 'All' },
  { key: 'open',               label: 'Open' },
  { key: 'in_progress',        label: 'In Progress' },
  { key: 'volunteers_assigned',label: 'Volunteers Assigned' },
  { key: 'closed',             label: 'Closed' },
  { key: 'mine',               label: 'My Reports' },
];

// ── Main Component ────────────────────────────────────────────────────────────
export default function ReportIssuePage() {
  const { user, userProfile } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const isCoordinator = userProfile?.role === 'coordinator';

  // ── Form state ──────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({ title: '', category: '', location: '', urgency: '', description: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.title.trim()) e.title = 'Problem title is required.';
    if (!formData.category) e.category = 'Category is required.';
    if (!formData.location.trim()) e.location = 'Location is required.';
    if (!formData.urgency) e.urgency = 'Urgency level is required.';
    if (!formData.description.trim()) e.description = 'Description is required.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setSubmitting(true);
    try {
      const coordinates = await geocodeLocation(formData.location);

      const docRef = await addDoc(collection(db, 'issues'), {
        title: formData.title,
        category: formData.category,
        location: formData.location,
        urgency: formData.urgency,
        description: formData.description,
        reportedBy: user?.uid,
        status: 'pending',
        ticketStatus: 'open',
        assignedTo: null,
        assignedVolunteers: [],
        rejectedVolunteers: [],
        ...(coordinates && { coordinates }),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update with ticketNumber
      const ticketNumber = `VIQ-${docRef.id.slice(-4).toUpperCase()}`;
      const { updateDoc: upd, doc: d } = await import('firebase/firestore');
      
      // 2. Call Gemini triage (pass issueId + issueData for WhatsApp notify)
      let triageResult = { suggestedCategory: formData.category, suggestedPriority: formData.urgency, priorityReason: '' };
      try {
        const triageRes = await fetch('/api/triage', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            issueId: docRef.id,
            issueData: { ...formData, reportedBy: user?.uid },
          }),
        });
        if (triageRes.ok) triageResult = await triageRes.json();
      } catch (err) { console.error('[Triage fetch error]', err); }

      // 3. Update Firestore with triage + ticketNumber
      await upd(d(db, 'issues', docRef.id), {
        suggestedCategory: triageResult.suggestedCategory,
        suggestedPriority: triageResult.suggestedPriority,
        priorityReason: triageResult.priorityReason,
        issueId: docRef.id,
        ticketNumber,
      });

      addToast('Issue reported successfully. AI triage complete.', 'success');
      setFormData({ title: '', category: '', location: '', urgency: '', description: '' });
    } catch (err) {
      console.error('[Report Issue error]', err);
      addToast('Failed to submit issue. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Issues Feed state ───────────────────────────────────────────────────────
  const [issues, setIssues] = useState<Issue[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [feedFilter, setFeedFilter] = useState<FilterKey>('all');
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const unsubRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (unsubRef.current) unsubRef.current();
    setLoadingFeed(true);
    setIssues([]);
    setLastDoc(null);

    // Build query
    let q = query(collection(db, 'issues'), orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
    if (feedFilter === 'mine' && user?.uid) {
      q = query(collection(db, 'issues'), where('reportedBy', '==', user.uid), orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
    } else if (feedFilter !== 'all') {
      q = query(collection(db, 'issues'), where('ticketStatus', '==', feedFilter), orderBy('createdAt', 'desc'), limit(PAGE_SIZE));
    }

    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ issueId: d.id, ...d.data() } as Issue));
      setIssues(docs);
      setLastDoc(snap.docs[snap.docs.length - 1] ?? null);
      setHasMore(snap.docs.length === PAGE_SIZE);
      setLoadingFeed(false);
    });

    unsubRef.current = unsub;
    return () => unsub();
  }, [feedFilter, user?.uid]);

  // Total count listener
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'issues'), (snap) => setTotalCount(snap.size));
    return () => unsub();
  }, []);

  const loadMore = async () => {
    if (!lastDoc || loadingMore) return;
    setLoadingMore(true);
    try {
      const { getDocs, startAfter: sa } = await import('firebase/firestore');
      let q = query(collection(db, 'issues'), orderBy('createdAt', 'desc'), sa(lastDoc), limit(PAGE_SIZE));
      if (feedFilter === 'mine' && user?.uid) {
        q = query(collection(db, 'issues'), where('reportedBy', '==', user.uid), orderBy('createdAt', 'desc'), sa(lastDoc), limit(PAGE_SIZE));
      } else if (feedFilter !== 'all') {
        q = query(collection(db, 'issues'), where('ticketStatus', '==', feedFilter), orderBy('createdAt', 'desc'), sa(lastDoc), limit(PAGE_SIZE));
      }
      const snap = await getDocs(q);
      const more = snap.docs.map((d) => ({ issueId: d.id, ...d.data() } as Issue));
      setIssues((prev) => [...prev, ...more]);
      setLastDoc(snap.docs[snap.docs.length - 1] ?? null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch (err) { console.error(err); }
    finally { setLoadingMore(false); }
  };

  const handleStatusChange = async (issueId: string, newStatus: string) => {
    setUpdatingStatus(issueId);
    try {
      const updates: Record<string, any> = { ticketStatus: newStatus, updatedAt: serverTimestamp() };
      if (newStatus === 'closed') updates.status = 'completed';
      await updateDoc(doc(db, 'issues', issueId), updates);
      addToast(`Ticket status updated to "${TICKET_STATUSES.find(s => s.value === newStatus)?.label}".`, 'success');
    } catch { addToast('Failed to update status.', 'error'); }
    finally { setUpdatingStatus(null); }
  };

  const featureCards = [
    { icon: <Zap size={20} color="var(--accent-primary)" />, title: 'Instant Triage', desc: 'AI analysis prioritizes submissions based on keywords and location proximity.' },
    { icon: <ShieldCheck size={20} color="var(--accent-primary)" />, title: 'Verified Only', desc: 'Issues are routed only to vetted NGO personnel and government agents.' },
    { icon: <Clock size={20} color="var(--accent-primary)" />, title: 'Live Tracking', desc: 'Monitor resolution status in real-time through your personal dashboard.' },
  ];

  return (
    <AppShell>
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <p className="label-small" style={{ marginBottom: '8px' }}>ACTION REQUIRED</p>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '36px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
          Report <span style={{ color: 'var(--accent-secondary)' }}>Operational Issue</span>
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '10px', maxWidth: '580px', lineHeight: 1.6 }}>
          Provide detailed information about the crisis or logistical barrier. Your submission triggers the AI triage system for immediate resource allocation.
        </p>
      </div>

      {/* Report Form */}
      <form onSubmit={handleSubmit}>
        <div className="card" style={{ padding: '28px', marginBottom: '24px' }}>
          {/* Row 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label className="label-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <FileText size={12} /> PROBLEM TITLE
              </label>
              <input type="text" className="input-field" placeholder="Brief summary of the situation"
                value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              {errors.title && <p style={{ fontSize: '12px', color: 'var(--urgency-high)', marginTop: '4px' }}>{errors.title}</p>}
            </div>
            <div>
              <label className="label-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <Tag size={12} /> CATEGORY
              </label>
              <div style={{ position: 'relative' }}>
                <select className="select-field" value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={{ color: formData.category ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  <option value="" disabled>Select category</option>
                  {CATEGORY_OPTIONS.map((opt) => (<option key={opt} value={opt}>{opt}</option>))}
                </select>
                <ChevronDown size={15} color="var(--text-muted)" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
              </div>
              {errors.category && <p style={{ fontSize: '12px', color: 'var(--urgency-high)', marginTop: '4px' }}>{errors.category}</p>}
            </div>
          </div>

          {/* Row 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label className="label-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <MapPin size={12} /> INCIDENT LOCATION
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={15} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input type="text" className="input-field input-with-icon" placeholder="City, State or full address"
                  value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
              </div>
              {errors.location && <p style={{ fontSize: '12px', color: 'var(--urgency-high)', marginTop: '4px' }}>{errors.location}</p>}
            </div>
            <div>
              <label className="label-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <AlertCircle size={12} /> URGENCY LEVEL
              </label>
              <div style={{ display: 'flex', gap: '20px', height: '44px', alignItems: 'center' }}>
                {['low', 'medium', 'high'].map((level) => (
                  <label key={level} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: `2px solid ${formData.urgency === level ? 'var(--accent-primary)' : 'var(--border-default)'}`, background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                      onClick={() => setFormData({ ...formData, urgency: level })}>
                      {formData.urgency === level && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-primary)' }} />}
                    </div>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)', textTransform: 'capitalize', cursor: 'pointer' }}
                      onClick={() => setFormData({ ...formData, urgency: level })}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
              {errors.urgency && <p style={{ fontSize: '12px', color: 'var(--urgency-high)', marginTop: '4px' }}>{errors.urgency}</p>}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '24px' }}>
            <label className="label-muted" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <FileText size={12} /> DETAILED DESCRIPTION
            </label>
            <textarea className="textarea-field" rows={5}
              placeholder="Elaborate on the specific needs, number of affected individuals, and current status..."
              value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            {errors.description && <p style={{ fontSize: '12px', color: 'var(--urgency-high)', marginTop: '4px' }}>{errors.description}</p>}
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(147,51,234,0.08)', border: '1px solid rgba(147,51,234,0.2)', borderRadius: '8px', padding: '10px 16px' }}>
              <Info size={14} color="var(--accent-primary)" />
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Submission will be broadcasted to nearby verified responders.</span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="button" className="btn-ghost" onClick={() => router.back()}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting} style={{ minWidth: '140px' }}>
                {submitting ? 'Submitting...' : 'Report Issue'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Feature Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '48px' }}>
        {featureCards.map(({ icon, title, desc }) => (
          <div key={title} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(147,51,234,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
            <div>
              <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>{title}</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Issues Feed ─────────────────────────────────────────────────────── */}
      <div>
        {/* Feed Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Reported Issues
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Live feed of all submitted community reports</p>
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(147,51,234,0.12)', border: '1px solid rgba(147,51,234,0.3)', borderRadius: '20px', padding: '6px 14px', fontFamily: 'JetBrains Mono, monospace', fontSize: '13px', fontWeight: 600, color: 'var(--accent-primary)', marginTop: '4px' }}>
            {totalCount.toLocaleString()} total
          </span>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
          {FILTERS.map(({ key, label }) => (
            <button key={key} onClick={() => setFeedFilter(key)}
              style={{ padding: '6px 14px', borderRadius: '999px', border: `1px solid ${feedFilter === key ? 'var(--accent-primary)' : 'var(--border-default)'}`, background: feedFilter === key ? 'var(--accent-primary)' : 'transparent', color: feedFilter === key ? 'white' : 'var(--text-secondary)', fontFamily: 'DM Sans, sans-serif', fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s ease' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Loading skeletons */}
        {loadingFeed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '130px', borderRadius: '12px' }} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loadingFeed && issues.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '12px' }}>
            <AlertTriangle size={32} color="var(--text-muted)" style={{ margin: '0 auto 12px', opacity: 0.5 }} />
            <p style={{ fontSize: '15px', color: 'var(--text-muted)' }}>No issues found for this filter.</p>
          </div>
        )}

        {/* Issue Cards */}
        {!loadingFeed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {issues.map((issue) => {
              const urgency = issue.urgency || 'low';
              const borderColor = URGENCY_LEFT_BORDER[urgency] ?? '#6366f1';
              const ticketNum = (issue as any).ticketNumber ?? `VIQ-${issue.issueId?.slice(-4).toUpperCase() ?? '0000'}`;
              const assignedCount = ((issue as any).assignedVolunteers ?? []).length;
              const tStatus = (issue as any).ticketStatus ?? 'open';

              return (
                <div key={issue.issueId} style={{
                  background: 'var(--bg-surface)', border: '1px solid var(--border-default)',
                  borderLeft: `4px solid ${borderColor}`, borderRadius: '12px', padding: '20px',
                  transition: 'box-shadow 0.2s ease',
                }}>
                  {/* Top row */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '20px', flexShrink: 0 }}>{getCategoryEmoji(issue.category)}</span>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {issue.title}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={10} /> {issue.location} {(issue as any).createdAt && <>&nbsp;·&nbsp;{timeAgo((issue as any).createdAt)}</>}
                        </p>
                      </div>
                    </div>
                    <TicketStatusBadge status={tStatus} />
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {issue.description}
                  </p>

                  {/* Bottom row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span className={`badge-${(urgency as string) === 'urgent' ? 'urgent' : urgency}`}>
                        {(issue.suggestedPriority || urgency).toUpperCase()}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '4px', padding: '2px 7px' }}>
                        {issue.suggestedCategory || issue.category}
                      </span>
                      {assignedCount > 0 && (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <Users size={10} /> {assignedCount} Volunteer{assignedCount !== 1 ? 's' : ''}
                        </span>
                      )}
                      <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Ticket size={10} /> {ticketNum}
                      </span>
                    </div>

                    {/* Coordinator: status dropdown */}
                    {isCoordinator && (
                      <div style={{ position: 'relative' }}>
                        <select
                          value={tStatus}
                          disabled={updatingStatus === issue.issueId}
                          onChange={(e) => handleStatusChange(issue.issueId!, e.target.value)}
                          style={{ appearance: 'none', background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', borderRadius: '7px', padding: '5px 28px 5px 10px', fontSize: '12px', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                          {TICKET_STATUSES.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                          ))}
                        </select>
                        <ChevronDown size={12} color="var(--text-muted)" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                        {updatingStatus === issue.issueId && (
                          <div style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)' }}>
                            <div className="spinner" style={{ width: 12, height: 12 }} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Load More */}
        {hasMore && !loadingFeed && (
          <button onClick={loadMore} disabled={loadingMore} className="btn-ghost"
            style={{ width: '100%', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            {loadingMore ? <><div className="spinner" style={{ width: 16, height: 16 }} /> Loading...</> : <><RefreshCw size={14} /> Load More Issues</>}
          </button>
        )}
      </div>
    </AppShell>
  );
}
