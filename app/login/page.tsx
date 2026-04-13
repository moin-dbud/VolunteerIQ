'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { motion } from 'framer-motion';

// ─── Diamond decorators ───────────────────────────────────────────────────────
const DIAMONDS = [
  { top: '8%',  left: '6%',   size: 9,  opacity: 0.14 },
  { top: '18%', right: '8%',  size: 7,  opacity: 0.10 },
  { top: '55%', left: '4%',   size: 11, opacity: 0.09 },
  { top: '70%', right: '5%',  size: 8,  opacity: 0.12 },
  { bottom: '12%', left: '40%', size: 6, opacity: 0.08 },
  { top: '38%', right: '12%', size: 6,  opacity: 0.10 },
];

function Diamond({ d }: { d: typeof DIAMONDS[0] }) {
  const style: React.CSSProperties = {
    position: 'absolute',
    width: d.size, height: d.size,
    transform: 'rotate(45deg)',
    background: `rgba(255,255,255,${d.opacity})`,
    ...(d.top    ? { top:    d.top    } : {}),
    ...(d.bottom ? { bottom: (d as any).bottom } : {}),
    ...(d.left   ? { left:   d.left   } : {}),
    ...(d.right  ? { right:  d.right  } : {}),
    pointerEvents: 'none',
  };
  return <div style={style} />;
}

// ─── Pixel Bloom Input ────────────────────────────────────────────────────────
function PBInput({
  type, placeholder, value, onChange, icon: Icon, rightSlot, error,
}: {
  type: string; placeholder: string; value: string;
  onChange: (v: string) => void; icon: React.ComponentType<any>;
  rightSlot?: React.ReactNode; error?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <div style={{ position: 'relative' }}>
        <Icon
          size={14}
          style={{
            position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)',
            color: focused ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)',
            transition: 'color 0.2s',
          }}
        />
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '12px 14px 12px 40px',
            background: focused ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : focused ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 10,
            color: '#fff',
            fontSize: 14,
            fontFamily: "'Space Grotesk', sans-serif",
            outline: 'none',
            transition: 'all 0.2s ease',
            paddingRight: rightSlot ? 44 : 14,
          }}
        />
        {rightSlot && (
          <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)' }}>
            {rightSlot}
          </div>
        )}
      </div>
      {error && (
        <p style={{ fontSize: 11, color: '#ef4444', marginTop: 5, fontFamily: "'Space Grotesk', sans-serif" }}>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
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
    'AI volunteer matching in seconds',
    'Real-time Firestore dashboard',
    'WhatsApp broadcast dispatch',
    'Gemini-powered triage & insights',
  ];

  return (
    <>
      <style>{`
        .login-outer {
          min-height: 100vh;
          display: flex;
          background: #080808;
          background-image: radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 32px 32px;
          background-attachment: fixed;
          font-family: 'Space Grotesk', sans-serif;
          position: relative;
        }
        .login-brand-panel {
          width: 52%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 120px 72px 80px 80px;
          position: relative;
        }
        .login-form-panel {
          width: 48%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 120px 80px 80px 40px;
        }
        .login-form-card {
          width: 100%;
          max-width: 440px;
        }
        @media (max-width: 767px) {
          .login-brand-panel { display: none; }
          .login-form-panel {
            width: 100%;
            padding: 90px 20px 40px !important;
            align-items: flex-start;
          }
          .login-form-card { max-width: 100%; }
        }
      `}</style>

      <div className="login-outer">
        {/* Diamond decorators */}
        {DIAMONDS.map((d, i) => <Diamond key={i} d={d} />)}

        {/* Floating pill navbar */}
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          zIndex: 100,
        }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              background: 'rgba(8,8,8,0.75)', backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 999, padding: '10px 20px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>✦</span>
              <span style={{ color: '#fff', fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em' }}>
                VolunteerIQ
              </span>
            </div>
          </Link>
        </div>

        {/* Left: brand panel — hidden on mobile */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="login-brand-panel"
        >
          {/* Radial glow */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 70% 60% at 30% 50%, rgba(40,40,40,0.8) 0%, transparent 70%)',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.03)',
              borderRadius: 999, padding: '6px 16px',
              marginBottom: 32,
            }}>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>✦</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Command Center
              </span>
            </div>

            <h1 style={{
              fontSize: 'clamp(38px, 4vw, 52px)', fontWeight: 700,
              color: '#fff', lineHeight: 1.15, margin: '0 0 20px',
            }}>
              Welcome back<br />to the Pulse.
            </h1>

            <p style={{
              fontSize: 16, color: 'rgba(255,255,255,0.45)',
              lineHeight: 1.75, maxWidth: 400, marginBottom: 48,
            }}>
              Log back into your VolunteerIQ command center and continue coordinating community impact across your network.
            </p>

            {/* Feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {features.map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <CheckCircle2 size={15} style={{ color: 'rgba(255,255,255,0.4)', flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)' }}>{f}</span>
                </div>
              ))}
            </div>

            {/* Divider stat strip */}
            <div style={{
              display: 'flex', gap: 32, marginTop: 56,
              borderTop: '1px solid rgba(255,255,255,0.06)',
              paddingTop: 28,
            }}>
              {[
                { val: '1,400+', label: 'Active volunteers' },
                { val: '94%',    label: 'AI accuracy' },
                { val: '<20min', label: 'Avg response' },
              ].map(s => (
                <div key={s.label}>
                  <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 500, color: '#fff', margin: '0 0 4px' }}>
                    {s.val}
                  </p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Right: form panel */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="login-form-panel"
        >
          <div
            className="login-form-card"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: 20,
              padding: 40,
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            {/* Form header */}
            <div style={{ marginBottom: 32 }}>
              <h2 style={{ fontSize: 26, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
                Sign in
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                Enter your credentials to access your dashboard.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 10, padding: '12px 14px',
                fontSize: 13, color: '#ef4444', marginBottom: 20,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                {
                  label: 'EMAIL ADDRESS',
                  node: (
                    <PBInput
                      type="email" placeholder="name@example.com"
                      value={email} onChange={setEmail} icon={Mail}
                    />
                  ),
                },
                {
                  label: 'PASSWORD',
                  node: (
                    <PBInput
                      type={showPw ? 'text' : 'password'} placeholder="Your password"
                      value={password} onChange={setPassword} icon={Lock}
                      rightSlot={
                        <button type="button" onClick={() => setShowPw(!showPw)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer',
                            color: 'rgba(255,255,255,0.3)', display: 'flex', padding: 0 }}>
                          {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      }
                    />
                  ),
                },
              ].map(({ label, node }) => (
                <div key={label}>
                  <p style={{
                    fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase',
                    color: 'rgba(255,255,255,0.3)', marginBottom: 8, fontWeight: 600,
                  }}>
                    {label}
                  </p>
                  {node}
                </div>
              ))}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  marginTop: 4,
                  padding: '13px',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.18)',
                  background: loading ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.07)',
                  color: loading ? 'rgba(255,255,255,0.4)' : '#fff',
                  fontSize: 15, fontWeight: 600,
                  fontFamily: "'Space Grotesk', sans-serif",
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { if (!loading) { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.28)'; } }}
                onMouseLeave={e => { if (!loading) { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.07)'; (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.18)'; } }}
              >
                {loading ? 'Signing in…' : <>Sign In <ArrowRight size={15} /></>}
              </button>
            </form>

            {/* Footer links */}
            <p style={{
              textAlign: 'center', fontSize: 13,
              color: 'rgba(255,255,255,0.35)', marginTop: 24,
            }}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600, textDecoration: 'none' }}>
                Sign Up
              </Link>
            </p>

            <p style={{
              textAlign: 'center', fontSize: 10,
              color: 'rgba(255,255,255,0.18)', marginTop: 20,
              letterSpacing: '0.05em', textTransform: 'uppercase',
            }}>
              By signing in, you agree to our Terms &amp; Privacy Policy
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
}
