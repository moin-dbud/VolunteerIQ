'use client';

import { useEffect, useState } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import {
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  deleteUser,
} from 'firebase/auth';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import AppShell from '@/components/AppShell';
import { User as UserIcon, Bell, Settings as SettingsIcon, Shield, Eye, EyeOff } from 'lucide-react';

// ── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({ on, onChange, disabled }: { on: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <div
      onClick={() => !disabled && onChange()}
      style={{
        width: '44px', height: '24px', borderRadius: '12px', flexShrink: 0,
        background: on ? 'var(--accent-primary)' : 'var(--bg-elevated)',
        border: `1px solid ${on ? 'var(--accent-primary)' : 'var(--border-default)'}`,
        position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.2s, border-color 0.2s',
      }}
    >
      <div style={{
        width: '18px', height: '18px', borderRadius: '50%',
        background: 'white',
        position: 'absolute', top: '2px',
        left: on ? '23px' : '2px',
        transition: 'left 0.2s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </div>
  );
}

// ── Section Card ─────────────────────────────────────────────────────────────
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

// ── Field Row ────────────────────────────────────────────────────────────────
function Field({ label, note, children }: { label: string; note?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <label className="label-muted" style={{ display: 'block', marginBottom: '6px' }}>{label}</label>
      {children}
      {note && <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>{note}</p>}
    </div>
  );
}

// ── Toggle Row ───────────────────────────────────────────────────────────────
function ToggleRow({ label, description, on, onChange }: { label: string; description: string; on: boolean; onChange: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border-default)' }}>
      <div>
        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' }}>{label}</p>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{description}</p>
      </div>
      <Toggle on={on} onChange={onChange} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════════
export default function CoordinatorSettingsPage() {
  const { user, userProfile, changePassword, deleteAccount } = useAuth();
  const { addToast } = useToast();

  // ── Section 1: Profile ───────────────────────────────────────────────────
  const [name, setName]             = useState('');
  const [email, setEmail]           = useState('');
  const [org, setOrg]               = useState('');
  const [phone, setPhone]           = useState('');
  const [city, setCity]             = useState('');
  const [savingProfile, setSavingP] = useState(false);

  // ── Section 2: Notifications ─────────────────────────────────────────────
  const [notifPrefs, setNotif] = useState({
    newIssue: true, urgentAlert: true, volunteerAssignment: false, dailySummary: false,
  });
  const [savingNotif, setSavingN] = useState(false);

  // ── Section 3: Dashboard Prefs ───────────────────────────────────────────
  const [dashPrefs, setDash] = useState({
    defaultMapCity: '', issuesPerPage: 10, autoRefresh: true, showCompleted: false,
  });
  const [savingDash, setSavingD] = useState(false);

  // ── Section 4: Password ──────────────────────────────────────────────────
  const [showPwForm, setShowPwForm]   = useState(false);
  const [currentPw, setCurrentPw]     = useState('');
  const [newPw, setNewPw]             = useState('');
  const [confirmPw, setConfirmPw]     = useState('');
  const [showPw, setShowPw]           = useState(false);
  const [savingPw, setSavingPw]       = useState(false);
  const [showDeleteModal, setDelModal] = useState(false);
  const [deletePassword, setDeletePw] = useState('');
  const [deleting, setDeleting]       = useState(false);

  // ── Load from userProfile ─────────────────────────────────────────────────
  useEffect(() => {
    if (!userProfile) return;
    setName(userProfile.name || '');
    setEmail(userProfile.email || '');
    setOrg(userProfile.organization || '');
    setPhone(userProfile.phone || '');
    setCity(userProfile.location || '');
    if (userProfile.notificationPrefs) setNotif(userProfile.notificationPrefs as any);
    if (userProfile.dashboardPrefs) setDash(userProfile.dashboardPrefs as any);
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

  const handleChangePassword = async () => {
    if (newPw !== confirmPw) { addToast('Passwords do not match.', 'error'); return; }
    if (newPw.length < 6)    { addToast('Password must be at least 6 characters.', 'error'); return; }
    setSavingPw(true);
    try {
      await changePassword(currentPw, newPw);
      addToast('Password updated successfully.', 'success');
      setCurrentPw(''); setNewPw(''); setConfirmPw(''); setShowPwForm(false);
    } catch (err: any) {
      const msg = err?.code === 'auth/wrong-password' ? 'Current password is incorrect.' : 'Failed to update password.';
      addToast(msg, 'error');
    } finally { setSavingPw(false); }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount(deletePassword);
    } catch (err: any) {
      const msg = err?.code === 'auth/wrong-password' ? 'Incorrect password.' : 'Failed to delete account.';
      addToast(msg, 'error');
    } finally { setDeleting(false); }
  };

  return (
    <AppShell requireCoordinator>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <p className="label-small" style={{ marginBottom: '8px' }}>COORDINATOR</p>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '32px', fontWeight: 700, color: 'var(--text-primary)' }}>Account Settings</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>Manage your command center preferences.</p>
      </div>

      {/* ── Section 1: Profile Information ─────────────────────────────────── */}
      <Section icon={<UserIcon size={18} color="var(--accent-primary)" />} title="Profile Information">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
          <Field label="FULL NAME">
            <input className="input-field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </Field>
          <Field label="EMAIL ADDRESS" note="Changing email requires re-authentication">
            <input className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          </Field>
          <Field label="ORGANIZATION NAME">
            <input className="input-field" value={org} onChange={(e) => setOrg(e.target.value)} placeholder="Enter your NGO name" />
          </Field>
          <Field label="PHONE NUMBER">
            <input className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
          </Field>
          <Field label="CITY / REGION" note="Used for proximity matching on the map">
            <input className="input-field" value={city} onChange={(e) => setCity(e.target.value)} placeholder="e.g. Mumbai, Maharashtra" />
          </Field>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
          <button className="btn-primary" disabled={savingProfile} style={{ minWidth: '140px' }}
            onClick={() => save({ name, email, organization: org, phone, location: city }, setSavingP, 'Profile saved successfully.')}>
            {savingProfile ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </Section>

      {/* ── Section 2: Notifications ──────────────────────────────────────── */}
      <Section icon={<Bell size={18} color="var(--accent-primary)" />} title="Notifications">
        <ToggleRow label="New Issue Submitted" description="Get notified when a new issue is reported" on={notifPrefs.newIssue} onChange={() => setNotif((p) => ({ ...p, newIssue: !p.newIssue }))} />
        <ToggleRow label="Urgent Issue Alert" description="Immediate alert for high-priority submissions" on={notifPrefs.urgentAlert} onChange={() => setNotif((p) => ({ ...p, urgentAlert: !p.urgentAlert }))} />
        <ToggleRow label="Volunteer Assignment" description="When a volunteer is matched to an issue" on={notifPrefs.volunteerAssignment} onChange={() => setNotif((p) => ({ ...p, volunteerAssignment: !p.volunteerAssignment }))} />
        <ToggleRow label="Daily Summary Report" description="Receive a daily digest of operations" on={notifPrefs.dailySummary} onChange={() => setNotif((p) => ({ ...p, dailySummary: !p.dailySummary }))} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button className="btn-primary" disabled={savingNotif} style={{ minWidth: '160px' }}
            onClick={() => save({ notificationPrefs: notifPrefs }, setSavingN, 'Notification preferences saved.')}>
            {savingNotif ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </Section>

      {/* ── Section 3: Dashboard Prefs ─────────────────────────────────────── */}
      <Section icon={<SettingsIcon size={18} color="var(--accent-primary)" />} title="Dashboard Preferences">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
          <Field label="DEFAULT MAP CITY" note="Sets the default center for Map View">
            <input className="input-field" value={dashPrefs.defaultMapCity} onChange={(e) => setDash((p) => ({ ...p, defaultMapCity: e.target.value }))} placeholder="e.g. Mumbai" />
          </Field>
          <Field label="ISSUES PER PAGE">
            <select className="select-field" value={dashPrefs.issuesPerPage} onChange={(e) => setDash((p) => ({ ...p, issuesPerPage: Number(e.target.value) }))}>
              {[5, 10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
        </div>
        <ToggleRow label="Auto-refresh Dashboard" description="Refreshes Firestore data every 30 seconds" on={dashPrefs.autoRefresh} onChange={() => setDash((p) => ({ ...p, autoRefresh: !p.autoRefresh }))} />
        <ToggleRow label="Show Completed Issues" description="Display resolved issues on the dashboard table" on={dashPrefs.showCompleted} onChange={() => setDash((p) => ({ ...p, showCompleted: !p.showCompleted }))} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
          <button className="btn-primary" disabled={savingDash} style={{ minWidth: '160px' }}
            onClick={() => save({ dashboardPrefs: dashPrefs }, setSavingD, 'Dashboard preferences saved.')}>
            {savingDash ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </Section>

      {/* ── Section 4: Account & Security ──────────────────────────────────── */}
      <Section icon={<Shield size={18} color="var(--accent-primary)" />} title="Account & Security">
        {/* Change password */}
        <div style={{ marginBottom: '24px' }}>
          <button className="btn-ghost" onClick={() => setShowPwForm(!showPwForm)} style={{ fontSize: '14px' }}>
            {showPwForm ? 'Cancel' : 'Change Password'}
          </button>

          {showPwForm && (
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '420px' }}>
              {[
                { label: 'CURRENT PASSWORD', value: currentPw, set: setCurrentPw },
                { label: 'NEW PASSWORD', value: newPw, set: setNewPw },
                { label: 'CONFIRM NEW PASSWORD', value: confirmPw, set: setConfirmPw },
              ].map(({ label, value, set }) => (
                <div key={label}>
                  <label className="label-muted" style={{ display: 'block', marginBottom: '5px' }}>{label}</label>
                  <div style={{ position: 'relative' }}>
                    <input className="input-field" type={showPw ? 'text' : 'password'} value={value} onChange={(e) => set(e.target.value)} placeholder="••••••••" style={{ paddingRight: '40px' }} />
                    <button onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              ))}
              <button className="btn-primary" onClick={handleChangePassword} disabled={savingPw} style={{ alignSelf: 'flex-start', minWidth: '160px' }}>
                {savingPw ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div style={{ borderLeft: '4px solid var(--urgency-high)', padding: '16px 20px', background: 'rgba(239,68,68,0.04)', borderRadius: '0 8px 8px 0' }}>
          <p className="label-muted" style={{ color: 'var(--urgency-high)', marginBottom: '10px' }}>DANGER ZONE</p>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
            Permanently delete your account and all associated data. This action cannot be undone.
          </p>
          <button
            onClick={() => setDelModal(true)}
            style={{ background: 'transparent', border: '1px solid var(--urgency-high)', color: 'var(--urgency-high)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: 500, fontFamily: 'DM Sans, sans-serif', transition: 'background 0.15s' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.1)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.background = 'transparent')}
          >
            Delete Account
          </button>
        </div>
      </Section>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'var(--overlay-dark)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--urgency-high)', borderRadius: '12px', width: '400px', padding: '28px' }}>
            <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '18px', fontWeight: 700, color: 'var(--urgency-high)', marginBottom: '10px' }}>Are you sure?</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.6 }}>This will permanently delete your account and all data. This cannot be undone.</p>
            <label className="label-muted" style={{ display: 'block', marginBottom: '6px' }}>CONFIRM WITH YOUR PASSWORD</label>
            <input className="input-field" type="password" value={deletePassword} onChange={(e) => setDeletePw(e.target.value)} placeholder="Your current password" style={{ marginBottom: '16px' }} />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button className="btn-ghost" onClick={() => { setDelModal(false); setDeletePw(''); }}>Cancel</button>
              <button
                disabled={deleting || !deletePassword}
                onClick={handleDeleteAccount}
                style={{ background: 'var(--urgency-high)', border: 'none', color: 'white', padding: '10px 20px', borderRadius: '8px', cursor: deleting ? 'wait' : 'pointer', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: '14px' }}
              >
                {deleting ? 'Deleting...' : 'Delete My Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
