'use client';

import { useEffect, useRef, useState } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Issue, User, getCategoryEmoji } from '@/lib/types';
import { useToast } from '@/lib/toast-context';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import {
  Search,
  Target,
  Plus,
  Minus,
  X,
  MapPin,
  Download,
  Crosshair,
  Users,
} from 'lucide-react';
import MapWrapper from '@/components/MapWrapper';
import type L from 'leaflet';

const CATEGORY_FILTERS = [
  { id: 'health',    label: 'Health & Med',   emoji: '🏥' },
  { id: 'food',      label: 'Food Supply',    emoji: '🍽️' },
  { id: 'infra',     label: 'Infrastructure', emoji: '🏠' },
  { id: 'safety',    label: 'Public Safety',  emoji: '🚔' },
  { id: 'emergency', label: 'Emergency',      emoji: '🚨' },
];

const URGENCY_FILTERS = [
  { id: 'all',    label: 'All',    dot: null },
  { id: 'high',   label: 'High',   dot: '#ef4444' },
  { id: 'medium', label: 'Medium', dot: '#f59e0b' },
  { id: 'low',    label: 'Low',    dot: '#6366f1' },
];

export default function MapViewPage() {
  const { addToast } = useToast();
  const mapRef = useRef<L.Map | null>(null);

  const [issues, setIssues]           = useState<Issue[]>([]);
  const [volunteers, setVolunteers]   = useState<User[]>([]);
  const [activeCats, setActiveCats]   = useState<string[]>([]);
  const [activeUrg, setActiveUrg]     = useState('all');
  const [selectedIssue, setSelected] = useState<Issue | null>(null);
  const [assignVol, setAssignVol]     = useState('');
  const [assigning, setAssigning]     = useState(false);
  const [flyTo, setFlyTo]             = useState<[number, number, number] | null>(null);
  const [mounted, setMounted]         = useState(false);

  useEffect(() => {
    setMounted(true);
    const u1 = onSnapshot(collection(db, 'issues'), (snap) =>
      setIssues(snap.docs.map((d) => ({ issueId: d.id, ...d.data() } as Issue)))
    );
    const u2 = onSnapshot(
      query(collection(db, 'users'), where('role', '==', 'volunteer')),
      (snap) => setVolunteers(snap.docs.map((d) => d.data() as User))
    );
    return () => { u1(); u2(); };
  }, []);

  // ── Filtering ────────────────────────────────────────────────────────────────
  const getFiltered = () =>
    issues.filter((i) => {
      const cat = (i.suggestedCategory || i.category || '').toLowerCase();
      if (activeCats.length > 0 && !activeCats.some((f) => cat.includes(f))) return false;
      if (activeUrg !== 'all' && i.urgency !== activeUrg) return false;
      return true;
    });

  const filteredIssues   = getFiltered();
  const highCount        = filteredIssues.filter((i) => i.urgency === 'high').length;
  const availableVols    = volunteers.filter(
    (v) => !v.availabilityStatus || v.availabilityStatus === 'available'
  );

  const getCatCount = (id: string) =>
    issues.filter((i) =>
      (i.category || '').toLowerCase().includes(id) ||
      (i.suggestedCategory || '').toLowerCase().includes(id)
    ).length;

  // ── Actions ──────────────────────────────────────────────────────────────────
  const focusHotspots = () => {
    const highUrgIssues = filteredIssues.filter(
      (i) => i.urgency === 'high' && i.coordinates?.lat && i.coordinates?.lng
    );
    if (highUrgIssues.length === 0) { addToast('No high-urgency issues with coordinates.', 'info'); return; }
    const lat = highUrgIssues.reduce((s, i) => s + i.coordinates!.lat, 0) / highUrgIssues.length;
    const lng = highUrgIssues.reduce((s, i) => s + i.coordinates!.lng, 0) / highUrgIssues.length;
    setFlyTo([lat, lng, 13]);
    // Reset after animation so FlyToController can be re-triggered
    setTimeout(() => setFlyTo(null), 1500);
  };

  const exportCSV = () => {
    const rows = filteredIssues.map((i) =>
      [i.title, i.category, i.location, i.urgency, i.status, i.description]
        .map((v) => `"${(v || '').replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv  = ['Title,Category,Location,Urgency,Status,Description', ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = Object.assign(document.createElement('a'), { href: url, download: 'volunteeriq-issues.csv' });
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAssign = async () => {
    if (!assignVol || !selectedIssue?.issueId) return;
    setAssigning(true);
    try {
      await updateDoc(doc(db, 'issues', selectedIssue.issueId), {
        status: 'assigned', assignedTo: assignVol, updatedAt: serverTimestamp(),
      });
      addToast('Volunteer assigned successfully.', 'success');
      setSelected(null);
      setAssignVol('');
    } catch {
      addToast('Failed to assign volunteer.', 'error');
    } finally {
      setAssigning(false);
    }
  };

  if (!mounted) return null;

  return (
    <div style={{ height: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Navbar />

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', position: 'relative', marginLeft: '220px' }}>
        <Sidebar />

        {/* ── Left Filter Panel ──────────────────────────────────────────── */}
        <div
          style={{
            width: '260px',
            flexShrink: 0,
            background: 'rgba(13,13,20,0.9)',
            backdropFilter: 'blur(12px)',
            borderRight: '1px solid var(--border-default)',
            overflowY: 'auto',
            padding: '20px 16px',
            zIndex: 10,
          }}
        >
          <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '16px' }}>
            Map Explorer
          </h3>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '20px' }}>
            <Search size={13} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            <input className="input-field" style={{ height: '36px', paddingLeft: '30px', fontSize: '13px' }} placeholder="Search issues..." readOnly />
          </div>

          {/* Category filters */}
          <p className="label-muted" style={{ marginBottom: '8px' }}>FILTER CATEGORIES</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginBottom: '20px' }}>
            {CATEGORY_FILTERS.map(({ id, label, emoji }) => {
              const active = activeCats.includes(id);
              return (
                <button key={id} onClick={() => setActiveCats((p) => p.includes(id) ? p.filter((c) => c !== id) : [...p, id])}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '7px', background: active ? 'rgba(147,51,234,0.2)' : 'var(--bg-elevated)', border: `1px solid ${active ? 'var(--accent-primary)' : 'var(--border-default)'}`, color: active ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '13px', width: '100%', textAlign: 'left' }}>
                  <span>{emoji} {label}</span>
                  <span style={{ fontWeight: 700, fontSize: '12px', color: 'var(--text-primary)' }}>{getCatCount(id)}</span>
                </button>
              );
            })}
          </div>

          {/* Urgency filter */}
          <p className="label-muted" style={{ marginBottom: '8px' }}>URGENCY LEVEL</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
            {URGENCY_FILTERS.map(({ id, label, dot }) => {
              const active = activeUrg === id;
              return (
                <button key={id} onClick={() => setActiveUrg(id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '5px 10px', borderRadius: '999px', background: active ? 'rgba(147,51,234,0.2)' : 'var(--bg-elevated)', border: `1px solid ${active ? 'var(--accent-primary)' : 'var(--border-default)'}`, color: active ? 'var(--accent-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '12px' }}>
                  {dot && <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: dot, display: 'inline-block' }} />}
                  {label}
                </button>
              );
            })}
          </div>

          {/* Active Volunteers */}
          <p className="label-muted" style={{ marginBottom: '10px' }}>LIVE VOLUNTEERS ({availableVols.length})</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {availableVols.slice(0, 6).map((vol) => {
              const initials = vol.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'V';
              return (
                <div key={vol.uid} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 600, color: 'white', flexShrink: 0 }}>{initials}</div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{vol.name}</p>
                    <p style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{vol.skills?.[0] || 'General'}</p>
                  </div>
                </div>
              );
            })}
            {availableVols.length === 0 && <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No available volunteers</p>}
          </div>
        </div>

        {/* ── Map Area ──────────────────────────────────────────────────────── */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* Map */}
          <div style={{ position: 'absolute', inset: 0, bottom: '52px' }}>
            <MapWrapper
              issues={filteredIssues}
              onIssueClick={setSelected}
              flyTo={flyTo}
              mapRef={mapRef}
              interactive
            />
          </div>

          {/* Custom zoom buttons */}
          <div style={{ position: 'absolute', right: '16px', top: '16px', display: 'flex', flexDirection: 'column', gap: '6px', zIndex: 900 }}>
            {[
              { icon: <Crosshair size={15} />, onClick: () => mapRef.current?.setView([20.5937, 78.9629], 5), title: 'Reset view' },
              { icon: <Plus size={15} />, onClick: () => mapRef.current?.zoomIn(), title: 'Zoom in' },
              { icon: <Minus size={15} />, onClick: () => mapRef.current?.zoomOut(), title: 'Zoom out' },
            ].map(({ icon, onClick, title }) => (
              <button key={title} onClick={onClick} title={title}
                style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(13,13,20,0.9)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(8px)' }}>
                {icon}
              </button>
            ))}
          </div>

          {/* Issue Popup */}
          {selectedIssue && (
            <div
              style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -60%)', background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '12px', width: '290px', padding: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)', zIndex: 1000, animation: 'fadeIn 200ms ease' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span className={`badge-${selectedIssue.urgency === 'high' ? 'high' : selectedIssue.urgency === 'medium' ? 'medium' : 'low'}`}>
                  {getCategoryEmoji(selectedIssue.category)} {selectedIssue.urgency?.toUpperCase()}
                </span>
                <button onClick={() => { setSelected(null); setAssignVol(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                  <X size={16} />
                </button>
              </div>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>{selectedIssue.title}</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '10px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{selectedIssue.description}</p>
              {selectedIssue.location && (
                <div style={{ background: 'var(--bg-elevated)', borderRadius: '7px', padding: '8px 10px', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                  <MapPin size={11} color="var(--text-muted)" />
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{selectedIssue.location}</span>
                </div>
              )}
              {selectedIssue.status === 'pending' && (
                <>
                  <select className="select-field" value={assignVol} onChange={(e) => setAssignVol(e.target.value)} style={{ marginBottom: '8px', height: '36px', fontSize: '12px' }}>
                    <option value="">Assign a volunteer...</option>
                    {availableVols.map((v) => <option key={v.uid} value={v.uid}>{v.name}</option>)}
                  </select>
                  <button className="btn-gradient" onClick={handleAssign} disabled={assigning || !assignVol} style={{ height: '38px', fontSize: '12px', opacity: !assignVol ? 0.5 : 1 }}>
                    {assigning ? 'Assigning...' : 'Assign Volunteer'}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Bottom Status Bar */}
          <div
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '52px', background: 'rgba(13,13,20,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid var(--border-default)', display: 'flex', alignItems: 'center', padding: '0 16px', gap: '16px', zIndex: 900 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 2s infinite' }} />
              <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '12px', fontWeight: 500, color: '#ef4444' }}>
                {highCount} ACTIVE EMERGENCIES
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Users size={13} color="var(--text-muted)" />
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{availableVols.length} Online</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn-ghost" onClick={exportCSV} style={{ fontSize: '11px', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Download size={12} /> Export
              </button>
              <button onClick={focusHotspots}
                style={{ fontSize: '11px', padding: '5px 12px', display: 'flex', alignItems: 'center', gap: '5px', background: 'var(--accent-gradient)', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>
                <Target size={12} /> Focus Hotspots
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
