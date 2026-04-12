'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, User, Mail, ChevronDown, Lock, ArrowRight, Sparkles, Map, Zap } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import PhoneModal from '@/components/PhoneModal';
import { motion } from 'framer-motion';

// ─── Diamond decorators ───────────────────────────────────────────────────────
const DIAMONDS = [
  { top: '6%',  left: '6%',   size: 9,  opacity: 0.14 },
  { top: '14%', right: '8%',  size: 7,  opacity: 0.10 },
  { top: '50%', left: '3%',   size: 11, opacity: 0.09 },
  { top: '72%', right: '5%',  size: 8,  opacity: 0.12 },
  { bottom: '10%', left: '42%', size: 6, opacity: 0.08 },
  { top: '36%', right: '11%', size: 6,  opacity: 0.10 },
  { top: '85%', left: '15%',  size: 7,  opacity: 0.09 },
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

// ─── Shared PBInput ───────────────────────────────────────────────────────────
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

// ─── Pixel Bloom Select ───────────────────────────────────────────────────────
function PBSelect({
  value, onChange, options, placeholder, error,
}: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder: string; error?: string;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div>
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '12px 40px 12px 14px',
            background: focused ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${error ? 'rgba(239,68,68,0.5)' : focused ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)'}`,
            borderRadius: 10,
            color: value ? '#fff' : 'rgba(255,255,255,0.3)',
            fontSize: 14,
            fontFamily: "'Space Grotesk', sans-serif",
            outline: 'none',
            appearance: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <option value="" disabled style={{ background: '#111', color: 'rgba(255,255,255,0.4)' }}>{placeholder}</option>
          {options.map(o => (
            <option key={o.value} value={o.value} style={{ background: '#111', color: '#fff' }}>{o.label}</option>
          ))}
        </select>
        <ChevronDown size={14} style={{
          position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
          color: 'rgba(255,255,255,0.25)', pointerEvents: 'none',
        }} />
      </div>
      {error && (
        <p style={{ fontSize: 11, color: '#ef4444', marginTop: 5, fontFamily: "'Space Grotesk', sans-serif" }}>
          {error}
        </p>
      )}
    </div>
  );
}

// ─── Mini feature card ───────────────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, desc }: { icon: React.ComponentType<any>; title: string; desc: string }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14, padding: '20px',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 14,
      }}>
        <Icon size={17} style={{ color: 'rgba(255,255,255,0.6)' }} />
      </div>
      <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>{title}</p>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, margin: 0 }}>{desc}</p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function SignupPage() {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [role, setRole]         = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [errors, setErrors]     = useState<Record<string, string>>({});
  const [loading, setLoading]   = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [pendingUid, setPendingUid]         = useState('');
  const [pendingRedirect, setPendingRedirect] = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Full name is required.';
    if (!email.trim()) e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address.';
    if (!role) e.role = 'Please select your role.';
    if (!password) e.password = 'Password is required.';
    else if (password.length < 8) e.password = 'Must be at least 8 characters.';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate(); setErrors(v);
    if (Object.keys(v).length > 0) return;
    setLoading(true);
    try {
      const { uid, redirectPath } = await signUp(email, password, name, role);
      setPendingUid(uid); setPendingRedirect(redirectPath); setShowPhoneModal(true);
    } catch (err: any) {
      setErrors({ form: err.message || 'Failed to create account.' });
    } finally { setLoading(false); }
  };

  const handlePhoneSave = async (phone: string) => {
    if (pendingUid) {
      try { await updateDoc(doc(db, 'users', pendingUid), { phone }); }
      catch (err) { console.error('[PhoneModal] Failed to save phone:', err); }
    }
    setShowPhoneModal(false);
    router.push(pendingRedirect || '/');
  };
  const handlePhoneSkip = () => { setShowPhoneModal(false); router.push(pendingRedirect || '/'); };

  const featureCards = [
    { icon: Sparkles, title: 'Gemini AI Engine',    desc: 'Instant triage and smart volunteer matching powered by Gemini.' },
    { icon: Zap,       title: 'Real-time Dashboard', desc: 'Firestore listeners push every update live — no refresh ever needed.' },
    { icon: Map,       title: 'Live Map Command',    desc: 'Pin-coded incident map with category filters and instant dispatch.' },
  ];

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: '#080808',
      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
      backgroundSize: '32px 32px',
      backgroundAttachment: 'fixed',
      fontFamily: "'Space Grotesk', sans-serif",
      position: 'relative',
    }}>
      {/* Diamond decorators */}
      {DIAMONDS.map((d, i) => <Diamond key={i} d={d} />)}

      {/* Floating pill navbar */}
      <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
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

      {/* Left: form panel */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: '52%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '120px 40px 80px 80px',
        }}
      >
        <div style={{
          width: '100%', maxWidth: 460,
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 20, padding: '40px',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          boxShadow: '0 40px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}>
          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: '#fff', margin: '0 0 8px' }}>
              Create your account
            </h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', margin: 0 }}>
              Join the VolunteerIQ command center in under a minute.
            </p>
          </div>

          {/* Form error */}
          {errors.form && (
            <div style={{
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10, padding: '12px 14px',
              fontSize: 13, color: '#ef4444', marginBottom: 20,
            }}>
              {errors.form}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {/* Full name */}
            <div>
              <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8, fontWeight: 600 }}>
                FULL NAME
              </p>
              <PBInput type="text" placeholder="Enter your full name" value={name} onChange={setName} icon={User} error={errors.name} />
            </div>

            {/* Email */}
            <div>
              <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8, fontWeight: 600 }}>
                EMAIL ADDRESS
              </p>
              <PBInput type="email" placeholder="name@example.com" value={email} onChange={setEmail} icon={Mail} error={errors.email} />
            </div>

            {/* Role */}
            <div>
              <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8, fontWeight: 600 }}>
                PRIMARY ROLE
              </p>
              <PBSelect
                value={role} onChange={setRole}
                placeholder="Select your role"
                options={[
                  { value: 'coordinator', label: 'NGO Coordinator' },
                  { value: 'volunteer',   label: 'Volunteer' },
                ]}
                error={errors.role}
              />
            </div>

            {/* Password */}
            <div>
              <p style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8, fontWeight: 600 }}>
                PASSWORD
              </p>
              <PBInput
                type={showPw ? 'text' : 'password'} placeholder="Create a strong password"
                value={password} onChange={setPassword} icon={Lock} error={errors.password}
                rightSlot={
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer',
                      color: 'rgba(255,255,255,0.3)', display: 'flex', padding: 0 }}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: 4, padding: '13px',
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
              {loading ? 'Creating account…' : <>Create Account <ArrowRight size={15} /></>}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.35)', marginTop: 24 }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'rgba(255,255,255,0.75)', fontWeight: 600, textDecoration: 'none' }}>
              Sign In
            </Link>
          </p>
          <p style={{
            textAlign: 'center', fontSize: 10, color: 'rgba(255,255,255,0.18)',
            marginTop: 16, letterSpacing: '0.05em', textTransform: 'uppercase',
          }}>
            By joining, you agree to our Terms &amp; Privacy Policy
          </p>
        </div>
      </motion.div>

      {/* Right: brand panel */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        style={{
          width: '48%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '120px 80px 80px 40px', position: 'relative',
        }}
      >
        {/* Glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 70% 60% at 70% 50%, rgba(40,40,40,0.8) 0%, transparent 70%)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 999, padding: '6px 16px', marginBottom: 32,
          }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>✦</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Join the Network
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 3.5vw, 48px)', fontWeight: 700,
            color: '#fff', lineHeight: 1.15, margin: '0 0 20px',
          }}>
            Join the Pulse<br />of Community Impact.
          </h1>

          <p style={{
            fontSize: 16, color: 'rgba(255,255,255,0.45)',
            lineHeight: 1.75, maxWidth: 380, marginBottom: 48,
          }}>
            Unite with a network of changemakers. AI-driven coordination ensures the right volunteer reaches every community need, instantly.
          </p>

          {/* Feature cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 14, maxWidth: 380 }}>
            {featureCards.map(c => <FeatureCard key={c.title} {...c} />)}
          </div>

          {/* Stat strip */}
          <div style={{
            display: 'flex', gap: 32, marginTop: 48,
            borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 28,
          }}>
            {[
              { val: '12', label: 'Cities covered' },
              { val: '924', label: 'Issues resolved' },
              { val: '100%', label: 'Free for NGOs' },
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

      {/* Phone modal */}
      <PhoneModal isOpen={showPhoneModal} onSave={handlePhoneSave} onSkip={handlePhoneSkip} />
    </div>
  );
}
