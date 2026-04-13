'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  motion,
  useInView,
  useScroll,
  useMotionValue,
  animate,
} from 'framer-motion';
import {
  MessageCircle, EyeOff, FileText, Sparkles, Send,
  CheckCircle2, Github, Twitter, Linkedin,
  UserX,
} from 'lucide-react';
import HeroSection from '@/components/landing/HeroSection';

// ─── Cookie helper ────────────────────────────────────────────────────────────
function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return m ? m[2] : null;
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const ease = [0.25, 0.46, 0.45, 0.94] as const;

// ─── Shared animation preset ─────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};
const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

// ─── Reusable components ──────────────────────────────────────────────────────

/** Scattered diamond shapes */
function Diamonds({ items }: { items: { top?: string; bottom?: string; left?: string; right?: string; size: number; opacity: number }[] }) {
  return (
    <>
      {items.map((d, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: d.top,
            bottom: d.bottom,
            left: d.left,
            right: d.right,
            width: d.size,
            height: d.size,
            background: 'white',
            opacity: d.opacity,
            transform: 'rotate(45deg)',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      ))}
    </>
  );
}

/** Section eyebrow pill badge */
function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 999, padding: '5px 14px',
      fontSize: 11, fontWeight: 500, letterSpacing: '0.12em',
      textTransform: 'uppercase' as const,
      color: 'rgba(255,255,255,0.5)',
      fontFamily: "'Space Grotesk', sans-serif",
      marginBottom: 20,
    }}>
      {children}
    </div>
  );
}

// SectionDivider removed — no inter-section borders

/** Card with hover effect */
function Card({
  children, style,
}: { children: React.ReactNode; style?: React.CSSProperties }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: 16,
        padding: 32,
        backdropFilter: 'blur(8px)',
        transition: 'border-color 0.2s ease, background 0.2s ease',
        position: 'relative' as const,
        overflow: 'hidden' as const,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  children,
  glowPosition = 'bottom-center',
  style,
}: {
  children: React.ReactNode;
  glowPosition?: 'top-left' | 'top-right' | 'bottom-center' | 'center' | 'bottom-right';
  style?: React.CSSProperties;
}) {
  const glowMap: Record<string, string> = {
    'top-left':     'radial-gradient(ellipse 60% 50% at 0% 0%, rgba(50,50,50,0.7) 0%, transparent 70%)',
    'top-right':    'radial-gradient(ellipse 60% 50% at 100% 0%, rgba(50,50,50,0.7) 0%, transparent 70%)',
    'bottom-center':'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(50,50,50,0.7) 0%, transparent 70%)',
    'center':       'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(50,50,50,0.6) 0%, transparent 70%)',
    'bottom-right': 'radial-gradient(ellipse 60% 50% at 100% 100%, rgba(50,50,50,0.65) 0%, transparent 70%)',
  };

  return (
    <section style={{
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}>
      {/* Per-section radial glow */}
      <div style={{
        position: 'absolute', inset: 0,
        background: glowMap[glowPosition],
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div
        className="landing-section-inner"
        style={{
          position: 'relative', zIndex: 2,
          maxWidth: 1100, margin: '0 auto',
        }}
      >
        {children}
      </div>
    </section>
  );
}

// ─── CURSOR GLOW ─────────────────────────────────────────────────────────────
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
      width: 500, height: 500, borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 60%)',
      transform: `translate(${pos.x - 250}px, ${pos.y - 250}px)`,
      pointerEvents: 'none',
      transition: 'transform 0.15s ease',
      zIndex: 9999,
    }} />
  );
}

// ─── SCROLL PROGRESS ─────────────────────────────────────────────────────────
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        height: 1, zIndex: 1000,
        background: 'rgba(255,255,255,0.4)',
        transformOrigin: 'left',
        scaleX: scrollYProgress,
      }}
    />
  );
}

// ─── SECTION 2: PROBLEM ───────────────────────────────────────────────────────
function ProblemSection() {
  const diamonds = [
    { top: '10%', left: '4%',   size: 10, opacity: 0.12 },
    { top: '25%', right: '6%',  size: 7,  opacity: 0.08 },
    { top: '55%', left: '12%',  size: 6,  opacity: 0.10 },
    { bottom: '20%', right: '10%', size: 9, opacity: 0.07 },
    { bottom: '10%', left: '35%', size: 7, opacity: 0.06 },
  ];

  const cards = [
    {
      num: '01',
      icon: <MessageCircle size={26} color="rgba(255,255,255,0.65)" />,
      title: '200+ daily messages',
      body: 'Coordinators manually read WhatsApp chains to find urgent needs. Critical issues get buried under logistics chatter.',
    },
    {
      num: '02',
      icon: <UserX size={26} color="rgba(255,255,255,0.65)" />,
      title: 'Wrong volunteer, wrong time',
      body: 'Without skill matching, whoever picks up the phone gets dispatched — not the most qualified person for the job.',
    },
    {
      num: '03',
      icon: <EyeOff size={26} color="rgba(255,255,255,0.65)" />,
      title: 'Zero visibility',
      body: 'Once an issue is reported verbally, there is no way to track resolution, measure impact, or prevent duplicate responses.',
    },
  ];

  return (
    <Section glowPosition="top-left">
        <Diamonds items={diamonds} />

        <motion.div
          variants={staggerParent} initial="hidden"
          whileInView="show" viewport={{ once: true, margin: '-80px' }}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <motion.div variants={fadeUp}>
            <SectionBadge>✦&nbsp;&nbsp;The Problem</SectionBadge>
          </motion.div>
          <motion.h2 variants={fadeUp} style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(38px, 4.5vw, 52px)',
            fontWeight: 700, color: '#fff',
            lineHeight: 1.15, margin: '0 0 20px',
          }}>
            Community crises lost<br />in the noise.
          </motion.h2>
          <motion.p variants={fadeUp} style={{
            fontSize: 16, color: 'rgba(255,255,255,0.45)',
            maxWidth: 520, margin: '0 auto',
            fontFamily: "'Space Grotesk', sans-serif",
            lineHeight: 1.7,
          }}>
            Coordinators spend hours reading WhatsApp chains, calling volunteers
            one by one, and hoping the right person picks up.
          </motion.p>
        </motion.div>

        {/* 3 Problem Cards */}
        <motion.div
          variants={staggerParent} initial="hidden"
          whileInView="show" viewport={{ once: true, margin: '-60px' }}
          className="lp-grid-3"
          style={{}}
        >
          {cards.map((c) => (
            <motion.div key={c.num} variants={fadeUp}>
              <Card>
                {/* Top white accent bar */}
                <div style={{
                  position: 'absolute', top: 0, left: 32,
                  width: 40, height: 2,
                  background: 'rgba(255,255,255,0.6)',
                }} />
                {/* Background number */}
                <div style={{
                  position: 'absolute', top: 16, right: 24,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 56, fontWeight: 500,
                  color: 'rgba(255,255,255,0.07)',
                  lineHeight: 1, userSelect: 'none',
                }}>
                  {c.num}
                </div>
                <div style={{ marginBottom: 16, marginTop: 20 }}>{c.icon}</div>
                <h3 style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 20, fontWeight: 600, color: '#fff',
                  marginBottom: 12,
                }}>
                  {c.title}
                </h3>
                <p style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: 14, color: 'rgba(255,255,255,0.45)',
                  lineHeight: 1.7, margin: 0,
                }}>
                  {c.body}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Before → After */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3, ease }}
          style={{
            display: 'flex', alignItems: 'center',
            gap: 20, justifyContent: 'center', marginTop: 60,
            flexWrap: 'wrap',
          }}
        >
          <span style={{
            fontSize: 13, color: 'rgba(255,255,255,0.3)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 999, padding: '6px 16px',
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            BEFORE
          </span>
          <div style={{
            width: 100, height: 1,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.4), rgba(255,255,255,0.1))',
          }} />
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 18 }}>→</span>
          <div style={{
            width: 100, height: 1,
            background: 'linear-gradient(90deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))',
          }} />
          <span style={{
            fontSize: 13, color: 'rgba(255,255,255,0.7)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 999, padding: '6px 16px',
            background: 'rgba(255,255,255,0.05)',
            fontFamily: "'Space Grotesk', sans-serif",
          }}>
            ✦&nbsp;&nbsp;VOLUNTEERIQ
          </span>
        </motion.div>
      </Section>
  );
}

// ─── SECTION 3: PRODUCT SHOWCASE ─────────────────────────────────────────────
type TabKey = 'Dashboard' | 'AI Insights' | 'Map View' | 'Volunteer Portal';

function DashboardMockup() {
  const P = '#9333ea';
  const statCards = [
    { label: 'TOTAL ISSUES', value: '1,284', color: P },
    { label: 'PENDING',      value: '42',    color: '#ef4444' },
    { label: 'ASSIGNED',     value: '318',   color: P },
    { label: 'COMPLETED',    value: '924',   color: '#22c55e' },
  ];
  const rows = [
    { t: 'Flood damage in residential area', c: 'Infrastructure', s: 'PENDING',  sc: '#ef4444', sb: 'rgba(239,68,68,0.15)' },
    { t: 'Medical supply shortage at clinic', c: 'Health & Welfare', s: 'ASSIGNED', sc: P,        sb: 'rgba(147,51,234,0.15)' },
    { t: 'Fallen tree blocking main road',   c: 'Public Safety',    s: 'DONE',    sc: '#22c55e', sb: 'rgba(34,197,94,0.15)' },
  ];
  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, height: '100%', overflow: 'hidden', background: '#0a0a0f' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
        {statCards.map(s => (
          <div key={s.label} style={{ background: '#111118', border: '1px solid #27272a', borderRadius: 10, padding: '12px 14px' }}>
            <p style={{ fontSize: 8, color: '#52525b', letterSpacing: '0.12em', marginBottom: 8, fontFamily: "'Space Grotesk',sans-serif", textTransform: 'uppercase' }}>{s.label}</p>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 22, color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div style={{ background: '#111118', border: '1px solid #27272a', borderRadius: 10, overflow: 'hidden', flex: 1 }}>
        <div style={{ padding: '10px 16px', borderBottom: '1px solid #27272a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 600, color: '#fff' }}>Recent Submissions</span>
          <span style={{ fontSize: 11, color: P, fontFamily: "'Space Grotesk',sans-serif" }}>View All →</span>
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', padding: '10px 16px', borderBottom: i < 2 ? '1px solid #1a1a24' : 'none', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, color: '#fff', fontFamily: "'Space Grotesk',sans-serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.t}</span>
            <span style={{ fontSize: 10, color: '#a1a1aa', fontFamily: "'Space Grotesk',sans-serif" }}>{r.c}</span>
            <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: r.sb, color: r.sc, whiteSpace: 'nowrap', fontFamily: "'Space Grotesk',sans-serif" }}>{r.s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIMockup() {
  const P = '#9333ea';
  return (
    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, background: '#0a0a0f', height: '100%' }}>
      <div style={{ background: '#111118', border: `1px solid rgba(147,51,234,0.35)`, borderRadius: 12, padding: 20, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
          <span style={{ color: P, fontSize: 14 }}>✦</span>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 600, color: '#fff' }}>Gemini Intelligence Report</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <p style={{ fontSize: 8, color: '#52525b', letterSpacing: '0.12em', marginBottom: 6, fontFamily: "'Space Grotesk',sans-serif", textTransform: 'uppercase' }}>Priority</p>
            <span style={{ padding: '3px 10px', borderRadius: 5, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', fontSize: 10, fontWeight: 700 }}>URGENT</span>
            <p style={{ fontSize: 8, color: '#52525b', letterSpacing: '0.12em', marginBottom: 4, fontFamily: "'Space Grotesk',sans-serif", textTransform: 'uppercase', marginTop: 12 }}>Category</p>
            <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>Health & Welfare</p>
            <p style={{ fontSize: 11, color: '#a1a1aa', fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1.5, marginTop: 8 }}>Critical shortage of supplies at Nagpur clinic affecting 200+ patients.</p>
          </div>
          <div>
            <p style={{ fontSize: 8, color: '#52525b', letterSpacing: '0.12em', marginBottom: 8, fontFamily: "'Space Grotesk',sans-serif", textTransform: 'uppercase' }}>Best Match</p>
            <div style={{ background: '#1a1a24', border: '1px solid #27272a', borderRadius: 8, padding: '10px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: `linear-gradient(135deg,${P},#c026d3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>MC</div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: "'Space Grotesk',sans-serif", marginBottom: 2 }}>Marcus Chen</p>
                <p style={{ fontSize: 9, color: P, fontFamily: "'Space Grotesk',sans-serif" }}>Medical · 2.1km</p>
              </div>
            </div>
            <p style={{ fontSize: 8, color: '#52525b', letterSpacing: '0.1em', marginBottom: 6, fontFamily: "'Space Grotesk',sans-serif", textTransform: 'uppercase' }}>Confidence</p>
            <div style={{ height: 4, background: '#27272a', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: '94%', height: '100%', background: `linear-gradient(90deg,${P},#c026d3)`, borderRadius: 2 }} />
            </div>
            <p style={{ fontSize: 10, color: P, fontFamily: "'JetBrains Mono',monospace", marginTop: 4 }}>94%</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MapMockup() {
  const P = '#9333ea';
  const markers = [
    { x: '28%', y: '42%', c: '#ef4444' }, { x: '54%', y: '28%', c: '#f59e0b' },
    { x: '70%', y: '58%', c: P },          { x: '40%', y: '67%', c: '#22c55e' },
    { x: '78%', y: '33%', c: '#ef4444' }, { x: '20%', y: '24%', c: '#f59e0b' },
    { x: '60%', y: '75%', c: P },          { x: '85%', y: '55%', c: '#22c55e' },
  ];
  return (
    <div style={{ height: '100%', background: '#0d1117', position: 'relative', overflow: 'hidden' }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.12 }}>
        {Array.from({ length: 14 }).map((_, i) => (
          <line key={`v${i}`} x1={`${(i / 14) * 100}%`} y1="0" x2={`${(i / 14) * 100}%`} y2="100%" stroke="#27272a" strokeWidth="1" />
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={`${(i / 9) * 100}%`} x2="100%" y2={`${(i / 9) * 100}%`} stroke="#27272a" strokeWidth="1" />
        ))}
      </svg>
      {markers.map((m, i) => (
        <div key={i} style={{ position: 'absolute', left: m.x, top: m.y, transform: 'translate(-50%,-100%)' }}>
          <div style={{ width: 18, height: 18, borderRadius: '50% 50% 50% 0', background: m.c, transform: 'rotate(-45deg)', boxShadow: `0 0 10px ${m.c}90` }} />
        </div>
      ))}
      <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(17,17,24,0.9)', backdropFilter: 'blur(12px)', border: '1px solid #27272a', borderRadius: 10, padding: '6px 10px', display: 'flex', gap: 5 }}>
        {['All','🏥','🍽️','🏠','🚨'].map((f,i) => (
          <span key={f} style={{ fontSize: 9, padding: '2px 8px', borderRadius: 4, background: i===0 ? `rgba(147,51,234,0.2)` : 'transparent', border: `1px solid ${i===0 ? P : '#27272a'}`, color: i===0 ? P : '#a1a1aa', fontFamily: "'Space Grotesk',sans-serif" }}>{f}</span>
        ))}
      </div>
      <div style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(17,17,24,0.9)', backdropFilter: 'blur(12px)', border: '1px solid #27272a', borderRadius: 10, padding: '8px 12px' }}>
        <p style={{ fontSize: 9, color: '#52525b', fontFamily: "'Space Grotesk',sans-serif", marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Incidents</p>
        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 18, color: P, margin: 0 }}>8</p>
      </div>
    </div>
  );
}

function VolunteerMockup() {
  const P = '#9333ea';
  const missions = [
    { t: 'Medical supply delivery to Nagpur clinic',   u: 'URGENT', uc: '#ef4444', ub: 'rgba(239,68,68,0.15)',    btn: true },
    { t: 'Flood damage assessment alongside Wardha Rd', u: 'HIGH',   uc: '#f59e0b', ub: 'rgba(245,158,11,0.15)',  btn: false },
    { t: 'Community food distribution drive',           u: 'MEDIUM', uc: '#a1a1aa', ub: 'rgba(161,161,170,0.1)', btn: false },
  ];
  return (
    <div style={{ padding: 16, display: 'flex', gap: 14, overflow: 'hidden', height: '100%', background: '#0a0a0f' }}>
      <div style={{ width: 200, flexShrink: 0 }}>
        <div style={{ background: '#111118', border: '1px solid #27272a', borderRadius: 10, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: `linear-gradient(135deg,${P},#c026d3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>MC</div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: "'Space Grotesk',sans-serif", marginBottom: 4 }}>Marcus Chen</p>
              <span style={{ fontSize: 9, fontWeight: 700, color: '#22c55e', background: 'rgba(34,197,94,0.12)', padding: '2px 7px', borderRadius: 4 }}>● ACTIVE</span>
            </div>
          </div>
          <div style={{ background: '#0a0a0f', borderRadius: 6, padding: '8px 10px', fontSize: 10, color: '#a1a1aa', fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1.5 }}>Medical Response · Emergency</div>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 13, fontWeight: 600, color: '#fff', marginBottom: 10 }}>Available Missions (3)</p>
        {missions.map((m, i) => (
          <div key={i} style={{ background: '#111118', border: '1px solid #27272a', borderLeft: `3px solid ${m.uc}`, borderRadius: 8, padding: '10px 12px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#fff', fontFamily: "'Space Grotesk',sans-serif", marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.t}</p>
              <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: m.ub, color: m.uc }}>{m.u}</span>
            </div>
            <button style={{ fontSize: 9, padding: '4px 10px', borderRadius: 5, background: m.btn ? `linear-gradient(135deg,${P},#c026d3)` : '#1a1a24', border: `1px solid ${m.btn ? 'transparent' : '#27272a'}`, color: '#fff', cursor: 'default', whiteSpace: 'nowrap', fontFamily: "'Space Grotesk',sans-serif" }}>
              {m.btn ? '✓ Apply' : "I'm Available"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ShowcaseSection() {
  const [tab, setTab] = useState<TabKey>('Dashboard');
  const tabs: TabKey[] = ['Dashboard', 'AI Insights', 'Map View', 'Volunteer Portal'];
  const urls: Record<TabKey, string> = {
    'Dashboard': 'volunteeriq.app/dashboard',
    'AI Insights': 'volunteeriq.app/ai-insights',
    'Map View': 'volunteeriq.app/map',
    'Volunteer Portal': 'volunteeriq.app/volunteer',
  };
  const mockups: Record<TabKey, React.ReactNode> = {
    'Dashboard':        <DashboardMockup />,
    'AI Insights':      <AIMockup />,
    'Map View':         <MapMockup />,
    'Volunteer Portal': <VolunteerMockup />,
  };

  const diamonds = [
    { top: '8%',  right: '5%', size: 9,  opacity: 0.10 },
    { bottom: '15%', left: '4%', size: 11, opacity: 0.07 },
    { top: '40%', right: '3%', size: 7,  opacity: 0.08 },
  ];

  return (
    <Section glowPosition="bottom-center">
        <Diamonds items={diamonds} />

        <motion.div
          variants={staggerParent} initial="hidden"
          whileInView="show" viewport={{ once: true, margin: '-80px' }}
          style={{ textAlign: 'center', marginBottom: 48 }}
        >
          <motion.div variants={fadeUp}><SectionBadge>✦&nbsp;&nbsp;The Platform</SectionBadge></motion.div>
          <motion.h2 variants={fadeUp} style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(38px, 4.5vw, 52px)',
            fontWeight: 700, color: '#fff', lineHeight: 1.15, margin: '0 0 20px',
          }}>
            One dashboard.<br />Total command.
          </motion.h2>
          <motion.p variants={fadeUp} style={{
            fontSize: 16, color: 'rgba(255,255,255,0.45)',
            maxWidth: 480, margin: '0 auto', fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1.7,
          }}>
            Everything your team needs — issue intake, AI triage, volunteer dispatch, and live tracking — in a single unified view.
          </motion.p>
        </motion.div>

        {/* Browser frame */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease }}
        >
          <div
            style={{
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 16, overflow: 'hidden',
              boxShadow: '0 0 0 1px rgba(255,255,255,0.05), 0 40px 100px rgba(0,0,0,0.8), 0 0 80px rgba(255,255,255,0.03)',
              maxWidth: 900, margin: '0 auto',
              transition: 'transform 0.8s ease',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'perspective(1200px) rotateX(1deg) rotateY(0deg)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'perspective(1200px) rotateX(6deg) rotateY(-2deg)')}
            ref={el => { if (el) el.style.transform = 'perspective(1200px) rotateX(6deg) rotateY(-2deg)'; }}
          >
            {/* Chrome bar */}
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              height: 40, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 6,
            }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: 'rgba(255,255,255,0.15)' }} />
              ))}
              <div style={{
                flex: 1, maxWidth: 300,
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 6, padding: '4px 12px', margin: '0 auto',
                fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: "'Space Grotesk',sans-serif",
                textAlign: 'center',
              }}>
                {urls[tab]}
              </div>
            </div>
            {/* Content */}
            <div style={{ height: 420, background: '#080808', overflow: 'hidden' }}>
              <motion.div
                key={tab}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{ height: '100%' }}
              >
                {mockups[tab]}
              </motion.div>
            </div>
          </div>

          {/* Tab switcher */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
            {tabs.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  padding: '8px 20px', borderRadius: 999, cursor: 'pointer',
                  border: tab === t ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.08)',
                  background: tab === t ? 'rgba(255,255,255,0.06)' : 'transparent',
                  color: tab === t ? '#fff' : 'rgba(255,255,255,0.35)',
                  fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: tab === t ? 500 : 400,
                  transition: 'all 0.2s ease',
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </motion.div>
      </Section>
  );
}

// ─── SECTION 4: HOW IT WORKS ─────────────────────────────────────────────────
function HowItWorksSection() {
  const steps = [
    {
      n: '01', icon: <FileText size={26} color="rgba(255,255,255,0.65)" />,
      title: 'Issue reported',
      body: 'Submit a structured form — Gemini AI instantly reads it, assigns urgency, and categorizes the problem.',
      tag: '→ Ticket opened. AI triage complete.',
    },
    {
      n: '02', icon: <Sparkles size={26} color="rgba(255,255,255,0.65)" />,
      title: 'AI finds the match',
      body: 'Gemini analyzes every available volunteer — skills, proximity, and availability — and surfaces the single best person.',
      tag: '→ Best volunteer identified in seconds.',
    },
    {
      n: '03', icon: <Send size={26} color="rgba(255,255,255,0.65)" />,
      title: 'Volunteer dispatched',
      body: 'One click sends a WhatsApp dispatch. Accept or reject — if rejected, Gemini finds the next best match automatically.',
      tag: '→ WhatsApp sent. Mission assigned.',
    },
  ];

  const diamonds = [
    { top: '15%', right: '5%', size: 10, opacity: 0.09 },
    { bottom: '25%', left: '3%', size: 8,  opacity: 0.07 },
    { top: '50%', right: '15%', size: 6,  opacity: 0.10 },
  ];

  return (
    <Section glowPosition="top-right">
        <Diamonds items={diamonds} />

        <motion.div
          variants={staggerParent} initial="hidden"
          whileInView="show" viewport={{ once: true, margin: '-80px' }}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <motion.div variants={fadeUp}><SectionBadge>✦&nbsp;&nbsp;The Process</SectionBadge></motion.div>
          <motion.h2 variants={fadeUp} style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(38px, 4.5vw, 52px)',
            fontWeight: 700, color: '#fff', lineHeight: 1.15, margin: 0,
          }}>
            From crisis to resolution<br />in minutes.
          </motion.h2>
        </motion.div>

        <div style={{ position: 'relative' }}>
          {/* Connecting dashed lines */}
          {[0, 1].map(i => (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: '40%',
                left: `${33.3 + i * 33.4}%`,
                width: '33.4%',
                height: 1,
                borderTop: '1px dashed rgba(255,255,255,0.08)',
                pointerEvents: 'none',
                transform: 'translateX(-100%)',
              }}
            >
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'rgba(255,255,255,0.4)',
                position: 'absolute', top: -3, left: 0,
                animation: `travel ${2.5 + i * 0.5}s linear infinite`,
              }} />
            </div>
          ))}

          <motion.div
            variants={staggerParent} initial="hidden"
            whileInView="show" viewport={{ once: true, margin: '-60px' }}
            className="lp-grid-3"
            style={{}}
          >
            {steps.map(step => (
              <motion.div key={step.n} variants={fadeUp}>
                <Card style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: 16,
                    paddingBottom: 16,
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <span style={{
                      fontFamily: "'JetBrains Mono',monospace",
                      fontSize: 13, color: 'rgba(255,255,255,0.2)', fontWeight: 500,
                    }}>{step.n}</span>
                  </div>
                  <div style={{ marginBottom: 14 }}>{step.icon}</div>
                  <h3 style={{
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontSize: 20, fontWeight: 600, color: '#fff', marginBottom: 12,
                  }}>{step.title}</h3>
                  <p style={{
                    fontFamily: "'Space Grotesk',sans-serif",
                    fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7,
                    margin: '0 0 20px', flex: 1,
                  }}>{step.body}</p>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 999, padding: '5px 14px',
                    fontSize: 11, color: 'rgba(255,255,255,0.4)',
                    fontFamily: "'Space Grotesk',sans-serif",
                  }}>{step.tag}</div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <style>{`
          @keyframes travel { from { left: 0; } to { left: 100%; } }
        `}</style>
      </Section>
  );
}

// ─── SECTION 5: FEATURES ─────────────────────────────────────────────────────
function AIMockupCard() {
  const P = '#9333ea';
  return (
    <div style={{ animation: 'float 4s ease-in-out infinite', willChange: 'transform' }}>
      <div style={{
        background: '#111118', border: `1px solid rgba(147,51,234,0.3)`,
        borderRadius: 16, padding: 28, maxWidth: 400, margin: '0 auto',
        boxShadow: '0 0 40px rgba(147,51,234,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <span style={{ color: P, fontSize: 14 }}>✦</span>
          <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 14, fontWeight: 600, color: '#fff' }}>Gemini Intelligence Report</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <p style={{ fontSize: 9, color: '#52525b', letterSpacing: '0.12em', marginBottom: 6, fontFamily: "'Space Grotesk',sans-serif", textTransform: 'uppercase' }}>Priority</p>
            <span style={{ padding: '4px 12px', borderRadius: 5, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', color: '#ef4444', fontSize: 11, fontWeight: 700 }}>URGENT</span>
            <p style={{ fontSize: 9, color: '#52525b', letterSpacing: '0.12em', marginBottom: 4, fontFamily: "'Space Grotesk',sans-serif", textTransform: 'uppercase', marginTop: 14 }}>Category</p>
            <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>Emergency Response</p>
            <p style={{ fontSize: 12, color: '#a1a1aa', fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1.5, marginTop: 8 }}>High volume in Sector 4</p>
          </div>
          <div>
            <p style={{ fontSize: 9, color: '#52525b', letterSpacing: '0.12em', marginBottom: 10, fontFamily: "'Space Grotesk',sans-serif", textTransform: 'uppercase' }}>Best Volunteer Match</p>
            <div style={{ background: '#1a1a24', border: '1px solid #27272a', borderRadius: 8, padding: '12px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg,${P},#c026d3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>MC</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', fontFamily: "'Space Grotesk',sans-serif", marginBottom: 2 }}>Marcus Chen</p>
                <p style={{ fontSize: 10, color: P, fontFamily: "'Space Grotesk',sans-serif" }}>Medical Expert · 2km away</p>
              </div>
            </div>
            <div style={{ height: 4, background: '#27272a', borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
              <div style={{ width: '94%', height: '100%', background: `linear-gradient(90deg,${P},#c026d3)`, borderRadius: 2 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: '#52525b', fontFamily: "'Space Grotesk',sans-serif" }}>Real-time synthesis</span>
              <span style={{ fontSize: 11, color: P, fontFamily: "'JetBrains Mono',monospace" }}>94%</span>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>
    </div>
  );
}

function StatsMiniGrid() {
  const P = '#9333ea';
  const stats = [
    { label: 'TOTAL ISSUES', value: '1,284', vc: P },
    { label: 'PENDING',      value: '42',    vc: '#ef4444', badge: 'URGENT' },
    { label: 'ASSIGNED',     value: '318',   vc: P },
    { label: 'COMPLETED',    value: '924',   vc: '#22c55e' },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease }}
      style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, maxWidth: 380, margin: '0 auto' }}
    >
      {stats.map(s => (
        <div key={s.label} style={{ background: '#111118', border: '1px solid #27272a', borderRadius: 14, padding: '18px 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <p style={{ fontSize: 9, color: '#52525b', letterSpacing: '0.12em', fontFamily: "'Space Grotesk',sans-serif", textTransform: 'uppercase', margin: 0 }}>{s.label}</p>
            {s.badge && (
              <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)', color: '#ef4444', whiteSpace: 'nowrap', fontFamily: "'Space Grotesk',sans-serif" }}>
                {s.badge}
              </span>
            )}
          </div>
          <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 28, fontWeight: 500, color: s.vc, margin: 0 }}>{s.value}</p>
        </div>
      ))}
    </motion.div>
  );
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      fontSize: 14, color: 'rgba(255,255,255,0.55)',
      padding: '8px 0',
      borderBottom: '1px solid rgba(255,255,255,0.04)',
      fontFamily: "'Space Grotesk',sans-serif",
    }}>
      <CheckCircle2 size={16} color="rgba(255,255,255,0.6)" style={{ flexShrink: 0 }} />
      {children}
    </div>
  );
}

function FeaturesSection() {
  const diamonds = [
    { top: '20%', left: '2%',   size: 8,  opacity: 0.08 },
    { top: '60%', right: '3%',  size: 10, opacity: 0.07 },
    { bottom: '15%', left: '30%', size: 6, opacity: 0.06 },
  ];

  return (
    <Section glowPosition="center">
        <Diamonds items={diamonds} />

        {/* Sub-section A: AI Matching */}
        <div className="lp-grid-2" style={{ marginBottom: 120 }}>
          <motion.div
            initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, ease }}
          >
            <SectionBadge>✦&nbsp;&nbsp;Gemini AI Engine</SectionBadge>
            <h3 style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontSize: 'clamp(32px, 3.5vw, 42px)',
              fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 20,
            }}>
              Intelligent volunteer<br />matching.
            </h3>
            <p style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontSize: 15, color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.75, maxWidth: 420, marginBottom: 24,
            }}>
              Gemini analyzes skills, location, and availability simultaneously. The right person surfaces automatically — no manual searching.
            </p>
            <div>
              {['Skill-to-issue category mapping', 'Proximity-based ranking', 'Availability status filtering', 'Auto-retry on rejection'].map(item => (
                <CheckItem key={item}>{item}</CheckItem>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, ease }}
          >
            <AIMockupCard />
          </motion.div>
        </div>

        {/* Sub-section B: Real-time */}
        <div className="lp-grid-2" style={{ marginBottom: 0 }}>
          <motion.div
            initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, ease }}
          >
            <StatsMiniGrid />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 40 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, ease }}
          >
            <SectionBadge>✦&nbsp;&nbsp;Real-time Command</SectionBadge>
            <h3 style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontSize: 'clamp(32px, 3.5vw, 42px)',
              fontWeight: 700, color: '#fff', lineHeight: 1.2, marginBottom: 20,
            }}>
              Live dashboard.<br />Zero refresh needed.
            </h3>
            <p style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontSize: 15, color: 'rgba(255,255,255,0.5)',
              lineHeight: 1.75, maxWidth: 420, marginBottom: 24,
            }}>
              Every update happens instantly. Firestore real-time listeners push changes to the dashboard the moment they occur.
            </p>
            <div>
              {['Firestore real-time listeners', 'Live volunteer availability', 'Instant ticket status updates', 'WhatsApp broadcast to 20+ volunteers'].map(item => (
                <CheckItem key={item}>{item}</CheckItem>
              ))}
            </div>
          </motion.div>
        </div>
      </Section>
  );
}

// ─── SECTION 6: STATS ────────────────────────────────────────────────────────
function CountUp({ to, prefix = '', suffix = '' }: { to: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionVal, to, {
      duration: 2,
      ease: 'easeOut',
      onUpdate: v => setDisplay(Math.floor(v)),
    });
    return controls.stop;
  }, [inView, to, motionVal]);

  return (
    <span ref={ref} style={{
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: 'clamp(40px, 5vw, 60px)',
      fontWeight: 500, color: '#fff',
    }}>
      {prefix}{display.toLocaleString()}{suffix}
    </span>
  );
}

function StatsSection() {
  const stats = [
    { to: 1400, suffix: '+',   label: 'Active Volunteers', sub: 'Across 12 cities' },
    { prefix: '< ', to: 20,  suffix: 'min', label: 'Avg Response', sub: 'Report to dispatch' },
    { to: 94,  suffix: '%',   label: 'AI Accuracy', sub: 'Gemini-powered' },
    { to: 924, suffix: '',    label: 'Issues Resolved', sub: 'And counting' },
  ];

  const diamonds = [
    { top: '20%', left: '5%',   size: 9,  opacity: 0.09 },
    { bottom: '20%', right: '5%', size: 11, opacity: 0.07 },
    { top: '50%', left: '50%',  size: 6,  opacity: 0.06 },
  ];

  return (
    <Section glowPosition="center" style={{ padding: '80px 40px' }}>
        <Diamonds items={diamonds} />
        {/* Wider center glow for this section */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 100% 40% at 50% 50%, rgba(40,40,40,0.6) 0%, transparent 70%)',
          pointerEvents: 'none', zIndex: 0,
        }} />

        <motion.div
          variants={staggerParent} initial="hidden"
          whileInView="show" viewport={{ once: true, margin: '-60px' }}
          style={{ textAlign: 'center', marginBottom: 64 }}
        >
          <motion.div variants={fadeUp}><SectionBadge>✦&nbsp;&nbsp;Measured Impact</SectionBadge></motion.div>
          <motion.h2 variants={fadeUp} style={{
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: 'clamp(38px, 4.5vw, 52px)',
            fontWeight: 700, color: '#fff', lineHeight: 1.15, margin: 0,
          }}>
            Numbers that matter.
          </motion.h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7, ease }}
          className="lp-stats-row"
          style={{}}
        >
          {stats.map((s, i) => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center' }}>
              {i > 0 && <div style={{ width: 1, height: 60, background: 'rgba(255,255,255,0.08)', margin: '0 40px' }} />}
              <div style={{ textAlign: 'center', padding: '0 24px' }}>
                <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} />
                <p style={{
                  fontFamily: "'Space Grotesk',sans-serif",
                  fontSize: 18, fontWeight: 600, color: '#fff', margin: '8px 0 4px',
                }}>{s.label}</p>
                <p style={{
                  fontFamily: "'Space Grotesk',sans-serif",
                  fontSize: 13, color: 'rgba(255,255,255,0.35)', margin: 0,
                }}>{s.sub}</p>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
          viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.5 }}
          style={{
            textAlign: 'center', marginTop: 48,
            fontSize: 14, color: 'rgba(255,255,255,0.2)',
            fontFamily: "'Space Grotesk',sans-serif",
          }}
        >
          Built for the Google Solution Challenge 2026 · Team DeepCraft · Nagpur, India
        </motion.p>
    </Section>
  );
}

// ─── SECTION 7: TESTIMONIALS ─────────────────────────────────────────────────
function TestimonialsSection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const cards = [
    {
      badge: 'DISASTER RELIEF NGO',
      quote: 'Before VolunteerIQ, we spent 3 hours coordinating 10 volunteers. Now it takes 15 minutes. The WhatsApp dispatch changed everything.',
      attribution: 'Field Coordinator · Mumbai Relief Network',
    },
    {
      badge: 'COMMUNITY WELFARE ORG',
      quote: 'The AI matching is accurate. It recommended a nurse for a medical shortage before we even looked at the list manually.',
      attribution: 'Operations Lead · Nagpur Care Foundation',
    },
    {
      badge: 'GOVERNMENT NGO PARTNER',
      quote: 'From 4 WhatsApp groups to one dashboard. Real-time ticket tracking transformed our accountability reporting completely.',
      attribution: 'District Coordinator · Maharashtra Social Welfare',
    },
  ];

  const scroll = (dir: -1 | 1) => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: dir * 436, behavior: 'smooth' });
    }
  };

  const diamonds = [
    { bottom: '15%', right: '4%',  size: 11, opacity: 0.08 },
    { top: '10%', left: '6%',    size: 8,  opacity: 0.07 },
    { top: '40%', right: '8%',   size: 7,  opacity: 0.06 },
  ];

  return (
    <Section glowPosition="bottom-right">
        <Diamonds items={diamonds} />

        <motion.div
          variants={staggerParent} initial="hidden"
          whileInView="show" viewport={{ once: true, margin: '-80px' }}
          style={{ textAlign: 'center', marginBottom: 48 }}
        >
          <motion.div variants={fadeUp}><SectionBadge>✦&nbsp;&nbsp;Use Cases</SectionBadge></motion.div>
          <motion.h2 variants={fadeUp} style={{
            fontFamily: "'Space Grotesk',sans-serif",
            fontSize: 'clamp(38px, 4.5vw, 52px)',
            fontWeight: 700, color: '#fff', lineHeight: 1.15, margin: 0,
          }}>
            Built for real organizations.
          </motion.h2>
        </motion.div>

        {/* Arrows + scrollable track */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => scroll(-1)}
            style={{
              position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)',
              zIndex: 10, width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)', fontSize: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >←</button>

          <div
            ref={trackRef}
            style={{
              display: 'flex', gap: 16,
              overflowX: 'auto', scrollSnapType: 'x mandatory',
              padding: '8px 4px 24px',
              msOverflowStyle: 'none', scrollbarWidth: 'none',
            } as React.CSSProperties}
          >
            {cards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1, ease }}
                className="lp-testimonial-card"
                style={{ scrollSnapAlign: 'start', flexShrink: 0, width: 420 }}
              >
                <Card style={{ height: '100%' }}>
                  <SectionBadge>{card.badge}</SectionBadge>
                  <div style={{
                    fontSize: 64, fontFamily: 'Georgia, serif',
                    color: 'rgba(255,255,255,0.08)', lineHeight: 0.8,
                    display: 'block', marginBottom: 16, marginTop: 8,
                  }}>"</div>
                  <p style={{
                    fontSize: 16, color: 'rgba(255,255,255,0.6)',
                    lineHeight: 1.8, fontFamily: "'Space Grotesk',sans-serif",
                    margin: '0 0 24px',
                  }}>{card.quote}</p>
                  <div style={{
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    paddingTop: 16, display: 'flex',
                    justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', fontFamily: "'Space Grotesk',sans-serif" }}>
                      {card.attribution}
                    </span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <span key={j} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>✦</span>
                      ))}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          <button
            onClick={() => scroll(1)}
            style={{
              position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)',
              zIndex: 10, width: 40, height: 40, borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)', fontSize: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >→</button>
        </div>

        <style>{`.testimonial-track::-webkit-scrollbar { display: none; }`}</style>
      </Section>
  );
}

// ─── CTA SECTION ─────────────────────────────────────────────────────────────
function CTASection() {
  const [btn1Hovered, setBtn1Hovered] = useState(false);
  const [btn2Hovered, setBtn2Hovered] = useState(false);

  const diamonds = [
    { top: '15%', left: '5%',   size: 12, opacity: 0.08 },
    { top: '25%', right: '8%',  size: 10, opacity: 0.10 },
    { bottom: '20%', left: '10%', size: 14, opacity: 0.06 },
    { bottom: '15%', right: '5%', size: 11, opacity: 0.08 },
    { top: '50%', left: '50%',  size: 8,  opacity: 0.06 },
    { bottom: '35%', right: '20%', size: 9, opacity: 0.07 },
  ];

  return (
    <section className="lp-cta-section" style={{ position: 'relative', padding: '160px 40px', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(40,40,40,0.9) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <Diamonds items={diamonds} />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
          <motion.div
            variants={staggerParent} initial="hidden"
            whileInView="show" viewport={{ once: true, margin: '-80px' }}
          >
            <motion.div variants={fadeUp}><SectionBadge>✦&nbsp;&nbsp;Get Started</SectionBadge></motion.div>
            <motion.h2 variants={fadeUp} style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontSize: 'clamp(42px, 5vw, 60px)',
              fontWeight: 800, color: '#fff', lineHeight: 1.1,
              margin: '0 0 24px',
            }}>
              Ready to coordinate<br />at the speed of AI?
            </motion.h2>
            <motion.p variants={fadeUp} style={{
              fontSize: 16, color: 'rgba(255,255,255,0.45)',
              maxWidth: 480, margin: '0 auto 48px',
              fontFamily: "'Space Grotesk',sans-serif", lineHeight: 1.75,
            }}>
              Join NGOs already using VolunteerIQ to deploy volunteers faster, track impact in real time, and ensure no community need goes unmet.
            </motion.p>
            <motion.div variants={fadeUp} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
              <Link
                href="/signup"
                onMouseEnter={() => setBtn1Hovered(true)}
                onMouseLeave={() => setBtn1Hovered(false)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '13px 28px', borderRadius: 999,
                  border: btn1Hovered ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.18)',
                  background: btn1Hovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(8px)', color: '#fff',
                  fontSize: 15, fontWeight: 500,
                  fontFamily: "'Space Grotesk',sans-serif",
                  textDecoration: 'none', transition: 'all 0.2s ease',
                }}
              >
                ✦&nbsp;&nbsp;Launch Command Center
              </Link>
              <Link
                href="#demo"
                onMouseEnter={() => setBtn2Hovered(true)}
                onMouseLeave={() => setBtn2Hovered(false)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '13px 28px', borderRadius: 999,
                  border: btn2Hovered ? '1px solid rgba(255,255,255,0.25)' : '1px solid rgba(255,255,255,0.1)',
                  background: btn2Hovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
                  backdropFilter: 'blur(8px)', color: 'rgba(255,255,255,0.8)',
                  fontSize: 15, fontWeight: 500,
                  fontFamily: "'Space Grotesk',sans-serif",
                  textDecoration: 'none', transition: 'all 0.2s ease',
                }}
              >
                → Watch Demo
              </Link>
            </motion.div>
            <motion.p variants={fadeUp} style={{
              fontSize: 13, color: 'rgba(255,255,255,0.2)',
              fontFamily: "'Space Grotesk',sans-serif",
            }}>
              No credit card required&nbsp;&nbsp;·&nbsp;&nbsp;Free for NGOs&nbsp;&nbsp;·&nbsp;&nbsp;Powered by Gemini AI
            </motion.p>
          </motion.div>
        </div>
    </section>
  );
}

// ─── FOOTER ──────────────────────────────────────────────────────────────────
function FooterLink({ label, href = '#' }: { label: string; href?: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'block',
        fontFamily: "'Space Grotesk',sans-serif",
        fontSize: 14,
        color: hovered ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.4)',
        textDecoration: 'none',
        lineHeight: 2.2,
        transition: 'color 0.15s ease',
        cursor: 'pointer',
      }}
    >
      {label}
    </a>
  );
}

function SocialIcon({ Icon }: { Icon: React.ForwardRefExoticComponent<any> }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: 34, height: 34, borderRadius: '50%',
        border: hovered ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: hovered ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)',
        transition: 'all 0.2s ease', cursor: 'pointer',
      }}
    >
      <Icon size={16} />
    </div>
  );
}

function FooterSection() {
  const cols = [
    {
      header: 'Product',
      links: ['Dashboard', 'Report Issue', 'Volunteer Portal', 'AI Insights', 'Map View', 'Settings'],
    },
    {
      header: 'For NGOs',
      links: ['How It Works', 'Case Studies', 'AI Integration', 'WhatsApp Dispatch', 'API Status', 'Docs'],
    },
    {
      header: 'Company',
      links: ['About VolunteerIQ', 'Solution Challenge 2026', 'DeepCraft Team', 'Privacy Policy', 'Terms', 'Contact'],
    },
  ];

  return (
    <footer
      className="lp-footer"
      style={{
        background: '#050505',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '60px max(40px, calc((100vw - 1180px) / 2)) 32px',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* 4-column grid */}
        <div className="lp-footer-grid">
          {/* Brand column */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ color: 'white', fontSize: 13 }}>✦</span>
              <span style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 16, fontWeight: 700, color: '#fff' }}>VolunteerIQ</span>
            </div>
            <p style={{
              fontFamily: "'Space Grotesk',sans-serif",
              fontSize: 14, color: 'rgba(255,255,255,0.3)',
              lineHeight: 1.7, maxWidth: 240, marginBottom: 20,
            }}>
              AI-powered community coordination for NGOs.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <SocialIcon Icon={Github} />
              <SocialIcon Icon={Twitter} />
              <SocialIcon Icon={Linkedin} />
            </div>
          </div>

          {/* Link columns */}
          {cols.map(col => (
            <div key={col.header}>
              <p style={{
                fontFamily: "'Space Grotesk',sans-serif",
                fontSize: 11, fontWeight: 500, letterSpacing: '0.15em',
                color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase',
                marginBottom: 12,
              }}>{col.header}</p>
              {col.links.map(l => <FooterLink key={l} label={l} />)}
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', margin: '0 0 24px' }} />

        {/* Copyright bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.2)', margin: 0 }}>
            © 2026 VolunteerIQ. Built for Google Solution Challenge 2026 by DeepCraft.
          </p>
          <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: 12, color: 'rgba(255,255,255,0.2)', margin: 0 }}>
            Powered by Gemini AI · Next.js · Google Cloud Run
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
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
    <div style={{
      background: '#080808',
      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)',
      backgroundSize: '32px 32px',
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
      color: '#fff',
    }}>
      {/* ─── Responsive styles for landing page ─────────────── */}
      <style>{`
        /* Section padding */
        .landing-section-inner { padding: 80px 40px; }

        /* 3-column grids (problem cards, how-it-works steps) */
        .lp-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

        /* 2-column grids (features, footer body) */
        .lp-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }

        /* Footer columns */
        .lp-footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 40px; }

        /* Stats row */
        .lp-stats-row { display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 0; }

        /* Sticky navbar links */
        .lp-nav-links { display: flex; gap: 28px; align-items: center; }

        @media (max-width: 767px) {
          .landing-section-inner { padding: 56px 20px; }

          /* Cards stack to 1 column */
          .lp-grid-3 { grid-template-columns: 1fr; gap: 14px; }

          /* Feature rows stack */
          .lp-grid-2 { grid-template-columns: 1fr; gap: 40px; margin-bottom: 60px !important; }

          /* Footer collapses to 2 col */
          .lp-footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }

          /* Stats wrap to 2x2 */
          .lp-stats-row { gap: 0; }

          /* Hide nav links, keep only logo */
          .lp-nav-links { display: none; }

          /* Testimonial card slightly narrower */
          .lp-testimonial-card { width: calc(100vw - 48px) !important; }

          /* Before→After strip */
          .lp-before-after { flex-direction: column; gap: 12px !important; }
          .lp-before-after > div { display: none; } /* hide the lines */

          /* CTA section padding */
          .lp-cta-section { padding: 80px 24px !important; }

          /* Footer padding */
          .lp-footer { padding: 40px 20px 24px !important; }
        }

        @media (max-width: 480px) {
          .lp-footer-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Global overlays */}
      <CursorGlow />
      <ScrollProgress />

      {/* Sections */}
      <main>
        <HeroSection />
        <ProblemSection />
        <ShowcaseSection />
        <HowItWorksSection />
        <FeaturesSection />
        <StatsSection />
        <TestimonialsSection />
        <CTASection />
      </main>

      <FooterSection />
    </div>
  );
}
