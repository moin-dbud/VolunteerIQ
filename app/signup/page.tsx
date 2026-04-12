'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, User, Mail, ChevronDown, Lock, Zap } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import PhoneModal from '@/components/PhoneModal';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  // Phone modal state
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [pendingUid, setPendingUid] = useState('');
  const [pendingRedirect, setPendingRedirect] = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Full name is required.';
    if (!email.trim()) e.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Please enter a valid email address.';
    if (!role) e.role = 'Please select your role.';
    if (!password) e.password = 'Password is required.';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;
    setLoading(true);
    try {
      const { uid, redirectPath } = await signUp(email, password, name, role);
      // Show phone modal BEFORE redirecting
      setPendingUid(uid);
      setPendingRedirect(redirectPath);
      setShowPhoneModal(true);
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to create account.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSave = async (phone: string) => {
    if (pendingUid) {
      try {
        await updateDoc(doc(db, 'users', pendingUid), { phone });
      } catch (err) {
        console.error('[PhoneModal] Failed to save phone:', err);
      }
    }
    setShowPhoneModal(false);
    router.push(pendingRedirect || '/');
  };

  const handlePhoneSkip = () => {
    setShowPhoneModal(false);
    router.push(pendingRedirect || '/');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-base)' }}>
      {/* Left Panel */}
      <div
        style={{
          width: '55%',
          background: 'var(--bg-base)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px 64px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background gradient mesh */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 20% 50%, rgba(147,51,234,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(192,38,211,0.06) 0%, transparent 50%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '480px' }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '64px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--accent-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Zap size={16} color="white" />
            </div>
            <span
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              VolunteerIQ
            </span>
          </div>

          {/* Headline */}
          <h1
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '48px',
              fontWeight: 700,
              lineHeight: 1.15,
              color: 'var(--text-primary)',
              marginBottom: '20px',
            }}
          >
            Join the{' '}
            <span style={{ color: 'var(--accent-secondary)' }}>Pulse</span> of Community Impact
          </h1>

          <p
            style={{
              fontSize: '16px',
              color: 'var(--text-secondary)',
              lineHeight: 1.7,
              marginBottom: '48px',
            }}
          >
            Unite with a global network of changemakers. Our AI-driven command center helps you
            deploy resources exactly where they&apos;re needed most.
          </p>

          {/* Feature Pills */}
          <div style={{ display: 'flex', gap: '16px' }}>
            {[
              {
                icon: '⚡',
                label: 'REAL-TIME',
                desc: 'Instant response protocols for local and global crises.',
              },
              {
                icon: '🔮',
                label: 'AI INSIGHTS',
                desc: 'Predictive modeling for community volunteer needs.',
              },
            ].map(({ icon, label, desc }) => (
              <div
                key={label}
                style={{
                  flex: 1,
                  border: '1px solid var(--border-default)',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '6px',
                  }}
                >
                  <span style={{ fontSize: '14px' }}>{icon}</span>
                  <span
                    style={{
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      color: 'var(--accent-primary)',
                    }}
                  >
                    {label}
                  </span>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Signup Form */}
      <div
        style={{
          width: '45%',
          background: 'var(--bg-surface)',
          borderLeft: '1px solid var(--border-default)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '48px',
          minHeight: '100vh',
        }}
      >
        <div style={{ maxWidth: '380px', width: '100%', margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: '32px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              marginBottom: '8px',
            }}
          >
            Signup
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginBottom: '32px',
            }}
          >
            Create your command center account to get started.
          </p>

          {errors.form && (
            <div
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '13px',
                color: 'var(--urgency-high)',
                marginBottom: '16px',
              }}
            >
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Full Name */}
            <div>
              <label className="label-muted" style={{ display: 'block', marginBottom: '6px' }}>
                FULL NAME
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={15}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="text"
                  className="input-field input-with-icon"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              {errors.name && (
                <p style={{ fontSize: '12px', color: 'var(--urgency-high)', marginTop: '4px' }}>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="label-muted" style={{ display: 'block', marginBottom: '6px' }}>
                EMAIL ADDRESS
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={15}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type="email"
                  className="input-field input-with-icon"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              {errors.email && (
                <p style={{ fontSize: '12px', color: 'var(--urgency-high)', marginTop: '4px' }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Primary Role */}
            <div>
              <label className="label-muted" style={{ display: 'block', marginBottom: '6px' }}>
                PRIMARY ROLE
              </label>
              <div style={{ position: 'relative' }}>
                <select
                  className="select-field"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{ color: role ? 'var(--text-primary)' : 'var(--text-muted)' }}
                >
                  <option value="" disabled>
                    Select your role
                  </option>
                  <option value="coordinator">NGO Coordinator</option>
                  <option value="volunteer">Volunteer</option>
                </select>
                <ChevronDown
                  size={15}
                  color="var(--text-muted)"
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    pointerEvents: 'none',
                  }}
                />
              </div>
              {errors.role && (
                <p style={{ fontSize: '12px', color: 'var(--urgency-high)', marginTop: '4px' }}>
                  {errors.role}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="label-muted" style={{ display: 'block', marginBottom: '6px' }}>
                PASSWORD
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={15}
                  color="var(--text-muted)"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="input-field input-with-icon"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p style={{ fontSize: '12px', color: 'var(--urgency-high)', marginTop: '4px' }}>
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn-gradient"
              disabled={loading}
              style={{ marginTop: '8px' }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p
            style={{
              textAlign: 'center',
              fontSize: '14px',
              color: 'var(--text-secondary)',
              marginTop: '20px',
            }}
          >
            Already have an account?{' '}
            <Link
              href="/login"
              style={{ color: 'var(--accent-primary)', fontWeight: 600, textDecoration: 'none' }}
            >
              Login
            </Link>
          </p>

          <p
            style={{
              textAlign: 'center',
              fontSize: '10px',
              color: 'var(--text-muted)',
              marginTop: '24px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            BY JOINING, YOU AGREE TO OUR TERMS OF SERVICE &amp; PRIVACY POLICY
          </p>
        </div>
      </div>

      {/* Phone number modal — shown immediately after account creation */}
      <PhoneModal
        isOpen={showPhoneModal}
        onSave={handlePhoneSave}
        onSkip={handlePhoneSkip}
      />
    </div>
  );
}
