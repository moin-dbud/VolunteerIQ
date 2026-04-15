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

// ─── Cookie helper ─────────────────────────────────────────────────────────────
function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return m ? m[2] : null;
}

// ─── Design tokens ─────────────────────────────────────────────────────────────
const ease = [0.25, 0.46, 0.45, 0.94] as const;

// Purple-based palette from reference
const T = {
  bg:         '#0e0e0e',
  surface:    'rgba(38,38,38,0.65)',
  surfaceHov: 'rgba(50,50,50,0.75)',
  surfaceSolid: '#1a1a1a',
  surfaceHigh:  '#262626',
  primary:    '#e08efe',
  secondary:  '#ba92fa',
  primaryDim: '#ce7eec',
  gradient:   'linear-gradient(135deg, #9D50BB 0%, #6E48AA 100%)',
  textGrad:   'linear-gradient(to right, #9D50BB, #e08efe)',
  outlineVar: '#484847',
  onSurfVar:  '#adaaaa',
  glow:       'rgba(157,80,187,0.12)',
  glowStrong: 'rgba(157,80,187,0.2)',
  border:     'rgba(72,72,71,0.7)',
  borderHov:  'rgba(157,80,187,0.35)',
  borderAccent: 'rgba(224,142,254,0.2)',
  fontHead:   "'Manrope', sans-serif",
  fontBody:   "'Inter', sans-serif",
  fontMono:   "'JetBrains Mono', monospace",
};

// ─── Shared animation preset ───────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};
const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

// ─── THREE.JS BACKGROUND ──────────────────────────────────────────────────────
function ThreeBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    import('three').then((THREE) => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      // Rotating icosahedron wireframe
      const geometry = new THREE.IcosahedronGeometry(10, 1);
      const material = new THREE.MeshBasicMaterial({
        color: 0x9D50BB,
        wireframe: true,
        transparent: true,
        opacity: 0.18,
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      // Floating particles
      const particlesGeo = new THREE.BufferGeometry();
      const count = 1500;
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 60;
      particlesGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const particlesMat = new THREE.PointsMaterial({ size: 0.025, color: 0xe08efe, transparent: true, opacity: 0.6 });
      const particles = new THREE.Points(particlesGeo, particlesMat);
      scene.add(particles);

      camera.position.z = 25;

      const animate = () => {
        animId = requestAnimationFrame(animate);
        mesh.rotation.y += 0.002;
        mesh.rotation.x += 0.001;
        particles.rotation.y -= 0.0004;
        renderer.render(scene, camera);
      };
      animate();

      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', onResize);

      return () => {
        window.removeEventListener('resize', onResize);
        cancelAnimationFrame(animId);
        renderer.dispose();
      };
    });

    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 0, pointerEvents: 'none',
      }}
    />
  );
}

// ─── Reusable components ───────────────────────────────────────────────────────

/** Section eyebrow pill badge */
function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: 'rgba(157,80,187,0.1)',
      border: `1px solid ${T.borderAccent}`,
      borderRadius: 999, padding: '5px 14px',
      fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
      textTransform: 'uppercase' as const,
      color: T.secondary,
      fontFamily: T.fontBody,
      marginBottom: 20,
    }}>
      {children}
    </div>
  );
}

/** Glass card with hover */
function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? T.surfaceHov : T.surface,
        border: `1px solid ${hovered ? T.borderHov : T.border}`,
        borderRadius: 12,
        padding: 28,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        transition: 'border-color 0.25s ease, background 0.25s ease, box-shadow 0.25s ease',
        boxShadow: hovered ? `0 0 24px rgba(157,80,187,0.12)` : 'none',
        position: 'relative' as const,
        overflow: 'hidden' as const,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Section wrapper with purple radial glow */
function Section({
  children,
  style,
}: {
  children: React.ReactNode;
  glowPosition?: 'top-left' | 'top-right' | 'bottom-center' | 'center' | 'bottom-right';
  style?: React.CSSProperties;
}) {
  const glowMap: Record<string, string> = {
    'top-left':      `radial-gradient(ellipse 55% 50% at 0% 0%, rgba(157,80,187,0.14) 0%, transparent 70%)`,
    'top-right':     `radial-gradient(ellipse 55% 50% at 100% 0%, rgba(157,80,187,0.14) 0%, transparent 70%)`,
    'bottom-center': `radial-gradient(ellipse 75% 55% at 50% 100%, rgba(157,80,187,0.13) 0%, transparent 70%)`,
    'center':        `radial-gradient(ellipse 65% 60% at 50% 50%, rgba(157,80,187,0.11) 0%, transparent 70%)`,
    'bottom-right':  `radial-gradient(ellipse 55% 50% at 100% 100%, rgba(157,80,187,0.13) 0%, transparent 70%)`,
  };

  return (
    <section style={{ position: 'relative', overflow: 'hidden', ...style }}>
      <div style={{
        position: 'absolute', inset: 0,
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div className="landing-section-inner" style={{ position: 'relative', zIndex: 2, maxWidth: 1100, margin: '0 auto' }}>
        {children}
      </div>
    </section>
  );
}

// ─── CURSOR GLOW ──────────────────────────────────────────────────────────────
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
      background: 'radial-gradient(circle, rgba(157,80,187,0.07) 0%, transparent 65%)',
      transform: `translate(${pos.x - 250}px, ${pos.y - 250}px)`,
      pointerEvents: 'none',
      transition: 'transform 0.12s ease',
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
        height: 2, zIndex: 1000,
        background: T.gradient,
        transformOrigin: 'left',
        scaleX: scrollYProgress,
      }}
    />
  );
}

// ─── GRADIENT TEXT helper ─────────────────────────────────────────────────────
function GradText({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <span style={{
      background: T.textGrad,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      ...style,
    }}>
      {children}
    </span>
  );
}

// ─── SECTION 2: PROBLEM ───────────────────────────────────────────────────────
function ProblemSection() {
  const cards = [
    {
      num: '01',
      icon: <MessageCircle size={26} color={T.primary} />,
      title: '200+ daily messages',
      body: 'Coordinators manually read WhatsApp chains to find urgent needs. Critical issues get buried under logistics chatter.',
    },
    {
      num: '02',
      icon: <UserX size={26} color={T.primary} />,
      title: 'Wrong volunteer, wrong time',
      body: 'Without skill matching, whoever picks up the phone gets dispatched — not the most qualified person for the job.',
    },
    {
      num: '03',
      icon: <EyeOff size={26} color={T.primary} />,
      title: 'Zero visibility',
      body: 'Once an issue is reported verbally, there is no way to track resolution, measure impact, or prevent duplicate responses.',
    },
  ];

  return (
    <Section>
      <motion.div
        variants={staggerParent} initial="hidden"
        whileInView="show" viewport={{ once: true, margin: '-80px' }}
        style={{ textAlign: 'center', marginBottom: 64 }}
      >
        <motion.div variants={fadeUp}>
          <SectionBadge>✦&nbsp;&nbsp;The Problem</SectionBadge>
        </motion.div>
        <motion.h2 variants={fadeUp} style={{
          fontFamily: T.fontHead,
          fontSize: 'clamp(36px, 4.5vw, 52px)',
          fontWeight: 800, lineHeight: 1.15, margin: '0 0 20px',
          color: '#fff',
        }}>
          Community crises lost<br />
          <GradText>in the noise.</GradText>
        </motion.h2>
        <motion.p variants={fadeUp} style={{
          fontSize: 15, color: T.onSurfVar,
          maxWidth: 520, margin: '0 auto',
          fontFamily: T.fontBody, lineHeight: 1.75,
        }}>
          Coordinators spend hours reading WhatsApp chains, calling volunteers
          one by one, and hoping the right person picks up.
        </motion.p>
      </motion.div>

      <motion.div
        variants={staggerParent} initial="hidden"
        whileInView="show" viewport={{ once: true, margin: '-60px' }}
        className="lp-grid-3"
      >
        {cards.map((c) => (
          <motion.div key={c.num} variants={fadeUp}>
            <Card>
              {/* Gradient top accent bar */}
              <div style={{
                position: 'absolute', top: 0, left: 28,
                width: 44, height: 2,
                background: T.gradient,
              }} />
              {/* BG number */}
              <div style={{
                position: 'absolute', top: 16, right: 20,
                fontFamily: T.fontMono,
                fontSize: 52, fontWeight: 700,
                color: 'rgba(224,142,254,0.07)',
                lineHeight: 1, userSelect: 'none',
              }}>
                {c.num}
              </div>
              <div style={{ marginBottom: 14, marginTop: 22 }}>{c.icon}</div>
              <h3 style={{
                fontFamily: T.fontHead,
                fontSize: 19, fontWeight: 700, color: '#fff', marginBottom: 10,
              }}>
                {c.title}
              </h3>
              <p style={{
                fontFamily: T.fontBody,
                fontSize: 14, color: T.onSurfVar,
                lineHeight: 1.75, margin: 0,
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
        className="lp-before-after"
        style={{ display: 'flex', alignItems: 'center', gap: 20, justifyContent: 'center', marginTop: 56, flexWrap: 'wrap' }}
      >
        <span style={{
          fontSize: 12, color: T.onSurfVar, letterSpacing: '0.1em',
          border: `1px solid ${T.outlineVar}`,
          borderRadius: 999, padding: '6px 18px',
          fontFamily: T.fontBody,
        }}>BEFORE</span>
        <div style={{ width: 100, height: 1, background: `linear-gradient(90deg, rgba(157,80,187,0.1), rgba(157,80,187,0.5), rgba(157,80,187,0.1))` }} />
        <span style={{ color: T.secondary, fontSize: 18 }}>→</span>
        <div style={{ width: 100, height: 1, background: `linear-gradient(90deg, rgba(157,80,187,0.5), rgba(157,80,187,0.1))` }} />
        <span style={{
          fontSize: 12, color: T.primary, letterSpacing: '0.1em',
          border: `1px solid ${T.borderAccent}`,
          borderRadius: 999, padding: '6px 18px',
          background: 'rgba(157,80,187,0.1)',
          fontFamily: T.fontBody,
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
  const P = '#ce7eec';
  const statCards = [
    { label: 'TOTAL ISSUES', value: '1,284', color: P },
    { label: 'PENDING',      value: '42',    color: '#ff6e84' },
    { label: 'ASSIGNED',     value: '318',   color: P },
    { label: 'COMPLETED',    value: '924',   color: '#4caf8b' },
  ];
  const rows = [
    { t: 'Flood damage in residential area', c: 'Infrastructure', s: 'PENDING',  sc: '#ff6e84', sb: 'rgba(255,110,132,0.12)' },
    { t: 'Medical supply shortage at clinic', c: 'Health & Welfare', s: 'ASSIGNED', sc: P, sb: 'rgba(157,80,187,0.18)' },
    { t: 'Fallen tree blocking main road',   c: 'Public Safety',    s: 'DONE',    sc: '#4caf8b', sb: 'rgba(76,175,139,0.12)' },
  ];
  return (
    <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12, height: '100%', background: '#0e0e0e' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
        {statCards.map(s => (
          <div key={s.label} style={{ background: T.surfaceSolid, border: `1px solid ${T.outlineVar}40`, borderRadius: 8, padding: '10px 12px' }}>
            <p style={{ fontSize: 8, color: '#767575', letterSpacing: '0.1em', marginBottom: 6, fontFamily: T.fontBody, textTransform: 'uppercase' }}>{s.label}</p>
            <p style={{ fontFamily: T.fontMono, fontSize: 20, color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div style={{ background: T.surfaceSolid, border: `1px solid ${T.outlineVar}40`, borderRadius: 8, overflow: 'hidden', flex: 1 }}>
        <div style={{ padding: '8px 14px', borderBottom: `1px solid ${T.outlineVar}40`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: T.fontHead, fontSize: 12, fontWeight: 700, color: '#fff' }}>Recent Submissions</span>
          <span style={{ fontSize: 10, color: T.primary, fontFamily: T.fontBody }}>View All →</span>
        </div>
        {rows.map((r, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr auto', padding: '9px 14px', borderBottom: i < 2 ? `1px solid ${T.outlineVar}25` : 'none', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 10, color: '#fff', fontFamily: T.fontBody, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.t}</span>
            <span style={{ fontSize: 9, color: T.onSurfVar, fontFamily: T.fontBody }}>{r.c}</span>
            <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 7px', borderRadius: 3, background: r.sb, color: r.sc, whiteSpace: 'nowrap', fontFamily: T.fontBody }}>{r.s}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AIMockup() {
  const P = '#ce7eec';
  return (
    <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 12, background: '#0e0e0e', height: '100%' }}>
      <div style={{ background: T.surfaceSolid, border: `1px solid rgba(157,80,187,0.3)`, borderRadius: 10, padding: 18, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <span style={{ color: P, fontSize: 12 }}>✦</span>
          <span style={{ fontFamily: T.fontHead, fontSize: 12, fontWeight: 700, color: '#fff' }}>Gemini Intelligence Report</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <p style={{ fontSize: 8, color: '#767575', letterSpacing: '0.1em', marginBottom: 5, fontFamily: T.fontBody, textTransform: 'uppercase' }}>Priority</p>
            <span style={{ padding: '3px 9px', borderRadius: 4, background: 'rgba(255,110,132,0.12)', border: '1px solid rgba(255,110,132,0.35)', color: '#ff6e84', fontSize: 9, fontWeight: 700 }}>URGENT</span>
            <p style={{ fontSize: 8, color: '#767575', letterSpacing: '0.1em', marginBottom: 4, fontFamily: T.fontBody, textTransform: 'uppercase', marginTop: 10 }}>Category</p>
            <p style={{ fontFamily: T.fontHead, fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>Health & Welfare</p>
            <p style={{ fontSize: 10, color: T.onSurfVar, fontFamily: T.fontBody, lineHeight: 1.5, marginTop: 6 }}>Critical shortage affecting 200+ patients.</p>
          </div>
          <div>
            <p style={{ fontSize: 8, color: '#767575', letterSpacing: '0.1em', marginBottom: 7, fontFamily: T.fontBody, textTransform: 'uppercase' }}>Best Match</p>
            <div style={{ background: '#262626', border: `1px solid ${T.outlineVar}50`, borderRadius: 7, padding: '8px', display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: '50%', background: T.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff', flexShrink: 0 }}>MC</div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#fff', fontFamily: T.fontHead, marginBottom: 2 }}>Marcus Chen</p>
                <p style={{ fontSize: 9, color: P, fontFamily: T.fontBody }}>Medical · 2.1km</p>
              </div>
            </div>
            <div style={{ height: 3, background: T.outlineVar, borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
              <div style={{ width: '94%', height: '100%', background: T.gradient, borderRadius: 2 }} />
            </div>
            <p style={{ fontSize: 9, color: P, fontFamily: T.fontMono, marginTop: 3 }}>94% accuracy</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MapMockup() {
  const P = '#ce7eec';
  const markers = [
    { x: '28%', y: '42%', c: '#ff6e84' }, { x: '54%', y: '28%', c: '#f59e0b' },
    { x: '70%', y: '58%', c: P },         { x: '40%', y: '67%', c: '#4caf8b' },
    { x: '78%', y: '33%', c: '#ff6e84' }, { x: '20%', y: '24%', c: '#f59e0b' },
    { x: '60%', y: '75%', c: P },         { x: '85%', y: '55%', c: '#4caf8b' },
  ];
  return (
    <div style={{ height: '100%', background: '#0b0b14', position: 'relative', overflow: 'hidden' }}>
      <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0, opacity: 0.1 }}>
        {Array.from({ length: 14 }).map((_, i) => (
          <line key={`v${i}`} x1={`${(i/14)*100}%`} y1="0" x2={`${(i/14)*100}%`} y2="100%" stroke="#484847" strokeWidth="1" />
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={`${(i/9)*100}%`} x2="100%" y2={`${(i/9)*100}%`} stroke="#484847" strokeWidth="1" />
        ))}
      </svg>
      {markers.map((m, i) => (
        <div key={i} style={{ position: 'absolute', left: m.x, top: m.y, transform: 'translate(-50%,-100%)' }}>
          <div style={{ width: 16, height: 16, borderRadius: '50% 50% 50% 0', background: m.c, transform: 'rotate(-45deg)', boxShadow: `0 0 8px ${m.c}90` }} />
        </div>
      ))}
      <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(26,26,26,0.92)', backdropFilter: 'blur(12px)', border: `1px solid ${T.outlineVar}50`, borderRadius: 8, padding: '5px 8px', display: 'flex', gap: 4 }}>
        {['All','🏥','🍽️','🏠','🚨'].map((f,i) => (
          <span key={f} style={{ fontSize: 9, padding: '2px 7px', borderRadius: 3, background: i===0 ? 'rgba(157,80,187,0.2)' : 'transparent', border: `1px solid ${i===0 ? T.secondary : T.outlineVar+'50'}`, color: i===0 ? T.secondary : T.onSurfVar, fontFamily: T.fontBody }}>{f}</span>
        ))}
      </div>
    </div>
  );
}

function VolunteerMockup() {
  const P = '#ce7eec';
  const missions = [
    { t: 'Medical supply delivery to Nagpur clinic', u: 'URGENT', uc: '#ff6e84', ub: 'rgba(255,110,132,0.12)', btn: true },
    { t: 'Flood damage assessment Wardha Rd',        u: 'HIGH',   uc: '#f59e0b', ub: 'rgba(245,158,11,0.12)',  btn: false },
    { t: 'Community food distribution drive',        u: 'MEDIUM', uc: T.onSurfVar, ub: 'rgba(173,170,170,0.08)', btn: false },
  ];
  return (
    <div style={{ padding: 14, display: 'flex', gap: 12, overflow: 'hidden', height: '100%', background: '#0e0e0e' }}>
      <div style={{ width: 190, flexShrink: 0 }}>
        <div style={{ background: T.surfaceSolid, border: `1px solid ${T.outlineVar}50`, borderRadius: 9, padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: T.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>MC</div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: T.fontHead, marginBottom: 3 }}>Marcus Chen</p>
              <span style={{ fontSize: 8, fontWeight: 700, color: '#4caf8b', background: 'rgba(76,175,139,0.1)', padding: '2px 6px', borderRadius: 3 }}>● ACTIVE</span>
            </div>
          </div>
          <div style={{ background: '#0e0e0e', borderRadius: 5, padding: '7px 9px', fontSize: 9, color: T.onSurfVar, fontFamily: T.fontBody, lineHeight: 1.5 }}>Medical Response · Emergency</div>
        </div>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <p style={{ fontFamily: T.fontHead, fontSize: 12, fontWeight: 700, color: '#fff', marginBottom: 9 }}>Available Missions (3)</p>
        {missions.map((m, i) => (
          <div key={i} style={{ background: T.surfaceSolid, border: `1px solid ${T.outlineVar}40`, borderLeft: `3px solid ${m.uc}`, borderRadius: 7, padding: '9px 11px', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: '#fff', fontFamily: T.fontHead, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.t}</p>
              <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: m.ub, color: m.uc }}>{m.u}</span>
            </div>
            <button style={{ fontSize: 9, padding: '4px 9px', borderRadius: 4, background: m.btn ? T.gradient : 'transparent', border: `1px solid ${m.btn ? 'transparent' : T.outlineVar+'60'}`, color: '#fff', cursor: 'default', whiteSpace: 'nowrap', fontFamily: T.fontBody }}>
              {m.btn ? '✓ Apply' : "Available"}
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
    'Dashboard':        'volunteeriq.app/dashboard',
    'AI Insights':      'volunteeriq.app/ai-insights',
    'Map View':         'volunteeriq.app/map',
    'Volunteer Portal': 'volunteeriq.app/volunteer',
  };
  const mockups: Record<TabKey, React.ReactNode> = {
    'Dashboard':        <DashboardMockup />,
    'AI Insights':      <AIMockup />,
    'Map View':         <MapMockup />,
    'Volunteer Portal': <VolunteerMockup />,
  };

  return (
    <Section glowPosition="bottom-center">
      <motion.div
        variants={staggerParent} initial="hidden"
        whileInView="show" viewport={{ once: true, margin: '-80px' }}
        style={{ textAlign: 'center', marginBottom: 48 }}
      >
        <motion.div variants={fadeUp}><SectionBadge>✦&nbsp;&nbsp;The Platform</SectionBadge></motion.div>
        <motion.h2 variants={fadeUp} style={{
          fontFamily: T.fontHead,
          fontSize: 'clamp(36px, 4.5vw, 52px)',
          fontWeight: 800, lineHeight: 1.15, margin: '0 0 20px', color: '#fff',
        }}>
          One dashboard.<br /><GradText>Total command.</GradText>
        </motion.h2>
        <motion.p variants={fadeUp} style={{
          fontSize: 15, color: T.onSurfVar,
          maxWidth: 480, margin: '0 auto', fontFamily: T.fontBody, lineHeight: 1.75,
        }}>
          Everything your team needs — issue intake, AI triage, volunteer dispatch, and live tracking — in a single unified view.
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease }}
      >
        <div
          style={{
            border: `1px solid rgba(157,80,187,0.25)`,
            borderRadius: 14, overflow: 'hidden',
            boxShadow: `0 0 0 1px rgba(157,80,187,0.08), 0 40px 100px rgba(0,0,0,0.8), 0 0 60px rgba(157,80,187,0.06)`,
            maxWidth: 900, margin: '0 auto',
            transition: 'transform 0.8s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.transform = 'perspective(1200px) rotateX(1deg) rotateY(0deg)')}
          onMouseLeave={e => (e.currentTarget.style.transform = 'perspective(1200px) rotateX(6deg) rotateY(-2deg)')}
          ref={el => { if (el) el.style.transform = 'perspective(1200px) rotateX(6deg) rotateY(-2deg)'; }}
        >
          {/* Chrome bar */}
          <div style={{
            background: T.surface, backdropFilter: 'blur(12px)',
            borderBottom: `1px solid ${T.outlineVar}50`,
            height: 40, display: 'flex', alignItems: 'center', padding: '0 16px', gap: 6,
          }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', background: `rgba(157,80,187,${0.2 + i * 0.1})` }} />
            ))}
            <div style={{
              flex: 1, maxWidth: 300,
              background: 'rgba(38,38,38,0.8)', border: `1px solid ${T.outlineVar}50`,
              borderRadius: 6, padding: '4px 12px', margin: '0 auto',
              fontSize: 11, color: T.onSurfVar, fontFamily: T.fontBody, textAlign: 'center',
            }}>
              {urls[tab]}
            </div>
          </div>
          {/* Content */}
          <div style={{ height: 420, background: '#0e0e0e', overflow: 'hidden' }}>
            <motion.div key={tab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ height: '100%' }}>
              {mockups[tab]}
            </motion.div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
          {tabs.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '8px 20px', borderRadius: 999, cursor: 'pointer',
                border: tab === t ? `1px solid ${T.secondary}` : `1px solid ${T.border}`,
                background: tab === t ? 'rgba(157,80,187,0.18)' : 'transparent',
                color: tab === t ? T.primary : T.onSurfVar,
                fontFamily: T.fontBody, fontSize: 13, fontWeight: tab === t ? 600 : 400,
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
      n: '01', icon: <FileText size={24} color={T.primary} />,
      title: 'Issue reported',
      body: 'Submit a structured form — Gemini AI instantly reads it, assigns urgency, and categorizes the problem.',
      tag: '→ Ticket opened. AI triage complete.',
    },
    {
      n: '02', icon: <Sparkles size={24} color={T.primary} />,
      title: 'AI finds the match',
      body: 'Gemini analyzes every available volunteer — skills, proximity, and availability — and surfaces the single best person.',
      tag: '→ Best volunteer identified in seconds.',
    },
    {
      n: '03', icon: <Send size={24} color={T.primary} />,
      title: 'Volunteer dispatched',
      body: 'One click sends a WhatsApp dispatch. Accept or reject — if rejected, Gemini finds the next best match automatically.',
      tag: '→ WhatsApp sent. Mission assigned.',
    },
  ];

  return (
    <Section glowPosition="top-right">
      <motion.div
        variants={staggerParent} initial="hidden"
        whileInView="show" viewport={{ once: true, margin: '-80px' }}
        style={{ textAlign: 'center', marginBottom: 64 }}
      >
        <motion.div variants={fadeUp}><SectionBadge>✦&nbsp;&nbsp;The Process</SectionBadge></motion.div>
        <motion.h2 variants={fadeUp} style={{
          fontFamily: T.fontHead,
          fontSize: 'clamp(36px, 4.5vw, 52px)',
          fontWeight: 800, lineHeight: 1.15, margin: 0, color: '#fff',
        }}>
          From crisis to resolution<br />
          <GradText>in minutes.</GradText>
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
              borderTop: `1px dashed rgba(157,80,187,0.25)`,
              pointerEvents: 'none',
              transform: 'translateX(-100%)',
            }}
          >
            <div style={{
              width: 7, height: 7, borderRadius: '50%',
              background: T.secondary,
              position: 'absolute', top: -3, left: 0,
              boxShadow: `0 0 8px ${T.secondary}`,
              animation: `travel ${2.5 + i * 0.5}s linear infinite`,
            }} />
          </div>
        ))}

        <motion.div
          variants={staggerParent} initial="hidden"
          whileInView="show" viewport={{ once: true, margin: '-60px' }}
          className="lp-grid-3"
        >
          {steps.map(step => (
            <motion.div key={step.n} variants={fadeUp}>
              <Card style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', marginBottom: 16,
                  paddingBottom: 16,
                  borderBottom: `1px solid ${T.outlineVar}40`,
                }}>
                  <span style={{
                    fontFamily: T.fontMono,
                    fontSize: 12, color: T.secondary, fontWeight: 600,
                  }}>{step.n}</span>
                </div>
                <div style={{ marginBottom: 14 }}>{step.icon}</div>
                <h3 style={{
                  fontFamily: T.fontHead,
                  fontSize: 19, fontWeight: 700, color: '#fff', marginBottom: 10,
                }}>{step.title}</h3>
                <p style={{
                  fontFamily: T.fontBody,
                  fontSize: 14, color: T.onSurfVar, lineHeight: 1.75,
                  margin: '0 0 20px', flex: 1,
                }}>{step.body}</p>
                <div style={{
                  display: 'inline-flex', alignItems: 'center',
                  background: 'rgba(157,80,187,0.1)',
                  border: `1px solid ${T.borderAccent}`,
                  borderRadius: 999, padding: '5px 14px',
                  fontSize: 11, color: T.secondary,
                  fontFamily: T.fontBody,
                }}>{step.tag}</div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>

      <style>{`@keyframes travel { from { left: 0; } to { left: 100%; } }`}</style>
    </Section>
  );
}

// ─── SECTION 5: FEATURES ─────────────────────────────────────────────────────
function AIMockupCard() {
  return (
    <div style={{ animation: 'float 4s ease-in-out infinite', willChange: 'transform' }}>
      <div style={{
        background: T.surface,
        border: `1px solid rgba(157,80,187,0.35)`,
        borderRadius: 14, padding: 26,
        backdropFilter: 'blur(12px)',
        maxWidth: 400, margin: '0 auto',
        boxShadow: `0 0 40px rgba(157,80,187,0.15)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <span style={{ color: T.primary, fontSize: 13 }}>✦</span>
          <span style={{ fontFamily: T.fontHead, fontSize: 14, fontWeight: 700, color: '#fff' }}>Gemini Intelligence Report</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div>
            <p style={{ fontSize: 9, color: '#767575', letterSpacing: '0.12em', marginBottom: 6, fontFamily: T.fontBody, textTransform: 'uppercase' }}>Priority</p>
            <span style={{ padding: '4px 11px', borderRadius: 4, background: 'rgba(255,110,132,0.12)', border: '1px solid rgba(255,110,132,0.35)', color: '#ff6e84', fontSize: 10, fontWeight: 700 }}>URGENT</span>
            <p style={{ fontSize: 9, color: '#767575', letterSpacing: '0.12em', marginBottom: 4, fontFamily: T.fontBody, textTransform: 'uppercase', marginTop: 14 }}>Category</p>
            <p style={{ fontFamily: T.fontHead, fontSize: 17, fontWeight: 700, color: '#fff', margin: 0 }}>Emergency Response</p>
            <p style={{ fontSize: 12, color: T.onSurfVar, fontFamily: T.fontBody, lineHeight: 1.5, marginTop: 8 }}>High volume in Sector 4</p>
          </div>
          <div>
            <p style={{ fontSize: 9, color: '#767575', letterSpacing: '0.12em', marginBottom: 10, fontFamily: T.fontBody, textTransform: 'uppercase' }}>Best Volunteer Match</p>
            <div style={{ background: T.surfaceSolid, border: `1px solid ${T.outlineVar}`, borderRadius: 8, padding: '11px', display: 'flex', alignItems: 'center', gap: 9, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: T.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>MC</div>
              <div>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#fff', fontFamily: T.fontHead, marginBottom: 2 }}>Marcus Chen</p>
                <p style={{ fontSize: 10, color: T.primary, fontFamily: T.fontBody }}>Medical Expert · 2km away</p>
              </div>
            </div>
            <div style={{ height: 4, background: T.outlineVar, borderRadius: 2, overflow: 'hidden', marginBottom: 4 }}>
              <div style={{ width: '94%', height: '100%', background: T.gradient, borderRadius: 2 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, color: '#767575', fontFamily: T.fontBody }}>Real-time synthesis</span>
              <span style={{ fontSize: 11, color: T.primary, fontFamily: T.fontMono }}>94%</span>
            </div>
          </div>
        </div>
      </div>
      <style>{`@keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }`}</style>
    </div>
  );
}

function StatsMiniGrid() {
  const stats = [
    { label: 'TOTAL ISSUES', value: '1,284', vc: T.primaryDim },
    { label: 'PENDING',      value: '42',    vc: '#ff6e84', badge: 'URGENT' },
    { label: 'ASSIGNED',     value: '318',   vc: T.primaryDim },
    { label: 'COMPLETED',    value: '924',   vc: '#4caf8b' },
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
        <div key={s.label} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 12, padding: '18px 16px', backdropFilter: 'blur(12px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <p style={{ fontSize: 9, color: '#767575', letterSpacing: '0.12em', fontFamily: T.fontBody, textTransform: 'uppercase', margin: 0 }}>{s.label}</p>
            {s.badge && (
              <span style={{ fontSize: 8, fontWeight: 700, padding: '2px 6px', borderRadius: 3, background: 'rgba(255,110,132,0.12)', border: '1px solid rgba(255,110,132,0.3)', color: '#ff6e84', whiteSpace: 'nowrap', fontFamily: T.fontBody }}>
                {s.badge}
              </span>
            )}
          </div>
          <p style={{ fontFamily: T.fontMono, fontSize: 28, fontWeight: 500, color: s.vc, margin: 0 }}>{s.value}</p>
        </div>
      ))}
    </motion.div>
  );
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      fontSize: 14, color: T.onSurfVar,
      padding: '8px 0',
      borderBottom: `1px solid ${T.outlineVar}30`,
      fontFamily: T.fontBody,
    }}>
      <CheckCircle2 size={16} color={T.secondary} style={{ flexShrink: 0 }} />
      {children}
    </div>
  );
}

function FeaturesSection() {
  return (
    <Section glowPosition="center">
      {/* Sub-section A: AI Matching */}
      <div className="lp-grid-2" style={{ marginBottom: 120 }}>
        <motion.div
          initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7, ease }}
        >
          <SectionBadge>✦&nbsp;&nbsp;Gemini AI Engine</SectionBadge>
          <h3 style={{
            fontFamily: T.fontHead,
            fontSize: 'clamp(30px, 3.5vw, 42px)',
            fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 20,
          }}>
            Intelligent volunteer<br /><GradText>matching.</GradText>
          </h3>
          <p style={{
            fontFamily: T.fontBody,
            fontSize: 15, color: T.onSurfVar,
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
            fontFamily: T.fontHead,
            fontSize: 'clamp(30px, 3.5vw, 42px)',
            fontWeight: 800, color: '#fff', lineHeight: 1.2, marginBottom: 20,
          }}>
            Live dashboard.<br /><GradText>Zero refresh needed.</GradText>
          </h3>
          <p style={{
            fontFamily: T.fontBody,
            fontSize: 15, color: T.onSurfVar,
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
      duration: 2, ease: 'easeOut',
      onUpdate: v => setDisplay(Math.floor(v)),
    });
    return controls.stop;
  }, [inView, to, motionVal]);

  return (
    <span ref={ref} style={{
      fontFamily: T.fontMono,
      fontSize: 'clamp(38px, 5vw, 58px)',
      fontWeight: 500,
      background: T.textGrad,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
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

  return (
    <Section>
      {/* Extra-wide purple glow for this section */}
      <div style={{
        position: 'absolute', inset: 0,
        pointerEvents: 'none', zIndex: 0,
      }} />

      <motion.div
        variants={staggerParent} initial="hidden"
        whileInView="show" viewport={{ once: true, margin: '-60px' }}
        style={{ textAlign: 'center', marginBottom: 64 }}
      >
        <motion.div variants={fadeUp}><SectionBadge>✦&nbsp;&nbsp;Measured Impact</SectionBadge></motion.div>
        <motion.h2 variants={fadeUp} style={{
          fontFamily: T.fontHead,
          fontSize: 'clamp(36px, 4.5vw, 52px)',
          fontWeight: 800, lineHeight: 1.15, margin: 0, color: '#fff',
        }}>
          Numbers that <GradText>matter.</GradText>
        </motion.h2>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }} transition={{ duration: 0.7, ease }}
        className="lp-stats-row"
      >
        {stats.map((s, i) => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center' }}>
            {i > 0 && <div style={{ width: 1, height: 60, margin: '0 40px' }} />}
            <div style={{ textAlign: 'center', padding: '0 24px' }}>
              <CountUp to={s.to} prefix={s.prefix} suffix={s.suffix} />
              <p style={{ fontFamily: T.fontHead, fontSize: 17, fontWeight: 700, color: '#fff', margin: '8px 0 4px' }}>{s.label}</p>
              <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.onSurfVar, margin: 0 }}>{s.sub}</p>
            </div>
          </div>
        ))}
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
        viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.5 }}
        style={{
          textAlign: 'center', marginTop: 48,
          fontSize: 13, color: `${T.onSurfVar}60`,
          fontFamily: T.fontBody,
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
    if (trackRef.current) trackRef.current.scrollBy({ left: dir * 436, behavior: 'smooth' });
  };

  return (
    <Section >
      <motion.div
        variants={staggerParent} initial="hidden"
        whileInView="show" viewport={{ once: true, margin: '-80px' }}
        style={{ textAlign: 'center', marginBottom: 48 }}
      >
        <motion.div variants={fadeUp}><SectionBadge>✦&nbsp;&nbsp;Use Cases</SectionBadge></motion.div>
        <motion.h2 variants={fadeUp} style={{
          fontFamily: T.fontHead,
          fontSize: 'clamp(36px, 4.5vw, 52px)',
          fontWeight: 800, lineHeight: 1.15, margin: 0, color: '#fff',
        }}>
          Built for <GradText>real organizations.</GradText>
        </motion.h2>
      </motion.div>

      <div style={{ position: 'relative' }}>
        <button
          onClick={() => scroll(-1)}
          style={{
            position: 'absolute', left: -20, top: '50%', transform: 'translateY(-50%)',
            zIndex: 10, width: 40, height: 40, borderRadius: '50%',
            background: T.surface, backdropFilter: 'blur(12px)',
            border: `1px solid ${T.border}`,
            color: T.secondary, fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.secondary; e.currentTarget.style.boxShadow = `0 0 12px rgba(157,80,187,0.2)`; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = 'none'; }}
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
                  color: 'rgba(224,142,254,0.1)', lineHeight: 0.8,
                  display: 'block', marginBottom: 16, marginTop: 8,
                }}>"</div>
                <p style={{
                  fontSize: 15, color: T.onSurfVar,
                  lineHeight: 1.8, fontFamily: T.fontBody,
                  margin: '0 0 24px',
                }}>{card.quote}</p>
                <div style={{
                  borderTop: `1px solid ${T.outlineVar}40`,
                  paddingTop: 16, display: 'flex',
                  justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <span style={{ fontSize: 13, color: `${T.onSurfVar}80`, fontFamily: T.fontBody }}>
                    {card.attribution}
                  </span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {Array.from({ length: 5 }).map((_, j) => (
                      <span key={j} style={{ color: T.secondary, fontSize: 11 }}>✦</span>
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
            background: T.surface, backdropFilter: 'blur(12px)',
            border: `1px solid ${T.border}`,
            color: T.secondary, fontSize: 16, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = T.secondary; e.currentTarget.style.boxShadow = `0 0 12px rgba(157,80,187,0.2)`; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = 'none'; }}
        >→</button>
      </div>
    </Section>
  );
}

// ─── CTA SECTION ─────────────────────────────────────────────────────────────
function CTASection() {
  const [b1, setB1] = useState(false);
  const [b2, setB2] = useState(false);

  return (
    <section   style={{ position: 'relative', padding: '160px 40px', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', inset: 0,
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'relative', zIndex: 2, maxWidth: 1100, margin: '0 auto', textAlign: 'center' }}>
        <motion.div variants={staggerParent} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }}>
          <motion.div variants={fadeUp}><SectionBadge>✦&nbsp;&nbsp;Get Started</SectionBadge></motion.div>
          <motion.h2 variants={fadeUp} style={{
            fontFamily: T.fontHead,
            fontSize: 'clamp(40px, 5vw, 60px)',
            fontWeight: 800, lineHeight: 1.1, margin: '0 0 24px', color: '#fff',
          }}>
            Ready to coordinate<br />
            <GradText>at the speed of AI?</GradText>
          </motion.h2>
          <motion.p variants={fadeUp} style={{
            fontSize: 15, color: T.onSurfVar,
            maxWidth: 480, margin: '0 auto 48px',
            fontFamily: T.fontBody, lineHeight: 1.75,
          }}>
            Join NGOs already using VolunteerIQ to deploy volunteers faster, track impact in real time, and ensure no community need goes unmet.
          </motion.p>
          <motion.div variants={fadeUp} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            {/* Primary: signature gradient button */}
            <Link
              href="/signup"
              onMouseEnter={() => setB1(true)}
              onMouseLeave={() => setB1(false)}
              className="btn-hover-scale"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 28px', borderRadius: 8,
                background: T.gradient,
                boxShadow: b1 ? `0 0 24px rgba(157,80,187,0.45)` : `0 0 15px rgba(157,80,187,0.2)`,
                color: '#fff', fontSize: 14, fontWeight: 700,
                fontFamily: T.fontHead, textDecoration: 'none',
                transition: 'all 0.2s ease',
                transform: b1 ? 'scale(1.04)' : 'scale(1)',
              }}
            >
              ✦&nbsp;&nbsp;Launch Command Center
            </Link>
            {/* Secondary: outline */}
            <Link
              href="#demo"
              onMouseEnter={() => setB2(true)}
              onMouseLeave={() => setB2(false)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '13px 28px', borderRadius: 8,
                border: b2 ? `1px solid ${T.secondary}` : `1px solid ${T.border}`,
                background: b2 ? 'rgba(157,80,187,0.12)' : 'transparent',
                color: b2 ? T.primary : T.onSurfVar,
                fontSize: 14, fontWeight: 500,
                fontFamily: T.fontBody, textDecoration: 'none',
                transition: 'all 0.2s ease',
              }}
            >
              → Watch Demo
            </Link>
          </motion.div>
          <motion.p variants={fadeUp} style={{
            fontSize: 12, color: `${T.onSurfVar}60`, fontFamily: T.fontBody,
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
  const [hov, setHov] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'block', fontFamily: T.fontBody, fontSize: 13,
        color: hov ? T.primary : T.onSurfVar,
        textDecoration: 'none', lineHeight: 2.4,
        transition: 'color 0.2s ease', cursor: 'pointer',
      }}
    >
      {label}
    </a>
  );
}

function SocialIcon({ Icon }: { Icon: React.ForwardRefExoticComponent<any> }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 34, height: 34, borderRadius: '50%',
        border: hov ? `1px solid ${T.secondary}` : `1px solid ${T.outlineVar}`,
        background: hov ? 'rgba(157,80,187,0.15)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: hov ? T.primary : T.onSurfVar,
        transition: 'all 0.2s ease', cursor: 'pointer',
      }}
    >
      <Icon size={15} />
    </div>
  );
}

function FooterSection() {
  const cols = [
    { header: 'Product',  links: ['Dashboard', 'Report Issue', 'Volunteer Portal', 'AI Insights', 'Map View', 'Settings'] },
    { header: 'For NGOs', links: ['How It Works', 'Case Studies', 'AI Integration', 'WhatsApp Dispatch', 'API Status', 'Docs'] },
    { header: 'Company',  links: ['About VolunteerIQ', 'Solution Challenge 2026', 'DeepCraft Team', 'Privacy Policy', 'Terms', 'Contact'] },
  ];

  return (
    <footer
      className="lp-footer"
      style={{
        borderTop: `1px solid rgba(157,80,187,0.15)`,
        padding: '60px max(40px, calc((100vw - 1180px) / 2)) 32px',
      }}
    >
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div className="lp-footer-grid">
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <span style={{ background: T.textGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: 22, fontWeight: 800, fontFamily: T.fontHead }}>VolunteerIQ</span>
            </div>
            <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.onSurfVar, lineHeight: 1.7, maxWidth: 240, marginBottom: 20 }}>
              AI-powered community coordination for NGOs.
            </p>
            <p style={{ fontFamily: T.fontBody, fontSize: 11, color: `${T.onSurfVar}60`, marginBottom: 16 }}>
              © 2026 VolunteerIQ Pulse. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <SocialIcon Icon={Github} />
              <SocialIcon Icon={Twitter} />
              <SocialIcon Icon={Linkedin} />
            </div>
          </div>

          {cols.map(col => (
            <div key={col.header}>
              <p style={{
                fontFamily: T.fontBody, fontSize: 11, fontWeight: 600,
                letterSpacing: '0.1em', color: `${T.onSurfVar}60`,
                textTransform: 'uppercase', marginBottom: 12,
              }}>{col.header}</p>
              {col.links.map(l => <FooterLink key={l} label={l} />)}
            </div>
          ))}
        </div>

        <div style={{ borderTop: `1px solid ${T.outlineVar}40`, margin: '40px 0 24px' }} />

        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <p style={{ fontFamily: T.fontBody, fontSize: 11, color: `${T.onSurfVar}50`, margin: 0 }}>
            Built for Google Solution Challenge 2026 by DeepCraft.
          </p>
          <p style={{ fontFamily: T.fontBody, fontSize: 11, color: `${T.onSurfVar}50`, margin: 0 }}>
            Powered by Gemini AI · Next.js · Google Cloud Run
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
const NAV_LINKS = [
  { label: 'Features',    href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Stats',       href: '#stats' },
  { label: 'Testimonials', href: '#testimonials' },
];

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#lp-navbar')) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  return (
    <nav
      id="lp-navbar"
      style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 999,
        height: 60,
        display: 'flex', alignItems: 'center',
        padding: '0 24px',
        background: scrolled ? 'rgba(14,14,14,0.92)' : 'transparent',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(16px)' : 'none',
        borderBottom: scrolled ? `1px solid rgba(72,72,71,0.4)` : '1px solid transparent',
        transition: 'background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease',
      }}
    >
      {/* Inner container */}
      <div style={{
        width: '100%', maxWidth: 1100, margin: '0 auto',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>

        {/* ── Logo (always visible) ── */}
        <a href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            background: T.textGrad,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: 20, fontWeight: 800,
            fontFamily: T.fontHead,
            letterSpacing: '-0.01em',
          }}>
            VolunteerIQ
          </span>
        </a>

        {/* ── Desktop nav links ── */}
        <div className="lp-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          {NAV_LINKS.map(l => (
            <a key={l.label} href={l.href} style={{
              fontFamily: T.fontBody, fontSize: 14, fontWeight: 500,
              color: T.onSurfVar, textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
              onMouseEnter={e => (e.currentTarget.style.color = T.primary)}
              onMouseLeave={e => (e.currentTarget.style.color = T.onSurfVar)}
            >
              {l.label}
            </a>
          ))}
        </div>

        {/* ── Desktop CTA ── */}
        <div className="lp-nav-cta-desktop" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/login" style={{
            fontFamily: T.fontBody, fontSize: 14, fontWeight: 500,
            color: T.onSurfVar, textDecoration: 'none',
            padding: '7px 18px', borderRadius: 7,
            transition: 'color 0.2s ease',
          }}>
            Sign In
          </Link>
          <Link href="/signup" className="btn-hover-scale" style={{
            fontFamily: T.fontBody, fontSize: 14, fontWeight: 600,
            color: '#fff', textDecoration: 'none',
            padding: '8px 20px', borderRadius: 7,
            background: T.gradient,
            boxShadow: '0 0 16px rgba(157,80,187,0.25)',
          }}>
            Get Started
          </Link>
        </div>

        {/* ── Hamburger (mobile only) ── */}
        <button
          className="lp-hamburger"
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          style={{
            display: 'none', // overridden to flex by CSS on mobile
            background: 'transparent',
            border: `1px solid ${menuOpen ? T.borderAccent : T.border}`,
            borderRadius: 8,
            width: 40, height: 40,
            alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            color: menuOpen ? T.primary : T.onSurfVar,
            transition: 'border-color 0.2s ease, color 0.2s ease',
            padding: 0,
            flexShrink: 0,
          }}
        >
          {/* Animated hamburger → X */}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            {menuOpen ? (
              <>
                <line x1="2" y1="2" x2="16" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="16" y1="2" x2="2" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </>
            ) : (
              <>
                <line x1="2" y1="5" x2="16" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="2" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <line x1="2" y1="13" x2="16" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </>
            )}
          </svg>
        </button>
      </div>

      {/* ── Mobile dropdown menu ── */}
      <div className={`lp-mobile-menu${menuOpen ? ' open' : ''}`}>
        {NAV_LINKS.map(l => (
          <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}>
            {l.label}
          </a>
        ))}
        {/* Mobile CTA row */}
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <Link href="/login" onClick={() => setMenuOpen(false)} style={{
            flex: 1, textAlign: 'center',
            fontFamily: T.fontBody, fontSize: 14, fontWeight: 500,
            color: T.onSurfVar, textDecoration: 'none',
            padding: '10px 0', borderRadius: 7,
            border: `1px solid ${T.border}`,
          }}>
            Sign In
          </Link>
          <Link href="/signup" onClick={() => setMenuOpen(false)} style={{
            flex: 1, textAlign: 'center',
            fontFamily: T.fontBody, fontSize: 14, fontWeight: 600,
            color: '#fff', textDecoration: 'none',
            padding: '10px 0', borderRadius: 7,
            background: T.gradient,
          }}>
            Get Started
          </Link>
        </div>
      </div>
    </nav>
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
    <div style={{ background: T.bg, minHeight: '100vh', color: '#fff', position: 'relative' }}>

      {/* Google Fonts for Manrope + Inter — dangerouslySetInnerHTML prevents SSR/client hydration mismatch */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');

        /* Section padding */
        .landing-section-inner { padding: 80px 40px; }

        /* 3-column grids */
        .lp-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

        /* 2-column grids */
        .lp-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: center; }

        /* Footer columns */
        .lp-footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 40px; }

        /* Stats row */
        .lp-stats-row { display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 0; }

        /* Button scale animation */
        .btn-hover-scale { transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .btn-hover-scale:hover { transform: scale(1.05); }
        .btn-hover-scale:active { transform: scale(0.97); }

        /* Mobile nav drawer */
        .lp-mobile-menu {
          display: none;
          position: fixed;
          top: 60px;
          left: 0; right: 0;
          background: rgba(14,14,14,0.97);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(72,72,71,0.5);
          padding: 16px 20px 24px;
          z-index: 998;
          flex-direction: column;
          gap: 4px;
        }
        .lp-mobile-menu.open { display: flex; }
        .lp-mobile-menu a {
          color: #adaaaa;
          text-decoration: none;
          font-family: 'Inter', sans-serif;
          font-size: 15px;
          padding: 12px 8px;
          border-bottom: 1px solid rgba(72,72,71,0.3);
          transition: color 0.2s ease;
        }
        .lp-mobile-menu a:last-child { border-bottom: none; }
        .lp-mobile-menu a:hover { color: #e08efe; }
        .lp-hamburger { display: none; }

        @media (max-width: 767px) {
          .landing-section-inner { padding: 56px 20px; }
          .lp-grid-3 { grid-template-columns: 1fr; gap: 14px; }
          .lp-grid-2 { grid-template-columns: 1fr; gap: 40px; margin-bottom: 60px !important; }
          .lp-footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
          .lp-stats-row { gap: 0; }
          .lp-nav-links { display: none !important; }
          .lp-nav-cta-desktop { display: none !important; }
          .lp-testimonial-card { width: calc(100vw - 48px) !important; }
          .lp-before-after { flex-direction: column; gap: 12px !important; }
          .lp-cta-section { padding: 80px 24px !important; }
          .lp-footer { padding: 40px 20px 24px !important; }
          .lp-hamburger { display: flex !important; }
        }

        @media (max-width: 480px) {
          .lp-footer-grid { grid-template-columns: 1fr; }
        }
      ` }} />

      {/* Three.js canvas background */}
      <ThreeBackground />

      {/* Global overlays */}
      <CursorGlow />
      <ScrollProgress />

      {/* Navbar */}

      {/* Sections */}
      <main style={{ position: 'relative', zIndex: 1 }}>
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