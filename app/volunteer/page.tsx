'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import AppShell from '@/components/AppShell';
import {
  Pencil,
  ShieldCheck,
  Stethoscope,
  Truck,
  GraduationCap,
  Utensils,
  AlertCircle,
  Heart,
  Wrench,
  Monitor,
  Scale,
  Globe,
  Users,
  Check,
  ChevronDown,
  MapPin,
  Clock,
} from 'lucide-react';
import { Issue, User, SKILL_OPTIONS } from '@/lib/types';

// ── Icon map matching SKILL_OPTIONS ─────────────────────────────────────────
const SKILL_ICONS: Record<string, React.ReactNode> = {
  medical:      <Stethoscope size={14} />,
  logistics:    <Truck size={14} />,
  teaching:     <GraduationCap size={14} />,
  food:         <Utensils size={14} />,
  emergency:    <AlertCircle size={14} />,
  mentalhealth: <Heart size={14} />,
  construction: <Wrench size={14} />,
  tech:         <Monitor size={14} />,
  legal:        <Scale size={14} />,
  translation:  <Globe size={14} />,
  childcare:    <Users size={14} />,
  eldercare:    <Heart size={14} />,
};

const DEFAULT_SKILLS = SKILL_OPTIONS.slice(0, 4);
const EXTRA_SKILLS   = SKILL_OPTIONS.slice(4);

// ── Skill Checkbox ─────────────────────────────────────────────────────────
function SkillCheckbox({
  id, label, checked, onChange,
}: { id: string; label: string; checked: boolean; onChange: (id: string) => void }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', userSelect: 'none' }}>
      <div
        onClick={() => onChange(id)}
        style={{
          width: '18px', height: '18px', borderRadius: '4px', flexShrink: 0, cursor: 'pointer',
          border: `2px solid ${checked ? 'var(--accent-primary)' : 'var(--border-default)'}`,
          background: checked ? 'var(--accent-primary)' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s ease',
        }}
      >
        {checked && <Check size={11} color="white" strokeWidth={3} />}
      </div>
      {SKILL_ICONS[id] && (
        <span style={{ color: 'var(--text-muted)', display: 'flex' }}>{SKILL_ICONS[id]}</span>
      )}
      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{label}</span>
    </label>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// VOLUNTEER VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function VolunteerView() {
  const { user, userProfile } = useAuth();
  const { addToast } = useToast();

  const [profile, setProfile]         = useState<User | null>(null);
  const [missions, setMissions]       = useState<Issue[]>([]);
  const [editMode, setEditMode]       = useState(false);
  const [showAllSkills, setShowAll]   = useState(false);
  const [saving, setSaving]           = useState(false);

  // Editable fields
  const [name, setName]         = useState('');
  const [phone, setPhone]       = useState('');
  const [location, setLocation] = useState('');
  const [skills, setSkills]     = useState<string[]>([]);

  // ── Load profile from Firestore ────────────────────────────────────────────
  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid)).then((snap) => {
      if (snap.exists()) {
        const data = snap.data() as User;
        setProfile(data);
        setName(data.name || '');
        setPhone(data.phone || '');
        setLocation(data.location || '');
        setSkills(data.skills || []);    // ← initial state from Firestore
      }
    });
  }, [user]);

  // ── Real-time pending missions ─────────────────────────────────────────────
  useEffect(() => {
    const q = query(collection(db, 'issues'), where('status', '==', 'pending'));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map((d) => ({ issueId: d.id, ...d.data() } as Issue));
      setMissions(docs.sort((a, b) => {
        const urgOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
        return (urgOrder[a.urgency] ?? 3) - (urgOrder[b.urgency] ?? 3);
      }));
    });
    return () => unsub();
  }, []);  // no dependency on `skills` — missions come from Firestore urgency

  // ── Toggle a skill (optimistic) ────────────────────────────────────────────
  const toggleSkill = useCallback((id: string) => {
    setSkills((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  }, []);

  // ── Save profile to Firestore ──────────────────────────────────────────────
  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name, phone, location, skills, updatedAt: serverTimestamp(),
      });
      setProfile((prev) => prev ? { ...prev, name, phone, location, skills } : prev);
      addToast('Profile updated successfully.', 'success');
      setEditMode(false);
    } catch (err) {
      console.error(err);
      addToast('Failed to save profile. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const acceptMission = async (issue: Issue) => {
    if (!user || !issue.issueId) return;
    try {
      await updateDoc(doc(db, 'issues', issue.issueId), {
        status: 'assigned', assignedTo: user.uid, updatedAt: serverTimestamp(),
      });
      addToast("You've been assigned to this mission.", 'success');
    } catch {
      addToast('Failed to accept mission.', 'error');
    }
  };

  const displayName = name || profile?.name || userProfile?.name || 'Volunteer';
  const initials    = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      {/* Profile Banner */}
      <div style={{ background: 'linear-gradient(135deg,rgba(147,51,234,0.2),rgba(192,38,211,0.1))', border: '1px solid var(--border-default)', borderRadius: '12px', padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 700, color: 'white', fontFamily: 'Space Grotesk, sans-serif', flexShrink: 0 }}>
          {initials}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2px' }}>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>{displayName}</h2>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#22c55e', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '4px', padding: '2px 8px' }}>● ACTIVE RESPONDER</span>
          </div>
          {location && <p style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}><MapPin size={11} /> {location}</p>}
        </div>
        <button onClick={() => setEditMode(!editMode)} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
          <Pencil size={13} /> {editMode ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '288px 1fr', gap: '24px' }}>
        {/* ── Left: Profile Cards ──────────────────────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Profile Info Card */}
          <div className="card" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
            <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>Complete Profile</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '18px' }}>Unlock more critical tasks by completing your credentials.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label className="label-muted" style={{ display: 'block', marginBottom: '5px' }}>FULL NAME</label>
                <input type="text" className="input-field" value={name} onChange={(e) => setName(e.target.value)} readOnly={!editMode} placeholder="Your full name" />
              </div>
              <div>
                <label className="label-muted" style={{ display: 'block', marginBottom: '5px' }}>EMAIL ADDRESS</label>
                <input type="email" className="input-field" value={profile?.email || ''} readOnly style={{ opacity: 0.7, cursor: 'not-allowed' }} />
              </div>
              <div>
                <label className="label-muted" style={{ display: 'block', marginBottom: '5px' }}>PHONE</label>
                <input type="tel" className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} readOnly={!editMode} placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="label-muted" style={{ display: 'block', marginBottom: '5px' }}>LOCATION</label>
                <input type="text" className="input-field" value={location} onChange={(e) => setLocation(e.target.value)} readOnly={!editMode} placeholder="City, State" />
              </div>
            </div>

            {editMode && (
              <button className="btn-primary" onClick={saveProfile} disabled={saving} style={{ width: '100%', marginTop: '14px' }}>
                {saving ? 'Saving...' : 'Update Information'}
              </button>
            )}
          </div>

          {/* ── Specializations Card (BUG FIX 2) ─────────────────────────── */}
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <ShieldCheck size={16} color="var(--accent-primary)" />
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>Specializations</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {DEFAULT_SKILLS.map(({ id, label }) => (
                <SkillCheckbox key={id} id={id} label={label} checked={skills.includes(id)} onChange={toggleSkill} />
              ))}

              {showAllSkills && EXTRA_SKILLS.map(({ id, label }) => (
                <SkillCheckbox key={id} id={id} label={label} checked={skills.includes(id)} onChange={toggleSkill} />
              ))}
            </div>

            <button
              onClick={() => setShowAll(!showAllSkills)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent-primary)', fontSize: '12px', fontWeight: 600, marginTop: '12px', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
            >
              <ChevronDown size={13} style={{ transform: showAllSkills ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              {showAllSkills ? 'HIDE SKILLS' : `VIEW ALL ${SKILL_OPTIONS.length} SKILLS`}
            </button>

            <button
              className="btn-primary"
              onClick={saveProfile}
              disabled={saving}
              style={{ width: '100%', marginTop: '12px', fontSize: '13px' }}
            >
              {saving ? 'Saving...' : 'Save Skills'}
            </button>
          </div>
        </div>

        {/* ── Right: Available Missions ───────────────────────────────────── */}
        <div>
          <div style={{ marginBottom: '18px' }}>
            <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)' }}>Available Missions</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Real-time opportunities in <span style={{ color: 'var(--accent-secondary)' }}>{location?.split(',')[0] || 'Your Area'}</span>
            </p>
          </div>

          {missions.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', background: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
              <MapPin size={40} color="var(--text-muted)" style={{ opacity: 0.3, margin: '0 auto 10px' }} />
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '17px', color: 'var(--text-muted)' }}>No missions available</p>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '260px', margin: '6px auto 0' }}>Check back soon for matching opportunities.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {missions.map((mission) => {
                const isUrgent  = mission.urgency === 'high';
                const cat       = (mission.suggestedCategory || mission.category || '').toLowerCase();
                const isMatch   = skills.some((s) => cat.includes(s) || s.includes(cat.split(' ')[0]));
                const borderCol = isUrgent ? 'var(--urgency-high)' : isMatch ? 'var(--accent-primary)' : 'transparent';

                return (
                  <div key={mission.issueId} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderLeft: `4px solid ${borderCol}`, borderRadius: '10px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: '60px', minHeight: '90px', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '22px' }}>
                      {isUrgent ? '🚨' : isMatch ? '🎯' : '📋'}
                    </div>
                    <div style={{ flex: 1, padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        {isUrgent && <span className="badge-high">URGENT</span>}
                        {!isUrgent && isMatch && <span className="badge-medium">SKILL MATCH</span>}
                        {!isUrgent && !isMatch && <span className="badge-low">OPEN</span>}
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <Clock size={9} /> Recent
                        </span>
                      </div>
                      <h4 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>{mission.title}</h4>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '8px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{mission.description}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', gap: '5px' }}>
                          {[mission.suggestedCategory || mission.category, mission.location?.split(',')[0]].filter(Boolean).map((tag) => (
                            <span key={tag} style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)', fontSize: '10px', padding: '2px 8px', borderRadius: '999px' }}>{tag}</span>
                          ))}
                        </div>
                        <button className={isUrgent ? 'btn-primary' : 'btn-ghost'} onClick={() => acceptMission(mission)} style={{ fontSize: '12px', padding: '7px 14px', whiteSpace: 'nowrap' }}>
                          {isUrgent ? 'Apply for Task' : "I'm Available"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// COORDINATOR VIEW
// ═══════════════════════════════════════════════════════════════════════════════
function CoordinatorView() {
  const [volunteers, setVolunteers] = useState<User[]>([]);
  const [search, setSearch]         = useState('');
  const [selected, setSelected]     = useState<User | null>(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'volunteer'));
    const unsub = onSnapshot(q, (snap) => {
      setVolunteers(snap.docs.map((d) => d.data() as User));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filtered = volunteers.filter(
    (v) =>
      v.name?.toLowerCase().includes(search.toLowerCase()) ||
      v.location?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <div style={{ marginBottom: '28px' }}>
        <p className="label-small" style={{ marginBottom: '8px' }}>COORDINATOR VIEW</p>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Volunteer <span style={{ color: 'var(--accent-secondary)' }}>Network</span>
        </h1>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '380px', marginBottom: '20px' }}>
        <input type="text" className="input-field" placeholder="Search volunteers by name or location..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: '68px' }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: '48px', textAlign: 'center' }}>
          <Users size={44} color="var(--text-muted)" style={{ opacity: 0.3, margin: '0 auto 10px' }} />
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '17px', color: 'var(--text-muted)' }}>No volunteers yet</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filtered.map((vol) => {
            const initials = vol.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'V';
            const isAvail  = !vol.availabilityStatus || vol.availabilityStatus === 'available';
            return (
              <div
                key={vol.uid}
                onClick={() => setSelected(vol)}
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '14px', cursor: 'pointer', transition: 'background 0.15s', marginBottom: '0' }}
                onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'var(--bg-elevated)')}
                onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.background = 'var(--bg-surface)')}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 600, color: 'white', flexShrink: 0 }}>{initials}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '2px' }}>{vol.name}</p>
                  {vol.location && <p style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '2px' }}><MapPin size={9} /> {vol.location}</p>}
                </div>
                <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', maxWidth: '220px' }}>
                  {(vol.skills || []).slice(0, 3).map((s) => (
                    <span key={s} style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', fontSize: '10px', padding: '2px 8px', borderRadius: '999px' }}>
                      {SKILL_OPTIONS.find((o) => o.id === s)?.label || s}
                    </span>
                  ))}
                </div>
                <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px', background: isAvail ? 'rgba(34,197,94,0.1)' : 'rgba(63,63,70,0.5)', color: isAvail ? '#22c55e' : 'var(--text-muted)', border: `1px solid ${isAvail ? 'rgba(34,197,94,0.3)' : 'var(--border-default)'}`, whiteSpace: 'nowrap' }}>
                  {vol.availabilityStatus?.toUpperCase() || 'AVAILABLE'}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Profile Drawer */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--overlay-dark)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
          onClick={() => setSelected(null)}>
          <div onClick={(e) => e.stopPropagation()}
            style={{ width: '380px', height: '100vh', background: 'var(--bg-surface)', borderLeft: '1px solid var(--border-default)', padding: '28px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '22px' }}>
              <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>Volunteer Profile</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '20px' }}>×</button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '22px' }}>
              <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 700, color: 'white' }}>
                {selected.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>{selected.name}</p>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{selected.email}</p>
              </div>
            </div>
            {[{ label: 'LOCATION', value: selected.location || '—' }, { label: 'PHONE', value: selected.phone || '—' }, { label: 'STATUS', value: selected.availabilityStatus?.toUpperCase() || 'AVAILABLE' }].map(({ label, value }) => (
              <div key={label} style={{ marginBottom: '14px' }}>
                <label className="label-muted" style={{ display: 'block', marginBottom: '3px' }}>{label}</label>
                <p style={{ fontSize: '14px', color: 'var(--text-primary)' }}>{value}</p>
              </div>
            ))}
            <label className="label-muted" style={{ display: 'block', marginBottom: '8px' }}>SKILLS</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              {(selected.skills || []).map((s) => (
                <span key={s} style={{ background: 'rgba(147,51,234,0.1)', border: '1px solid rgba(147,51,234,0.3)', color: 'var(--accent-primary)', fontSize: '11px', padding: '3px 10px', borderRadius: '999px' }}>
                  {SKILL_OPTIONS.find((o) => o.id === s)?.label || s}
                </span>
              ))}
              {(!selected.skills || selected.skills.length === 0) && <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No skills listed</p>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function VolunteerPage() {
  const { userProfile } = useAuth();
  return (
    <AppShell>
      {userProfile?.role === 'coordinator' ? <CoordinatorView /> : <VolunteerView />}
    </AppShell>
  );
}
