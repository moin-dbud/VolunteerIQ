'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  MessageCircle, Users, EyeOff, ArrowRight, FileText,
  Sparkles, Send, CheckCircle2, PlayCircle, Star,
  Github, Twitter, Linkedin, BarChart2, AlertTriangle,
  CheckCircle, MapPin,
} from 'lucide-react';

// ─── Dynamic 3D imports (SSR disabled) ──────────────────────────────────────
const HeroScene = dynamic(() => import('@/components/landing/HeroScene'), { ssr: false });
const AIBrainScene = dynamic(() => import('@/components/landing/AIBrainScene'), { ssr: false });
const NetworkScene = dynamic(() => import('@/components/landing/NetworkScene'), { ssr: false });

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return m ? m[2] : null;
}

const ease = [0.25, 0.46, 0.45, 0.94] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

// ─── Color constants ──────────────────────────────────────────────────────────
const P  = '#9333ea';
const S  = '#c026d3';
const BG = '#0a0a0f';
const SRF = '#111118';
const ELV = '#1a1a24';
const BRD = '#27272a';
const TXT = '#a1a1aa';
const MUT = '#52525b';

// ─── Cursor Glow ─────────────────────────────────────────────────────────────
function CursorGlow() {
  const [pos, setPos] = useState({ x: -999, y: -999 });
  useEffect(() => {
    const h = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0,
      width: 400, height: 400, borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(147,51,234,0.06) 0%, transparent 70%)',
      transform: `translate(${pos.x - 200}px, ${pos.y - 200}px)`,
      pointerEvents: 'none', transition: 'transform 0.12s ease', zIndex: 9999,
    }} />
  );
}

// ─── Landing Navbar ──────────────────────────────────────────────────────────
function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);

  const linkHover = (e: React.MouseEvent<HTMLAnchorElement>, enter: boolean) => {
    e.currentTarget.style.color = enter ? '#fff' : TXT;
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, height: 64,
      background: scrolled ? 'rgba(10,10,15,0.96)' : 'rgba(10,10,15,0.8)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid rgba(255,255,255,0.055)',
      zIndex: 100, display: 'flex', alignItems: 'center',
      padding: '0 max(24px, calc((100vw - 1280px) / 2 + 24px))',
      transition: 'background 0.3s ease',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: `linear-gradient(135deg,${P},${S})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 800, color: '#fff',
        }}>V</div>
        <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 18, fontWeight: 700, color: '#fff' }}>
          VolunteerIQ
        </span>
      </div>

      {/* Center nav */}
      <div style={{ display: 'flex', gap: 32, position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
        {['How It Works', 'Features', 'Impact', 'For NGOs'].map(l => (
          <a key={l} href="#" style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: TXT, textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => linkHover(e, true)} onMouseLeave={e => linkHover(e, false)}>{l}</a>
        ))}
      </div>

      {/* Right CTAs */}
      <div style={{ display: 'flex', gap: 10, marginLeft: 'auto' }}>
        <Link href="/login">
          <button style={{
            height: 36, padding: '0 16px', background: 'transparent',
            border: `1px solid ${BRD}`, borderRadius: 8, color: TXT,
            fontFamily: 'DM Sans, sans-serif', fontSize: 14, cursor: 'pointer', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = P; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = BRD; e.currentTarget.style.color = TXT; }}>
            Login
          </button>
        </Link>
        <Link href="/signup">
          <button style={{
            height: 36, padding: '0 16px',
            background: `linear-gradient(135deg,${P},${S})`,
            border: 'none', borderRadius: 8, color: '#fff',
            fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>Get Started</button>
        </Link>
      </div>
    </nav>
  );
}

// ─── Section 1: Hero ─────────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      paddingTop: 64,
      background: `
        radial-gradient(ellipse 60% 80% at 80% 50%, rgba(147,51,234,0.08) 0%, transparent 70%),
        radial-gradient(ellipse 40% 60% at 10% 20%, rgba(192,38,211,0.05) 0%, transparent 60%),
        ${BG}
      `,
      padding: '80px max(24px, calc((100vw - 1280px) / 2 + 24px)) 0',
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48,
        width: '100%', minHeight: 'calc(100vh - 80px)', alignItems: 'center',
      }}>
        {/* Left: Text */}
        <motion.div variants={stagger} initial="hidden" animate="show">
          <motion.p variants={fadeUp} style={{
            fontSize: 11, fontWeight: 600, letterSpacing: '0.2em',
            color: MUT, fontFamily: 'DM Sans, sans-serif',
            marginBottom: 20, textTransform: 'uppercase',
          }}>AI-Powered NGO Command Center</motion.p>

          <motion.h1 variants={fadeUp} style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 'clamp(48px, 5.5vw, 72px)',
            fontWeight: 800, lineHeight: 1.05,
            color: '#fff', margin: 0,
          }}>
            Mobilize the<br />
            Right People,<br />
            <span style={{
              background: `linear-gradient(135deg, ${P}, ${S})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>Right Now.</span>
          </motion.h1>

          <motion.p variants={fadeUp} style={{
            fontFamily: 'DM Sans, sans-serif', fontSize: 18,
            color: TXT, maxWidth: 460, marginTop: 24, lineHeight: 1.65,
          }}>
            VolunteerIQ is a smart command center for NGOs. AI categorizes community issues,
            finds the best-matched volunteers, and coordinates response — all in real time.
          </motion.p>

          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 16, marginTop: 40, flexWrap: 'wrap' }}>
            <Link href="/signup">
              <button style={{
                height: 52, padding: '0 32px',
                background: `linear-gradient(135deg,${P},${S})`,
                border: 'none', borderRadius: 10, color: '#fff',
                fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: `0 4px 20px rgba(147,51,234,0.35)`,
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(147,51,234,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(147,51,234,0.35)'; }}>
                Launch Command Center
              </button>
            </Link>
            <button style={{
              height: 52, padding: '0 24px', background: 'transparent',
              border: `1px solid ${BRD}`, borderRadius: 10,
              color: TXT, fontFamily: 'DM Sans, sans-serif', fontSize: 15,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
              transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = P; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BRD; e.currentTarget.style.color = TXT; }}>
              <PlayCircle size={18} />Watch Demo
            </button>
          </motion.div>

          {/* Stats row */}
          <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', marginTop: 56, gap: 0 }}>
            {[
              { num: '1,400+', label: 'Active Volunteers' },
              { num: '94%', label: 'AI Accuracy' },
              { num: '<20min', label: 'Response Time' },
            ].map((stat, i) => (
              <div key={stat.num} style={{ display: 'flex', alignItems: 'center' }}>
                {i > 0 && <div style={{ width: 1, height: 40, background: BRD, margin: '0 36px' }} />}
                <div>
                  <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 500, color: P, margin: 0 }}>{stat.num}</p>
                  <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: MUT, margin: '4px 0 0' }}>{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right: 3D */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.3 }}
          style={{ height: 620, minHeight: 480 }}>
          <HeroScene />
        </motion.div>
      </div>
    </section>
  );
}

// ─── Section 2: Problem ──────────────────────────────────────────────────────
function ProblemSection() {
  const problems = [
    {
      icon: <MessageCircle size={32} color="#f59e0b" />,
      bg: 'rgba(245,158,11,0.12)', accent: '#f59e0b',
      title: '200+ Messages Daily',
      body: 'Coordinators manually read WhatsApp chains to find urgent needs. Critical issues get buried under irrelevant messages and noise.',
    },
    {
      icon: <Users size={32} color="#ef4444" />,
      bg: 'rgba(239,68,68,0.12)', accent: '#ef4444',
      title: 'Wrong Volunteer, Wrong Time',
      body: 'Without skill matching, volunteers are called based on who picks up first — not who is most qualified for the mission at hand.',
    },
    {
      icon: <EyeOff size={32} color={MUT} />,
      bg: 'rgba(82,82,91,0.15)', accent: MUT,
      title: 'No Real-Time Tracking',
      body: 'Once an issue is reported verbally, there is no way to track resolution, measure impact, or prevent duplication across teams.',
    },
  ];

  return (
    <section style={{ padding: '120px max(24px, calc((100vw - 1280px) / 2 + 24px))', background: BG }}>
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: 64 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.2em', color: MUT, fontFamily: 'DM Sans, sans-serif', marginBottom: 16, textTransform: 'uppercase' }}>The Problem</p>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(34px, 4.5vw, 52px)', fontWeight: 700, color: '#fff', margin: 0 }}>
          Community Crises Lost in the Noise
        </h2>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {problems.map((p, i) => (
          <motion.div key={p.title}
            initial={{ opacity: 0, y: 60 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: i * 0.12, ease }}
            style={{ background: SRF, border: `1px solid ${BRD}`, borderRadius: 16, padding: '32px 28px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg, transparent, ${p.accent}50, transparent)` }} />
            <div style={{ width: 56, height: 56, borderRadius: 12, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
              {p.icon}
            </div>
            <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 12 }}>{p.title}</h3>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: TXT, lineHeight: 1.65 }}>{p.body}</p>
          </motion.div>
        ))}
      </div>

      {/* Before → After */}
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.35 }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 24, marginTop: 56, padding: '28px 40px',
          background: SRF, border: `1px solid ${BRD}`, borderRadius: 16, flexWrap: 'wrap',
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ padding: '5px 14px', borderRadius: 999, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', fontSize: 12, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}>BEFORE</span>
          <span style={{ color: MUT, fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>3 hours of manual coordination</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <ArrowRight size={20} color={P} />
          <ArrowRight size={20} color={P} style={{ marginLeft: -10 }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ padding: '5px 14px', borderRadius: 999, background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.4)', color: '#22c55e', fontSize: 12, fontWeight: 700, fontFamily: 'DM Sans, sans-serif' }}>AFTER</span>
          <span style={{ color: TXT, fontFamily: 'DM Sans, sans-serif', fontSize: 14 }}>15 minutes with VolunteerIQ</span>
        </div>
      </motion.div>
    </section>
  );
}

// ─── Mockup sub-components (CSS replicas of the real app) ────────────────────
function DashboardMockup() {
  return (
    <div style={{ padding: '18px', height: '100%', display: 'flex', flexDirection: 'column', gap: 14, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { l: 'TOTAL ISSUES', v: '148', c: P },
          { l: 'PENDING ACTION', v: '47', c: '#ef4444' },
          { l: 'ASSIGNED', v: '63', c: P },
          { l: 'COMPLETED', v: '38', c: '#22c55e' },
        ].map(s => (
          <div key={s.l} style={{ background: SRF, border: `1px solid ${BRD}`, borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontSize: 8, color: MUT, fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.1em', marginBottom: 6, textTransform: 'uppercase' }}>{s.l}</p>
            <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 26, fontWeight: 500, color: s.c, margin: 0 }}>{s.v}</p>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', gap: 12, flex: 1 }}>
        <div style={{ background: SRF, border: `1px solid ${BRD}`, borderRadius: 10, padding: 14 }}>
          <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 14 }}>Impact Distribution</p>
          {[
            { l: 'Infrastructure', p: 38, c: P },
            { l: 'Health & Welfare', p: 27, c: '#ef4444' },
            { l: 'Public Safety', p: 22, c: '#f59e0b' },
            { l: 'Environment', p: 13, c: '#22c55e' },
          ].map(b => (
            <div key={b.l} style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: TXT, fontFamily: 'DM Sans, sans-serif' }}>{b.l}</span>
                <span style={{ fontSize: 10, color: '#fff', fontFamily: 'JetBrains Mono, monospace' }}>{b.p}%</span>
              </div>
              <div style={{ height: 5, background: ELV, borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${b.p}%`, height: '100%', background: b.c, borderRadius: 3 }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ background: SRF, border: `1px solid ${BRD}`, borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '10px 14px', borderBottom: `1px solid ${BRD}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600, color: '#fff' }}>Recent Submissions</span>
            <span style={{ fontSize: 10, color: P }}>View All →</span>
          </div>
          {[
            { t: 'Flood damage in residential area', c: 'Infrastructure', s: 'PENDING', sc: '#ef4444', sb: 'rgba(239,68,68,0.15)' },
            { t: 'Medical supply shortage at clinic', c: 'Health & Welfare', s: 'ASSIGNED', sc: P, sb: `rgba(147,51,234,0.15)` },
            { t: 'Fallen tree blocking main road', c: 'Public Safety', s: 'DONE', sc: '#22c55e', sb: 'rgba(34,197,94,0.15)' },
          ].map((row, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', padding: '10px 14px', borderBottom: i < 2 ? `1px solid ${BRD}` : 'none', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#fff', fontFamily: 'DM Sans, sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.t}</span>
              <span style={{ fontSize: 10, color: TXT, fontFamily: 'DM Sans, sans-serif' }}>{row.c}</span>
              <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: row.sb, color: row.sc, whiteSpace: 'nowrap' }}>{row.s}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AIMockup() {
  return (
    <div style={{ padding: '18px', height: '100%', display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 10 }}>
        <div style={{ flex: 1, height: 38, background: SRF, border: `1px solid ${BRD}`, borderRadius: 8, display: 'flex', alignItems: 'center', padding: '0 14px', fontSize: 12, color: MUT, fontFamily: 'DM Sans, sans-serif' }}>
          Medical supply shortage at community clinic...
        </div>
        <div style={{ height: 38, background: `linear-gradient(135deg,${P},${S})`, borderRadius: 8, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#fff', fontWeight: 600, whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif' }}>
          ✦ Generate Report
        </div>
      </div>
      <div style={{ background: SRF, border: `1px solid rgba(147,51,234,0.4)`, borderRadius: 12, padding: 20, flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 12, right: 16, opacity: 0.06, fontSize: 64, color: P, fontFamily: 'monospace', lineHeight: 1 }}>✦</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <span style={{ color: P, fontSize: 16 }}>✦</span>
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 15, fontWeight: 700, color: '#fff' }}>Gemini Intelligence Report</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <p style={{ fontSize: 8, color: MUT, letterSpacing: '0.12em', marginBottom: 6, fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase' }}>Suggested Priority</p>
            <span style={{ padding: '4px 12px', borderRadius: 5, background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontSize: 11, fontWeight: 700 }}>URGENT</span>
            <p style={{ fontSize: 8, color: MUT, letterSpacing: '0.12em', marginBottom: 4, fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase', marginTop: 14 }}>Suggested Category</p>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 20, fontWeight: 700, color: '#fff' }}>Health & Welfare</p>
            <p style={{ fontSize: 12, color: TXT, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5, marginTop: 10 }}>Critical shortage of bandages and IV fluids at Nagpur district clinic affecting 200+ patients daily.</p>
          </div>
          <div>
            <p style={{ fontSize: 8, color: MUT, letterSpacing: '0.12em', marginBottom: 10, fontFamily: 'DM Sans, sans-serif', textTransform: 'uppercase' }}>Best Volunteer Match</p>
            <div style={{ background: ELV, border: `1px solid ${BRD}`, borderRadius: 8, padding: '12px 12px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg,${P},${S})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>MC</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Space Grotesk, sans-serif', marginBottom: 2 }}>Marcus Chen</p>
                <p style={{ fontSize: 9, color: P, fontFamily: 'DM Sans, sans-serif' }}>Medical Response · 2.1km</p>
              </div>
            </div>
            <p style={{ fontSize: 9, color: MUT, fontFamily: 'DM Sans, sans-serif', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Satisfaction Score</p>
            <div style={{ display: 'flex', gap: 3 }}>
              {[1,2,3,4,5].map(n => <div key={n} style={{ width: 24, height: 6, borderRadius: 3, background: n <= 5 ? P : BRD }} />)}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <div style={{ flex: 1, height: 32, background: `linear-gradient(135deg,${P},${S})`, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 10, color: '#fff', fontWeight: 600, fontFamily: 'DM Sans, sans-serif' }}>⚡ Open WhatsApp</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MapMockup() {
  const markers = [
    { x: '28%', y: '42%', c: '#ef4444' }, { x: '54%', y: '28%', c: '#f59e0b' },
    { x: '70%', y: '58%', c: P }, { x: '40%', y: '67%', c: '#22c55e' },
    { x: '78%', y: '33%', c: '#ef4444' }, { x: '20%', y: '24%', c: '#f59e0b' },
    { x: '60%', y: '75%', c: P }, { x: '85%', y: '55%', c: '#22c55e' },
  ];
  return (
    <div style={{ height: '100%', background: '#0d1117', position: 'relative', overflow: 'hidden' }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.12 }}>
        {Array.from({ length: 14 }).map((_, i) => (
          <line key={`v${i}`} x1={`${(i / 14) * 100}%`} y1="0" x2={`${(i / 14) * 100}%`} y2="100%" stroke={BRD} strokeWidth="1" />
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={`${(i / 9) * 100}%`} x2="100%" y2={`${(i / 9) * 100}%`} stroke={BRD} strokeWidth="1" />
        ))}
      </svg>
      {markers.map((m, i) => (
        <div key={i} style={{ position: 'absolute', left: m.x, top: m.y, transform: 'translate(-50%,-100%)' }}>
          <div style={{ width: 20, height: 20, borderRadius: '50% 50% 50% 0', background: m.c, transform: 'rotate(-45deg)', boxShadow: `0 0 10px ${m.c}90` }} />
        </div>
      ))}
      <div style={{ position: 'absolute', top: 12, left: 12, background: 'rgba(17,17,24,0.9)', backdropFilter: 'blur(12px)', border: `1px solid ${BRD}`, borderRadius: 10, padding: '8px 12px', display: 'flex', gap: 6 }}>
        {['All', '🏥', '🍽️', '🏠', '🚨'].map((f, i) => (
          <span key={f} style={{ fontSize: 10, padding: '3px 9px', borderRadius: 5, background: i === 0 ? `rgba(147,51,234,0.2)` : 'transparent', border: `1px solid ${i === 0 ? P : BRD}`, color: i === 0 ? P : TXT, fontFamily: 'DM Sans, sans-serif', cursor: 'default' }}>{f}</span>
        ))}
      </div>
      <div style={{ position: 'absolute', top: 12, right: 12, background: 'rgba(17,17,24,0.9)', backdropFilter: 'blur(12px)', border: `1px solid ${BRD}`, borderRadius: 10, padding: '8px 12px' }}>
        <p style={{ fontSize: 9, color: MUT, fontFamily: 'DM Sans, sans-serif', marginBottom: 2 }}>ACTIVE INCIDENTS</p>
        <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, color: P, margin: 0 }}>8</p>
      </div>
    </div>
  );
}

function VolunteerMockup() {
  const missions = [
    { t: 'Medical supply delivery to Nagpur clinic', u: 'URGENT', match: true },
    { t: 'Flood damage assessment alongside Wardha Rd', u: 'HIGH', match: false },
    { t: 'Community food distribution drive', u: 'MEDIUM', match: false },
  ];
  return (
    <div style={{ padding: '14px', height: '100%', display: 'flex', gap: 14, overflow: 'hidden' }}>
      <div style={{ width: 210, flexShrink: 0 }}>
        <div style={{ background: SRF, border: `1px solid ${BRD}`, borderRadius: 10, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg,${P},${S})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>MC</div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: 'Space Grotesk, sans-serif', marginBottom: 3 }}>Marcus Chen</p>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.12)', padding: '2px 7px', borderRadius: 4 }}>● ACTIVE</span>
            </div>
          </div>
          <div style={{ background: BG, borderRadius: 6, padding: '8px 10px', fontSize: 10, color: TXT, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.5 }}>Medical Response · Emergency Response</div>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 10 }}>Available Missions (3)</p>
        {missions.map((m, i) => (
          <div key={i} style={{
            background: SRF, border: `1px solid ${BRD}`,
            borderLeft: `4px solid ${m.u === 'URGENT' ? '#ef4444' : m.match ? P : 'transparent'}`,
            borderRadius: 8, padding: '10px 12px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 16, flexShrink: 0 }}>{m.u === 'URGENT' ? '🚨' : m.match ? '🎯' : '📋'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#fff', fontFamily: 'DM Sans, sans-serif', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.t}</p>
              <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: m.u === 'URGENT' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)', color: m.u === 'URGENT' ? '#ef4444' : '#f59e0b' }}>{m.u}</span>
            </div>
            <button style={{ fontSize: 9, padding: '5px 10px', borderRadius: 5, background: m.u === 'URGENT' ? `linear-gradient(135deg,${P},${S})` : ELV, border: `1px solid ${BRD}`, color: '#fff', cursor: 'default', whiteSpace: 'nowrap', fontFamily: 'DM Sans, sans-serif' }}>
              {m.u === 'URGENT' ? '✓ Apply' : "I'm Available"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Section 3: Product Showcase ─────────────────────────────────────────────
function ShowcaseSection() {
  const [tab, setTab] = useState(0);
  const tabs = [
    { label: 'Dashboard', desc: 'Real-time operations overview with live stat cards, impact distribution, and incident table.' },
    { label: 'AI Insights', desc: 'Gemini Intelligence Report — finds the single best volunteer match for any issue in seconds.' },
    { label: 'Map View', desc: 'Interactive Leaflet map showing all active incidents, filterable by category and urgency level.' },
    { label: 'Volunteer Portal', desc: 'Role-based mission feed with skill matching highlights and one-click acceptance.' },
  ];
  const mockups = [<DashboardMockup key="d" />, <AIMockup key="a" />, <MapMockup key="m" />, <VolunteerMockup key="v" />];
  const urls = ['dashboard', 'ai-insights', 'map', 'volunteer'];

  return (
    <section style={{ padding: '120px max(24px, calc((100vw - 1280px) / 2 + 24px))', background: BG }}>
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: 44 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.2em', color: MUT, fontFamily: 'DM Sans, sans-serif', marginBottom: 14, textTransform: 'uppercase' }}>See It In Action</p>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 700, color: '#fff', margin: 0 }}>The Command Center in Action</h2>
      </motion.div>

      {/* Tab row */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
        {tabs.map((t, i) => (
          <button key={t.label} onClick={() => setTab(i)} style={{
            padding: '9px 20px', borderRadius: 8, cursor: 'pointer', transition: 'all 0.2s',
            border: `1px solid ${tab === i ? P : BRD}`,
            background: tab === i ? `rgba(147,51,234,0.12)` : 'transparent',
            color: tab === i ? P : TXT,
            fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500,
          }}>{t.label}</button>
        ))}
      </div>

      {/* Browser mockup */}
      <motion.div
        initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.8 }}
        style={{
          borderRadius: 14, border: `1px solid ${BRD}`, overflow: 'hidden',
          boxShadow: `0 0 0 1px rgba(147,51,234,0.15), 0 40px 80px rgba(0,0,0,0.8), 0 0 120px rgba(147,51,234,0.07)`,
          transform: 'perspective(1200px) rotateX(5deg)',
          transition: 'transform 0.6s ease',
          maxWidth: 1080, margin: '0 auto',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'perspective(1200px) rotateX(1.5deg)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'perspective(1200px) rotateX(5deg)')}>
        {/* Chrome bar */}
        <div style={{ height: 42, background: SRF, borderBottom: `1px solid ${BRD}`, display: 'flex', alignItems: 'center', padding: '0 14px', gap: 10 }}>
          <div style={{ display: 'flex', gap: 5 }}>
            {['#ef4444', '#f59e0b', '#22c55e'].map(c => <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c }} />)}
          </div>
          <div style={{ flex: 1, maxWidth: 320, height: 24, background: ELV, borderRadius: 5, border: `1px solid ${BRD}`, display: 'flex', alignItems: 'center', padding: '0 10px', gap: 5, margin: '0 auto' }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#22c55e', flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: MUT, fontFamily: 'DM Sans, sans-serif' }}>volunteeriq.app/{urls[tab]}</span>
          </div>
        </div>
        {/* Page content */}
        <div style={{ height: 480, overflow: 'hidden', background: BG }}>
          <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }} style={{ height: '100%' }}>
            {mockups[tab]}
          </motion.div>
        </div>
      </motion.div>

      {/* Description */}
      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ textAlign: 'center', marginTop: 28 }}>
        <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 17, color: '#fff', fontWeight: 600, marginBottom: 6 }}>{tabs[tab].label}</p>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: TXT, maxWidth: 520, margin: '0 auto' }}>{tabs[tab].desc}</p>
      </motion.div>
    </section>
  );
}

// ─── Section 4: How It Works ─────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    {
      n: '01', icon: <FileText size={26} color={P} />,
      title: 'Issue Reported',
      body: 'Community members or coordinators submit issues via the structured form. Gemini AI instantly categorizes and prioritizes the submission.',
    },
    {
      n: '02', icon: <Sparkles size={26} color={P} />,
      title: 'AI Finds the Match',
      body: 'Gemini analyzes all available volunteers — their skills, location, and availability — and surfaces the single best match for the coordinator.',
    },
    {
      n: '03', icon: <Send size={26} color={P} />,
      title: 'Volunteer Dispatched',
      body: 'One click opens a pre-filled WhatsApp dispatch. Accept or reject — if rejected, Gemini automatically finds the next best match.',
    },
  ];

  return (
    <section style={{ padding: '120px max(24px, calc((100vw - 1280px) / 2 + 24px))', background: BG }}>
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: 80 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.2em', color: MUT, fontFamily: 'DM Sans, sans-serif', marginBottom: 14, textTransform: 'uppercase' }}>The Process</p>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 700, color: '#fff', margin: 0 }}>From Crisis to Resolution in Minutes</h2>
      </motion.div>

      <div style={{ position: 'relative' }}>
        {/* Dashed connecting line */}
        <div style={{ position: 'absolute', top: 58, left: '17%', right: '17%', height: 0, borderTop: `2px dashed rgba(147,51,234,0.28)`, pointerEvents: 'none' }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: P, position: 'absolute', top: -5, animation: 'slideAcross 3s infinite linear' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40 }}>
          {steps.map((step, i) => (
            <motion.div key={step.n}
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.7, delay: i * 0.15, ease }}
              style={{ position: 'relative' }}>
              <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 80, fontWeight: 500, opacity: 0.07, color: P, lineHeight: 1, position: 'absolute', top: -10, left: -6, userSelect: 'none' }}>{step.n}</p>
              <div style={{ paddingTop: 36 }}>
                <div style={{ width: 60, height: 60, borderRadius: 14, background: 'rgba(147,51,234,0.1)', border: `1px solid rgba(147,51,234,0.28)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>{step.icon}</div>
                <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 22, fontWeight: 700, color: '#fff', marginBottom: 12 }}>{step.title}</h3>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: TXT, lineHeight: 1.65, margin: 0 }}>{step.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <style>{`@keyframes slideAcross { 0% { left: 0; } 100% { left: 100%; } }`}</style>
    </section>
  );
}

// ─── Section 5: Feature Highlights ───────────────────────────────────────────
function FeaturesSection() {
  const checks = (items: string[]) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 22 }}>
      {items.map(item => (
        <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CheckCircle2 size={17} color="#22c55e" style={{ flexShrink: 0 }} />
          <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: TXT }}>{item}</span>
        </div>
      ))}
    </div>
  );

  return (
    <section style={{ padding: '120px max(24px, calc((100vw - 1280px) / 2 + 24px))', background: BG }}>
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: 80 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.2em', color: MUT, fontFamily: 'DM Sans, sans-serif', marginBottom: 14, textTransform: 'uppercase' }}>Features</p>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 700, color: '#fff', margin: 0 }}>Built for Impact</h2>
      </motion.div>

      {/* A: AI Matching */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', marginBottom: 100 }}>
        <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }} style={{ height: 420 }}>
          <AIBrainScene />
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.18em', color: P, fontFamily: 'DM Sans, sans-serif', marginBottom: 14, textTransform: 'uppercase' }}>Gemini AI Engine</p>
          <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 34, fontWeight: 700, color: '#fff', marginBottom: 16, lineHeight: 1.2 }}>Intelligent Volunteer Matching</h3>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, color: TXT, lineHeight: 1.65 }}>
            Gemini analyzes skills, location proximity, and availability simultaneously. No manual searching — the right person surfaces automatically.
          </p>
          {checks(['Skill-to-issue category mapping', 'Proximity-based ranking', 'Availability status filtering', 'Auto-retry on rejection'])}
        </motion.div>
      </div>

      {/* B: Real-Time */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
        <motion.div initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.18em', color: P, fontFamily: 'DM Sans, sans-serif', marginBottom: 14, textTransform: 'uppercase' }}>Real-Time Command</p>
          <h3 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 34, fontWeight: 700, color: '#fff', marginBottom: 16, lineHeight: 1.2 }}>Live Dashboard Operations</h3>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, color: TXT, lineHeight: 1.65 }}>
            Every update happens instantly. Firestore real-time listeners push changes to the dashboard the moment they occur — no refresh needed.
          </p>
          {checks(['Firestore real-time listeners (onSnapshot)', 'Live volunteer availability tracking', 'Instant ticket status updates', 'WhatsApp dispatch via wa.me links'])}
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }} style={{ height: 420 }}>
          <NetworkScene />
        </motion.div>
      </div>
    </section>
  );
}

// ─── Section 6: Stats ────────────────────────────────────────────────────────
function Counter({ to, suffix = '', prefix = '' }: { to: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf: number;
    const start = performance.now();
    const dur = 2000;
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - t, 3);
      setCount(Math.floor(e * to));
      if (t < 1) raf = requestAnimationFrame(tick);
      else setCount(to);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to]);

  return (
    <span ref={ref} style={{
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 'clamp(40px, 4.5vw, 64px)',
      fontWeight: 500,
      background: `linear-gradient(135deg,${P},${S})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }}>{prefix}{count.toLocaleString()}{suffix}</span>
  );
}

function StatsSection() {
  const stats = [
    { to: 1400, suffix: '+', label: 'Active Volunteers', sub: 'Across 12 cities' },
    { to: 20, prefix: '<', suffix: 'min', label: 'Avg Response Time', sub: 'From report to dispatch' },
    { to: 94, suffix: '%', label: 'AI Match Accuracy', sub: 'Gemini-powered' },
    { to: 924, label: 'Issues Resolved', sub: 'And counting' },
  ];

  return (
    <section style={{ padding: '120px max(24px, calc((100vw - 1280px) / 2 + 24px))', background: `linear-gradient(180deg, ${BG} 0%, rgba(147,51,234,0.04) 50%, ${BG} 100%)` }}>
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: 64 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.2em', color: MUT, fontFamily: 'DM Sans, sans-serif', marginBottom: 14, textTransform: 'uppercase' }}>Measured Impact</p>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 700, color: '#fff', margin: 0 }}>Numbers That Matter</h2>
      </motion.div>

      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        {stats.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.1 }}
            style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ textAlign: 'center', padding: '0 48px' }}>
              <Counter to={s.to} suffix={s.suffix} prefix={s.prefix} />
              <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 18, fontWeight: 600, color: '#fff', margin: '8px 0 4px' }}>{s.label}</p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: MUT, margin: 0 }}>{s.sub}</p>
            </div>
            {i < stats.length - 1 && <div style={{ width: 1, height: 60, background: BRD, flexShrink: 0 }} />}
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── Section 7: Testimonials ─────────────────────────────────────────────────
function TestimonialsSection() {
  const cards = [
    { badge: 'DISASTER RELIEF NGO', quote: 'Before VolunteerIQ, we spent 3 hours coordinating 10 volunteers. Now it takes 15 minutes. The WhatsApp dispatch is a game changer.', author: 'Field Coordinator, Mumbai Relief Network' },
    { badge: 'COMMUNITY WELFARE ORG', quote: 'The AI matching is eerily accurate. It recommended a nurse volunteer for a medical supply shortage before we even looked at the list.', author: 'Operations Lead, Nagpur Care Foundation' },
    { badge: 'GOVERNMENT NGO PARTNER', quote: 'We went from managing 4 WhatsApp groups to one dashboard. Real-time ticket tracking has transformed our accountability reporting.', author: 'District Coordinator, Maharashtra Social Welfare' },
  ];

  return (
    <section style={{ padding: '120px 0', background: BG, overflow: 'hidden' }}>
      <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: 52, padding: '0 max(24px, calc((100vw - 1280px) / 2 + 24px))' }}>
        <p style={{ fontSize: 11, letterSpacing: '0.2em', color: MUT, fontFamily: 'DM Sans, sans-serif', marginBottom: 14, textTransform: 'uppercase' }}>Use Cases</p>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(30px, 4vw, 48px)', fontWeight: 700, color: '#fff', margin: 0 }}>Built for Real Organizations</h2>
      </motion.div>

      <div style={{ display: 'flex', gap: 24, padding: '0 max(24px, calc((100vw - 1280px) / 2 + 24px))', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}>
        {cards.map((card, i) => (
          <motion.div key={i}
            initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, delay: i * 0.12 }}
            style={{ minWidth: 440, maxWidth: 510, background: SRF, border: `1px solid ${BRD}`, borderRadius: 16, padding: '36px 40px', scrollSnapAlign: 'start', flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 14, right: 18, fontFamily: 'Georgia, serif', fontSize: 80, color: P, opacity: 0.09, lineHeight: 1, userSelect: 'none' }}>"</div>
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', padding: '4px 12px', borderRadius: 999, background: 'rgba(147,51,234,0.1)', border: `1px solid rgba(147,51,234,0.28)`, color: P, fontFamily: 'DM Sans, sans-serif' }}>{card.badge}</span>
            <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 17, fontWeight: 500, color: '#fff', lineHeight: 1.65, margin: '22px 0 26px' }}>"{card.quote}"</p>
            <div style={{ borderTop: `1px solid ${BRD}`, paddingTop: 18 }}>
              <div style={{ display: 'flex', gap: 3, marginBottom: 8 }}>
                {Array.from({ length: 5 }).map((_, j) => <Star key={j} size={13} fill="#f59e0b" color="#f59e0b" />)}
              </div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: MUT, margin: 0 }}>{card.author}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// ─── CTA Section ─────────────────────────────────────────────────────────────
function CTASection() {
  return (
    <section style={{
      padding: '120px max(24px, calc((100vw - 1280px) / 2 + 24px))',
      background: `radial-gradient(ellipse 80% 100% at 50% 50%, rgba(147,51,234,0.1) 0%, transparent 70%), ${BG}`,
      textAlign: 'center',
    }}>
      <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.7 }}>
        <h2 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(34px, 5vw, 56px)', fontWeight: 800, color: '#fff', lineHeight: 1.1, margin: '0 auto 22px' }}>
          Ready to Coordinate<br />
          <span style={{ background: `linear-gradient(135deg,${P},${S})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            at the Speed of AI?
          </span>
        </h2>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 18, color: TXT, maxWidth: 500, margin: '0 auto 48px', lineHeight: 1.65 }}>
          Join NGOs already using VolunteerIQ to deploy volunteers faster, track impact in real time, and ensure no community need goes unmet.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
          <Link href="/signup">
            <button style={{
              height: 56, width: 210, background: `linear-gradient(135deg,${P},${S})`,
              border: 'none', borderRadius: 12, color: '#fff',
              fontFamily: 'Space Grotesk, sans-serif', fontSize: 16, fontWeight: 700,
              cursor: 'pointer', boxShadow: '0 4px 24px rgba(147,51,234,0.4)', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(147,51,234,0.6)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(147,51,234,0.4)'; }}>
              Get Started Free
            </button>
          </Link>
          <Link href="/login">
            <button style={{
              height: 56, width: 175, background: 'transparent', border: `1px solid ${BRD}`,
              borderRadius: 12, color: TXT, fontFamily: 'DM Sans, sans-serif',
              fontSize: 15, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = P; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BRD; e.currentTarget.style.color = TXT; }}>
              View Dashboard
            </button>
          </Link>
        </div>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: MUT }}>
          No credit card required <span style={{ color: P, margin: '0 6px' }}>•</span>
          Free for NGOs <span style={{ color: P, margin: '0 6px' }}>•</span>
          Powered by Gemini AI
        </p>
      </motion.div>
    </section>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────
function FooterSection() {
  const a = (text: string) => (
    <a key={text} style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: TXT, textDecoration: 'none', display: 'block', marginBottom: 10, transition: 'color 0.15s', cursor: 'pointer' }}
      href="#"
      onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
      onMouseLeave={e => (e.currentTarget.style.color = TXT)}>{text}</a>
  );
  const h = (text: string) => (
    <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.15em', color: MUT, marginBottom: 18, textTransform: 'uppercase' }}>{text}</p>
  );

  return (
    <footer style={{ background: '#060609', borderTop: `1px solid ${BRD}`, padding: '64px max(24px, calc((100vw - 1280px) / 2 + 24px)) 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: 48, marginBottom: 48 }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${P},${S})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 800, color: '#fff' }}>V</div>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 18, fontWeight: 700, color: '#fff' }}>VolunteerIQ</span>
          </div>
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: MUT, lineHeight: 1.65, maxWidth: 270, marginBottom: 24 }}>AI-powered community coordination for NGOs that refuse to wait.</p>
          <div style={{ display: 'flex', gap: 16 }}>
            {[Github, Twitter, Linkedin].map((Icon, i) => (
              <span key={i} style={{ cursor: 'pointer', color: MUT, display: 'flex', transition: 'color 0.15s' }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = '#fff')}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = MUT)}>
                <Icon size={20} />
              </span>
            ))}
          </div>
        </div>
        <div>
          {h('Product')}
          {['Dashboard', 'Report Issue', 'Volunteer Portal', 'AI Insights', 'Map View', 'Settings'].map(a)}
        </div>
        <div>
          {h('For NGOs')}
          {['How It Works', 'Case Studies', 'Gemini AI Integration', 'WhatsApp Dispatch', 'API Status', 'Documentation'].map(a)}
        </div>
        <div>
          {h('Company')}
          {['About VolunteerIQ', 'Solution Challenge 2026', 'DeepCraft Team', 'Privacy Policy', 'Terms of Service', 'Contact Support'].map(a)}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${BRD}`, padding: '24px 0', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: MUT, margin: 0 }}>© 2026 VolunteerIQ. Built for Google Solution Challenge 2026 by DeepCraft.</p>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 13, color: MUT, margin: 0 }}>Powered by Gemini AI • Built with Next.js • Deployed on Vercel</p>
      </div>
    </footer>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect if already logged in
    const uid = getCookieValue('viq_uid');
    const role = getCookieValue('viq_role');
    if (uid && role) {
      router.replace(role === 'coordinator' ? '/dashboard' : '/volunteer');
      return;
    }

    // Lenis smooth scroll
    let rafId: number;
    let lenis: any;

    import('lenis').then(({ default: Lenis }) => {
      lenis = new Lenis({ lerp: 0.08 });
      const raf = (time: number) => { lenis.raf(time); rafId = requestAnimationFrame(raf); };
      rafId = requestAnimationFrame(raf);
    });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) lenis.destroy();
    };
  }, [router]);

  return (
    <div style={{ background: BG, minHeight: '100vh', color: '#fff' }}>
      <CursorGlow />
      <LandingNavbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <ShowcaseSection />
        <HowItWorksSection />
        <FeaturesSection />
        <StatsSection />
        <TestimonialsSection />
        <CTASection />
        <FooterSection />
      </main>
    </div>
  );
}
