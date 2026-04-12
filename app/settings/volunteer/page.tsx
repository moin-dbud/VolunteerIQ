'use client';

import { useEffect, useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import AppShell from '@/components/AppShell';
import { User as UserIcon, Clock, Shield, Check, Eye, EyeOff } from 'lucide-react';
import { SKILL_OPTIONS } from '@/lib/types';

// ── Toggle Switch ─────────────────────────────────────────────────────────────
function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange}
      style={{ width: '44px', height: '24px', borderRadius: '12px', flexShrink: 0, background: on ? 'var(--accent-primary)' : 'var(--bg-elevated)', border: `1px solid ${on ? 'var(--accent-primary)' : 'var(--border-default)'}`, position: 'relative', cursor: 'pointer', transition: 'background 0.2s' }}>
      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'white', position: 'absolute', top: '2px', left: on ? '23px' : '2px', transition: 'left 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="card" style={{ marginBottom: '20px', padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-default)' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(147,51,234,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', fontWeight: 600, color: 'var(--text-primary)' }}>{title}</h2>
      </div>
      {children}
    </div>
  );
}

const AVAILABILITY_OPTIONS = [
  { value: 'available', label: 'Available', desc: 'Ready to accept new missions', dot: '#22c55e' },
  { value: 'busy',      label: 'Busy',      desc: 'Currently on assignment',     dot: '#f59e0b' },
  { value: 'offline',   label: 'Offline',   desc: 'Not accepting missions',       dot: '#52525b' },
];

const DISTANCE_OPTIONS = ['1km', '5km', '10km', '25km', '50km+'];
const HOURS_OPTIONS    = ['1-5 hrs', '5-10 hrs', '10-20 hrs', '20+ hrs'];

export default function VolunteerSettingsPage() {
  const { user, userProfile, changePassword, deleteAccount } = useAuth();
  const { addToast } = useToast();

  // Section 1: Personal Info
  const [name, setName]     = useState('');
  const [email, setEmail]   = useState('');
  const [phone, setPhone]   = useState('');
  const [city, setCity]     = useState('');
  const [bio, setBio]       = useState('');
  const [savingP, setSP]    = useState(false);

  // Section 2: Availability
  const [avail, setAvail]           = useState<'available' | 'busy' | 'offline'>('available');
  const [prefSkills, setPrefSkills] = useState<string[]>([]);
  const [maxDist, setMaxDist]       = useState('10km');
  const [hours, setHours]           = useState('5-10 hrs');
  const [savingA, setSA]            = useState(false);

  // Section 3: Security
  const [showPwForm, setShowPw]     = useState(false);
  const [currentPw, setCurrentPw]   = useState('');
  const [newPw, setNewPw]           = useState('');
  const [confirmPw, setConfirmPw]   = useState('');
  const [showPwVis, setShowPwVis]   = useState(false);
  const [savingPw, setSavingPw]     = useState(false);
  const [showDel, setShowDel]       = useState(false);
  const [deletePw, setDeletePw]     = useState('');
  const [deleting, setDeleting]     = useState(false);

  useEffect(() => {
    if (!userProfile) return;
    setName(userProfile.name || '');
    setEmail(userProfile.email || '');
    setPhone(userProfile.phone || '');
    setCity(userProfile.location || '');
    setBio(userProfile.bio || '');
    if (userProfile.availabilityStatus) setAvail(userProfile.availabilityStatus);
    if (userProfile.preferredMissionTypes) setPrefSkills(userProfile.preferredMissionTypes);
    if (userProfile.maxDistance) setMaxDist(userProfile.maxDistance);
    if (userProfile.hoursPerWeek) setHours(userProfile.hoursPerWeek);
  }, [userProfile]);

  const save = async (data: Record<string, unknown>, setSaving: (v: boolean) => void, msg: string) => {
    if (!user) return;
    setSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), { ...data, updatedAt: serverTimestamp() });
      addToast(msg, 'success');
    } catch { addToast('Save failed. Please try again.', 'error'); }
    finally { setSaving(false); }
  };

  const togglePrefSkill = (id: string) =>
    setPrefSkills((p) => p.includes(id) ? p.filter((s) => s !== id) : [...p, id]);

  const handleChangePw = async () => {
    if (newPw !== confirmPw) { addToast('Passwords do not match.', 'error'); return; }
    if (newPw.length < 6)    { addToast('Password must be at least 6 characters.', 'error'); return; }
    setSavingPw(true);
    try {
      await changePassword(currentPw, newPw);
      addToast('Password updated successfully.', 'success');
      setCurrentPw(''); setNewPw(''); setConfirmPw(''); setShowPw(false);
    } catch (err: any) {
      addToast(err?.code === 'auth/wrong-password' ? 'Current password is incorrect.' : 'Failed to update password.', 'error');
    } finally { setSavingPw(false); }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount(deletePw);
    } catch (err: any) {
      addToast(err?.code === 'auth/wrong-password' ? 'Incorrect password.' : 'Failed to delete account.', 'error');
    } finally { setDeleting(false); }
  };

  return (
    <AppShell>
      <div style={{ marginBottom: '32px' }}>
        <p className="label-small" style={{ marginBottom: '8px' }}>VOLUNTEER</p>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>My Settings</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>Manage your volunteer profile and preferences.</p>
      </div>

      {/* ── Section 1: Personal Info ──────────────────────────────────────── */}
      <Section icon={<UserIcon size={18} color="var(--accent-primary)" />} title="Personal Information">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
          <div>
            <label className="label-muted" style={{ display: 'block', marginBottom: '6px' }}>FULL NAME</label>
            <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" />
          </div>
          <div>
            <label className="label-muted" style={{ display: 'block', marginBottom: '6px' }}>EMAIL ADDRESS</label>
            <input className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </div>
          <div>
            <label className="label-muted" style={{ display: 'block', marginBottom: '6px' }}>PHONE NUMBER</label>
            <input className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className="label-muted" style={{ display: 'block', marginBottom: '6px' }}>CURRENT CITY</label>
            <input className="input-field" value={city} onChange={(e) => setCity(e.target.value)} placeholder="City, State — used for proximity matching" />
          </div>
        </div>
        <div style={{ marginTop: '16px' }}>
          <label className="label-muted" style={{ display: 'block', marginBottom: '6px' }}>
            BIO / ABOUT <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({bio.length}/280)</span>
          </label>
          <textarea
            className="textarea-field"
            rows={3}
            maxLength={280}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell NGOs about your background and experience..."
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button className="btn-primary" disabled={savingP} style={{ minWidth: '140px' }}
            onClick={() => save({ name, email, phone, location: city, bio }, setSP, 'Profile saved successfully.')}>
            {savingP ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </Section>

      {/* ── Section 2: Availability ───────────────────────────────────────── */}
      <Section icon={<Clock size={18} color="var(--accent-primary)" />} title="Availability & Preferences">
        {/* Availability Radio */}
        <label className="label-muted" style={{ display: 'block', marginBottom: '10px' }}>AVAILABILITY STATUS</label>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '22px' }}>
          {AVAILABILITY_OPTIONS.map(({ value, label, desc, dot }) => {
            const selected = avail === value;
            return (
              <div key={value} onClick={() => setAvail(value as any)}
                style={{ flex: 1, padding: '12px 14px', borderRadius: '10px', border: `1px solid ${selected ? 'var(--accent-primary)' : 'var(--border-default)'}`, background: selected ? 'rgba(147,51,234,0.1)' : 'var(--bg-elevated)', cursor: 'pointer', transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: dot, display: 'inline-block' }} />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: selected ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{label}</span>
                  {selected && <Check size={13} color="var(--accent-primary)" style={{ marginLeft: 'auto' }} />}
                </div>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{desc}</p>
              </div>
            );
          })}
        </div>

        {/* Preferred Mission Types */}
        <label className="label-muted" style={{ display: 'block', marginBottom: '10px' }}>PREFERRED MISSION TYPES</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '22px' }}>
          {SKILL_OPTIONS.map(({ id, label, emoji }) => {
            const selected = prefSkills.includes(id);
            return (
              <label key={id} onClick={() => togglePrefSkill(id)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px', borderRadius: '8px', background: selected ? 'rgba(147,51,234,0.12)' : 'var(--bg-elevated)', border: `1px solid ${selected ? 'var(--accent-primary)' : 'var(--border-default)'}`, cursor: 'pointer', transition: 'all 0.15s' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '3px', border: `2px solid ${selected ? 'var(--accent-primary)' : 'var(--border-default)'}`, background: selected ? 'var(--accent-primary)' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {selected && <Check size={10} color="white" strokeWidth={3} />}
                </div>
                <span style={{ fontSize: '11px' }}>{emoji}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</span>
              </label>
            );
          })}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '8px' }}>
          <div>
            <label className="label-muted" style={{ display: 'block', marginBottom: '6px' }}>MAXIMUM DISTANCE</label>
            <select className="select-field" value={maxDist} onChange={(e) => setMaxDist(e.target.value)}>
              {DISTANCE_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label-muted" style={{ display: 'block', marginBottom: '6px' }}>HOURS AVAILABLE PER WEEK</label>
            <select className="select-field" value={hours} onChange={(e) => setHours(e.target.value)}>
              {HOURS_OPTIONS.map((h) => <option key={h} value={h}>{h}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button className="btn-primary" disabled={savingA} style={{ minWidth: '160px' }}
            onClick={() => save({ availabilityStatus: avail, preferredMissionTypes: prefSkills, maxDistance: maxDist, hoursPerWeek: hours }, setSA, 'Availability preferences saved.')}>
            {savingA ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </Section>

      {/* ── Section 3: Security ───────────────────────────────────────────── */}
      <Section icon={<Shield size={18} color="var(--accent-primary)" />} title="Account & Security">
        <button className="btn-ghost" onClick={() => setShowPw(!showPwForm)} style={{ fontSize: '14px', marginBottom: showPwForm ? '14px' : '24px' }}>
          {showPwForm ? 'Cancel' : 'Change Password'}
        </button>

        {showPwForm && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px', marginBottom: '24px' }}>
            {[
              { label: 'CURRENT PASSWORD', value: currentPw, set: setCurrentPw },
              { label: 'NEW PASSWORD', value: newPw, set: setNewPw },
              { label: 'CONFIRM NEW PASSWORD', value: confirmPw, set: setConfirmPw },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <label className="label-muted" style={{ display: 'block', marginBottom: '5px' }}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <input className="input-field" type={showPwVis ? 'text' : 'password'} value={value} onChange={(e) => set(e.target.value)} placeholder="••••••••" style={{ paddingRight: '40px' }} />
                  <button onClick={() => setShowPwVis(!showPwVis)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showPwVis ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            ))}
            <button className="btn-primary" onClick={handleChangePw} disabled={savingPw} style={{ alignSelf: 'flex-start', minWidth: '160px' }}>
              {savingPw ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        )}

        <div style={{ borderLeft: '4px solid var(--urgency-high)', padding: '16px 20px', background: 'rgba(239,68,68,0.04)', borderRadius: '0 8px 8px 0' }}>
          <p className="label-muted" style={{ color: 'var(--urgency-high)', marginBottom: '8px' }}>DANGER ZONE</p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '12px' }}>Permanently delete your account and all data. Cannot be undone.</p>
          <button onClick={() => setShowDel(true)}
            style={{ background: 'transparent', border: '1px solid var(--urgency-high)', color: 'var(--urgency-high)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, fontFamily: 'DM Sans, sans-serif' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}>
            Delete Account
          </button>
        </div>
      </Section>

      {/* Delete Modal */}
      {showDel && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--overlay-dark)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--urgency-high)', borderRadius: '12px', width: '380px', padding: '28px' }}>
            <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', fontWeight: 700, color: 'var(--urgency-high)', marginBottom: '10px' }}>Are you sure?</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.6 }}>This will permanently delete your volunteer profile. This cannot be undone.</p>
            <label className="label-muted" style={{ display: 'block', marginBottom: '6px' }}>CONFIRM WITH YOUR PASSWORD</label>
            <input className="input-field" type="password" value={deletePw} onChange={(e) => setDeletePw(e.target.value)} placeholder="Your current password" style={{ marginBottom: '16px' }} />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={() => { setShowDel(false); setDeletePw(''); }}>Cancel</button>
              <button disabled={deleting || !deletePw} onClick={handleDeleteAccount}
                style={{ background: 'var(--urgency-high)', border: 'none', color: 'white', padding: '10px 18px', borderRadius: '8px', cursor: deleting ? 'wait' : 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '14px' }}>
                {deleting ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
