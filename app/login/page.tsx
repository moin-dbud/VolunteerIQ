'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle2, Zap, Users, Brain } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';

// ─── Floating orbs ────────────────────────────────────────────────────────────
function FloatingOrbs() {
  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
      {/* Main purple orb */}
      <div style={{
        position: 'absolute', top: '-15%', left: '-10%',
        width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(147,51,234,0.18) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }} />
      {/* Fuchsia orb */}
      <div style={{
        position: 'absolute', bottom: '-10%', right: '-10%',
        width: 500, height: 500, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(192,38,211,0.14) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }} />
      {/* Subtle center light */}
      <div style={{
        position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)',
        width: 800, height: 400, borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(147,51,234,0.05) 0%, transparent 70%)',
        filter: 'blur(60px)',
      }} />
    </div>
  );
}

// ─── Subtle grid overlay ───────────────────────────────────────────────────────
function GridOverlay() {
  return (
    <div style={{
      position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)',
      backgroundSize: '28px 28px',
    }} />
  );
}

// ─── Vertical divider ─────────────────────────────────────────────────────────
function PanelDivider() {
  return (
    <div style={{
      position: 'absolute', top: '10%', bottom: '10%',
      left: '50%', transform: 'translateX(-50%)',
      width: 1,
      background: 'linear-gradient(to bottom, transparent 0%, rgba(147,51,234,0.3) 30%, rgba(192,38,211,0.3) 70%, transparent 100%)',
      pointerEvents: 'none', zIndex: 1,
    }} className="login-divider" />
  );
}

// ─── Input component ──────────────────────────────────────────────────────────
function PBInput({
  type, placeholder, value, onChange, icon: Icon, rightSlot, error, id,
}: {
  id: string; type: string; placeholder: string; value: string;
  onChange: (v: string) => void; icon: React.ComponentType<any>;
  rightSlot?: React.ReactNode; error?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <div style={{ position: 'relative' }}>
        <Icon
          size={15}
          style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: focused ? 'rgba(147,51,234,0.8)' : 'rgba(255,255,255,0.25)',
            transition: 'color 0.2s',
          }}
        />
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '13px 14px 13px 42px',
            background: focused ? 'rgba(147,51,234,0.06)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${error ? 'rgba(239,68,68,0.6)' : focused ? 'rgba(147,51,234,0.5)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 12,
            color: '#fff',
            fontSize: 14,
            fontFamily: "'Space Grotesk', sans-serif",
            outline: 'none',
            transition: 'all 0.2s ease',
            paddingRight: rightSlot ? 44 : 14,
            boxShadow: focused ? '0 0 0 3px rgba(147,51,234,0.12)' : 'none',
          }}
        />
        {rightSlot && (
          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
            {rightSlot}
          </div>
        )}
      </div>
      {error && (
        <p style={{ fontSize: 11, color: '#ef4444', marginTop: 6, fontFamily: "'Space Grotesk', sans-serif", display: 'flex', alignItems: 'center', gap: 4 }}>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ val, label }: { val: string; label: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 2,
      padding: '14px 20px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14,
      flex: 1,
    }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 20, fontWeight: 600, color: '#fff' }}>
        {val}
      </span>
      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.04em' }}>{label}</span>
    </div>
  );
}

// ─── Feature row ──────────────────────────────────────────────────────────────
function FeatureRow({ icon: Icon, text }: { icon: React.ComponentType<any>; text: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9,
        background: 'rgba(147,51,234,0.12)',
        border: '1px solid rgba(147,51,234,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={14} style={{ color: '#c084fc' }} />
      </div>
      <span style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.55)', fontFamily: "'Space Grotesk', sans-serif" }}>
        {text}
      </span>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('All fields are required.'); return; }
    setLoading(true);
    try { await signIn(email, password); }
    catch (err: any) { setError(err.message || 'Invalid email or password.'); }
    finally { setLoading(false); }
  };

  const features = [
    { icon: Brain,  text: 'Gemini AI volunteer matching in seconds' },
    { icon: Zap,    text: 'Real-time Firestore dashboard — no refresh needed' },
    { icon: Users,  text: 'WhatsApp broadcast & multi-channel dispatch' },
    { icon: CheckCircle2, text: 'Gemini-powered triage & community insights' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        .login-outer {
          min-height: 100vh;
          display: flex;
          background: #09090f;
          font-family: 'Space Grotesk', sans-serif;
          position: relative;
          overflow: hidden;
        }
        .login-brand-panel {
          width: 54%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 120px 64px 80px 80px;
          position: relative;
          z-index: 2;
        }
        .login-form-panel {
          width: 46%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 120px 72px 80px 40px;
          position: relative;
          z-index: 2;
        }
        .login-form-card {
          width: 100%;
          max-width: 420px;
        }
        .login-submit-btn {
          transition: all 0.25s ease;
        }
        .login-submit-btn:hover:not(:disabled) {
          box-shadow: 0 0 30px rgba(147,51,234,0.5), 0 0 60px rgba(192,38,211,0.2);
          transform: translateY(-1px);
        }
        .login-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .login-divider {
          display: block;
        }
        .login-link {
          color: #c084fc;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }
        .login-link:hover { color: #d8b4fe; }

        @media (max-width: 767px) {
          .login-brand-panel { display: none; }
          .login-divider { display: none !important; }
          .login-form-panel {
            width: 100%;
            padding: 90px 20px 48px !important;
            align-items: flex-start;
          }
          .login-form-card { max-width: 100%; }
        }
      `}</style>

      <FloatingOrbs />
      <GridOverlay />

      <div className="login-outer">
        <PanelDivider />

        {/* Top logo pill */}
        <div style={{
          position: 'fixed', top: 22, left: '50%', transform: 'translateX(-50%)',
          zIndex: 100,
        }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'rgba(9,9,15,0.85)', backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(147,51,234,0.25)',
              borderRadius: 999, padding: '9px 20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(147,51,234,0.08)',
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: 'linear-gradient(135deg,#9333ea,#c026d3)',
                display: 'inline-block', boxShadow: '0 0 8px rgba(147,51,234,0.8)',
              }} />
              <span style={{ color: '#fff', fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>
                VolunteerIQ
              </span>
            </div>
          </Link>
        </div>

        {/* ── Left: Brand panel ── */}
        <motion.div
          initial={{ opacity: 0, x: -28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="login-brand-panel"
        >
          {/* Accent badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(147,51,234,0.1)',
            border: '1px solid rgba(147,51,234,0.25)',
            borderRadius: 999, padding: '6px 16px', marginBottom: 32,
            width: 'fit-content',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#9333ea', display: 'inline-block', boxShadow: '0 0 6px #9333ea' }} />
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600 }}>
              Command Center
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 3.6vw, 54px)', fontWeight: 700,
            color: '#fff', lineHeight: 1.12, margin: '0 0 20px',
            letterSpacing: '-0.03em',
          }}>
            Welcome back<br />
            <span style={{
              background: 'linear-gradient(135deg, #c084fc 0%, #e879f9 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>to the Pulse.</span>
          </h1>

          <p style={{
            fontSize: 15.5, color: 'rgba(255,255,255,0.42)',
            lineHeight: 1.8, maxWidth: 400, marginBottom: 44,
          }}>
            Log back into your VolunteerIQ command center and continue coordinating community impact across your network.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 52 }}>
            {features.map(f => (
              <FeatureRow key={f.text} icon={f.icon} text={f.text} />
            ))}
          </div>

          {/* Stat strip */}
          <div style={{ display: 'flex', gap: 12 }}>
            <StatPill val="1,400+" label="Active volunteers" />
            <StatPill val="94%" label="AI accuracy" />
            <StatPill val="<20min" label="Avg. response" />
          </div>
        </motion.div>

        {/* ── Right: Form panel ── */}
        <motion.div
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="login-form-panel"
        >
          <div className="login-form-card">
            {/* Glass card */}
            <div style={{
              background: 'rgba(255,255,255,0.025)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 24,
              padding: 40,
              backdropFilter: 'blur(32px)',
              WebkitBackdropFilter: 'blur(32px)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06), 0 0 0 1px rgba(147,51,234,0.08)',
              position: 'relative', overflow: 'hidden',
            }}>
              {/* Card inner glow */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                background: 'linear-gradient(90deg, transparent 0%, rgba(147,51,234,0.4) 50%, transparent 100%)',
                pointerEvents: 'none',
              }} />

              {/* Header */}
              <div style={{ marginBottom: 32 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 13,
                  background: 'linear-gradient(135deg, rgba(147,51,234,0.3) 0%, rgba(192,38,211,0.2) 100%)',
                  border: '1px solid rgba(147,51,234,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20, boxShadow: '0 4px 16px rgba(147,51,234,0.2)',
                }}>
                  <Lock size={18} style={{ color: '#c084fc' }} />
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 700, color: '#fff', margin: '0 0 8px', letterSpacing: '-0.02em' }}>
                  Sign in
                </h2>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', margin: 0, lineHeight: 1.6 }}>
                  Enter your credentials to access your dashboard.
                </p>
              </div>

              {/* Error banner */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 12, padding: '12px 16px',
                    fontSize: 13, color: '#f87171', marginBottom: 20,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}
                >
                  <span style={{ fontSize: 16 }}>⚠</span> {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {/* Email */}
                <div>
                  <label htmlFor="login-email" style={{
                    display: 'block', fontSize: 10.5, letterSpacing: '0.13em',
                    textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
                    marginBottom: 9, fontWeight: 600,
                  }}>
                    Email Address
                  </label>
                  <PBInput
                    id="login-email"
                    type="email" placeholder="name@example.com"
                    value={email} onChange={setEmail} icon={Mail}
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="login-password" style={{
                    display: 'block', fontSize: 10.5, letterSpacing: '0.13em',
                    textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)',
                    marginBottom: 9, fontWeight: 600,
                  }}>
                    Password
                  </label>
                  <PBInput
                    id="login-password"
                    type={showPw ? 'text' : 'password'} placeholder="Your password"
                    value={password} onChange={setPassword} icon={Lock}
                    rightSlot={
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer',
                          color: 'rgba(255,255,255,0.3)', display: 'flex', padding: 0,
                          transition: 'color 0.2s' }}
                        onMouseEnter={e => (e.currentTarget.style.color = 'rgba(192,132,252,0.8)')}
                        onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                      >
                        {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    }
                  />
                </div>

                {/* Submit button */}
                <button
                  id="login-submit"
                  type="submit"
                  disabled={loading}
                  className="login-submit-btn"
                  style={{
                    marginTop: 4, padding: '14px',
                    borderRadius: 12, border: 'none',
                    background: loading
                      ? 'rgba(147,51,234,0.25)'
                      : 'linear-gradient(135deg, #9333ea 0%, #c026d3 100%)',
                    color: loading ? 'rgba(255,255,255,0.45)' : '#fff',
                    fontSize: 15, fontWeight: 700,
                    fontFamily: "'Space Grotesk', sans-serif",
                    cursor: loading ? 'not-allowed' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {loading
                    ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.2)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} /> Signing in…</>
                    : <>Sign In <ArrowRight size={15} /></>
                  }
                </button>
              </form>

              {/* Separator */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 0',
              }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
              </div>

              {/* Footer */}
              <p style={{
                textAlign: 'center', fontSize: 13.5,
                color: 'rgba(255,255,255,0.35)', marginTop: 22,
              }}>
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="login-link">Sign Up</Link>
              </p>

              <p style={{
                textAlign: 'center', fontSize: 10.5,
                color: 'rgba(255,255,255,0.16)', marginTop: 16,
                letterSpacing: '0.05em', textTransform: 'uppercase',
              }}>
                By signing in you agree to our Terms &amp; Privacy Policy
              </p>
            </div>
          </div>
        </motion.div>

        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    </>
  );
}
