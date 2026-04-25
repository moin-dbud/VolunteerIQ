'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, ArrowLeft, Github, ExternalLink, Sparkles, Users, Map, Brain } from 'lucide-react';

// ─── Design tokens (matches landing page) ────────────────────────────────────
const T = {
  bg:           '#0e0e0e',
  surface:      'rgba(38,38,38,0.65)',
  surfaceSolid: '#1a1a1a',
  surfaceHigh:  '#262626',
  primary:      '#e08efe',
  secondary:    '#ba92fa',
  gradient:     'linear-gradient(135deg, #9D50BB 0%, #6E48AA 100%)',
  textGrad:     'linear-gradient(to right, #9D50BB, #e08efe)',
  outlineVar:   '#484847',
  onSurfVar:    '#adaaaa',
  glow:         'rgba(157,80,187,0.12)',
  border:       'rgba(72,72,71,0.7)',
  borderHov:    'rgba(157,80,187,0.35)',
  borderAccent: 'rgba(224,142,254,0.2)',
  fontHead:     "'Manrope', sans-serif",
  fontBody:     "'Inter', sans-serif",
  fontMono:     "'JetBrains Mono', monospace",
};

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

// ─── Cursor glow ──────────────────────────────────────────────────────────────
function CursorGlow() {
  const [pos, setPos] = useState({ x: -999, y: -999 });
  useEffect(() => {
    const h = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', h);
    return () => window.removeEventListener('mousemove', h);
  }, []);
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: 500, height: 500,
      borderRadius: '50%',
      background: 'radial-gradient(circle, rgba(157,80,187,0.07) 0%, transparent 65%)',
      transform: `translate(${pos.x - 250}px, ${pos.y - 250}px)`,
      pointerEvents: 'none', transition: 'transform 0.12s ease', zIndex: 9999,
    }} />
  );
}

// ─── Three.js Background ──────────────────────────────────────────────────────
function ThreeBackground() {
  useEffect(() => {
    let animId: number;
    const canvas = document.getElementById('demo-bg-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    import('three').then((THREE) => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const geo = new THREE.IcosahedronGeometry(10, 1);
      const mat = new THREE.MeshBasicMaterial({ color: 0x9D50BB, wireframe: true, transparent: true, opacity: 0.12 });
      const mesh = new THREE.Mesh(geo, mat);
      scene.add(mesh);

      const pgeo = new THREE.BufferGeometry();
      const count = 1200;
      const pos = new Float32Array(count * 3);
      for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 60;
      pgeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const pmat = new THREE.PointsMaterial({ size: 0.025, color: 0xe08efe, transparent: true, opacity: 0.5 });
      const particles = new THREE.Points(pgeo, pmat);
      scene.add(particles);

      camera.position.z = 25;
      const animate = () => {
        animId = requestAnimationFrame(animate);
        mesh.rotation.y += 0.002; mesh.rotation.x += 0.001;
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
      return () => { window.removeEventListener('resize', onResize); cancelAnimationFrame(animId); renderer.dispose(); };
    });
    return () => cancelAnimationFrame(animId);
  }, []);
  return (
    <canvas id="demo-bg-canvas" style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      zIndex: 0, pointerEvents: 'none',
    }} />
  );
}

// ─── Gradient text ────────────────────────────────────────────────────────────
function GradText({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      background: T.textGrad,
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    }}>{children}</span>
  );
}

// ─── Section badge ─────────────────────────────────────────────────────────────
function SectionBadge({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 8,
      background: 'rgba(157,80,187,0.1)', border: `1px solid ${T.borderAccent}`,
      borderRadius: 999, padding: '5px 14px',
      fontSize: 11, fontWeight: 600, letterSpacing: '0.12em',
      textTransform: 'uppercase', color: T.secondary,
      fontFamily: T.fontBody, marginBottom: 20,
    }}>{children}</div>
  );
}

// ─── Feature chip ─────────────────────────────────────────────────────────────
const features = [
  { icon: <Brain size={16} />, label: 'Gemini AI Triage' },
  { icon: <Users size={16} />, label: 'Volunteer Matching' },
  { icon: <Map size={16} />, label: 'Live Map Tracking' },
  { icon: <Sparkles size={16} />, label: 'WhatsApp Dispatch' },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DemoPage() {
  const [played, setPlayed] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const h = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <div style={{ background: T.bg, minHeight: '100vh', fontFamily: T.fontBody, overflowX: 'hidden' }}>
      <ThreeBackground />
      <CursorGlow />

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        height: 60,
        background: navScrolled ? 'rgba(14,14,14,0.92)' : 'transparent',
        backdropFilter: navScrolled ? 'blur(16px)' : 'none',
        borderBottom: navScrolled ? `1px solid ${T.border}` : 'none',
        transition: 'background 0.3s ease, border-color 0.3s ease, backdrop-filter 0.3s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px',
      }}>
        <Link href="/" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          textDecoration: 'none', color: '#fff',
          fontFamily: T.fontHead, fontSize: 16, fontWeight: 700,
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: 6,
            background: T.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 800, color: '#fff',
          }}>V</div>
          VolunteerIQ
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            color: T.onSurfVar, textDecoration: 'none',
            fontFamily: T.fontBody, fontSize: 13, fontWeight: 500,
            padding: '7px 14px', borderRadius: 7,
            border: `1px solid ${T.border}`,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = T.borderHov; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.border; (e.currentTarget as HTMLElement).style.color = T.onSurfVar; }}
          >
            <ArrowLeft size={14} />
            Back to Home
          </Link>
          <Link href="/signup" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: T.gradient, color: '#fff', textDecoration: 'none',
            fontFamily: T.fontBody, fontSize: 13, fontWeight: 600,
            padding: '7px 18px', borderRadius: 7,
          }}>
            Get Started
          </Link>
        </div>
      </nav>

      {/* ── Hero + Video ─────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, paddingTop: 120, paddingBottom: 100 }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 40px', textAlign: 'center' }}>

          {/* Radial purple glow behind hero */}
          <div style={{
            position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
            width: 700, height: 400, borderRadius: '50%',
            background: 'radial-gradient(ellipse, rgba(157,80,187,0.18) 0%, transparent 70%)',
            pointerEvents: 'none', zIndex: 0,
          }} />

          <motion.div
            variants={stagger} initial="hidden" animate="show"
            style={{ position: 'relative', zIndex: 2 }}
          >
            <motion.div variants={fadeUp}>
              <SectionBadge>✦&nbsp;&nbsp;Live Demo</SectionBadge>
            </motion.div>

            <motion.h1 variants={fadeUp} style={{
              fontFamily: T.fontHead,
              fontSize: 'clamp(36px, 5vw, 60px)',
              fontWeight: 800, lineHeight: 1.12, color: '#fff',
              margin: '0 0 20px',
            }}>
              See VolunteerIQ<br />
              <GradText>in action.</GradText>
            </motion.h1>

            <motion.p variants={fadeUp} style={{
              fontSize: 16, color: T.onSurfVar, maxWidth: 520, margin: '0 auto 48px',
              fontFamily: T.fontBody, lineHeight: 1.75,
            }}>
              Watch how VolunteerIQ transforms community crisis response — from AI-powered triage
              to real-time volunteer dispatch — all in one unified platform.
            </motion.p>

            {/* ── YouTube Embed ──────────────────────────────────────────── */}
            <motion.div
              variants={fadeUp}
              style={{
                position: 'relative', borderRadius: 16, overflow: 'hidden',
                border: `1px solid rgba(157,80,187,0.3)`,
                boxShadow: `0 0 0 1px rgba(157,80,187,0.08), 0 40px 100px rgba(0,0,0,0.85), 0 0 80px rgba(157,80,187,0.1)`,
                background: '#000', maxWidth: 860, margin: '0 auto',
                aspectRatio: '16 / 9',
                transform: 'perspective(1200px) rotateX(3deg)',
                transition: 'transform 0.6s ease',
              }}
              whileHover={{ scale: 1.01 }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'perspective(1200px) rotateX(0deg)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'perspective(1200px) rotateX(3deg)'; }}
            >
              {/* Chrome bar */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 36,
                background: 'rgba(26,26,26,0.95)', backdropFilter: 'blur(12px)',
                borderBottom: `1px solid ${T.outlineVar}50`,
                display: 'flex', alignItems: 'center', padding: '0 14px', gap: 6,
                zIndex: 10,
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: `rgba(157,80,187,${0.2 + i * 0.1})`,
                  }} />
                ))}
                <div style={{
                  flex: 1, maxWidth: 280,
                  background: 'rgba(38,38,38,0.8)', border: `1px solid ${T.outlineVar}50`,
                  borderRadius: 5, padding: '3px 10px',
                  fontSize: 10, color: T.onSurfVar, fontFamily: T.fontBody, textAlign: 'center',
                  margin: '0 auto',
                }}>
                  youtube.com/watch?v=maIZgAmhv_k
                </div>
              </div>

              {/* Actual YouTube iframe */}
              <iframe
                style={{
                  position: 'absolute', top: 36, left: 0,
                  width: '100%', height: 'calc(100% - 36px)',
                  border: 'none',
                }}
                src={`https://www.youtube.com/embed/maIZgAmhv_k?si=twoOrRbsRPcu2KUC&rel=0&modestbranding=1&color=white`}
                title="VolunteerIQ Demo Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </motion.div>

            {/* Runtime label */}
            <motion.p variants={fadeUp} style={{
              fontSize: 12, color: `${T.onSurfVar}80`,
              fontFamily: T.fontMono, marginTop: 16, letterSpacing: '0.08em',
            }}>
              Full product walkthrough · VolunteerIQ v1.0
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Feature chips ─────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, paddingBottom: 80 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 40px', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, ease }}
            style={{ marginBottom: 32 }}
          >
            <SectionBadge>✦&nbsp;&nbsp;What You'll See</SectionBadge>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.1, ease }}
            style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 }}
          >
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.08, ease }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: 'rgba(157,80,187,0.08)', border: `1px solid ${T.borderAccent}`,
                  borderRadius: 999, padding: '9px 18px',
                  color: T.primary, fontFamily: T.fontBody, fontSize: 13, fontWeight: 500,
                  cursor: 'default',
                  transition: 'all 0.2s ease',
                }}
                whileHover={{ background: 'rgba(157,80,187,0.16)', scale: 1.03 }}
              >
                {f.icon}
                {f.label}
              </motion.div>
            ))}
          </motion.div>

          {/* ── CTA strip ───────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6, ease }}
            style={{
              background: T.surface, backdropFilter: 'blur(16px)',
              border: `1px solid ${T.borderHov}`,
              borderRadius: 16, padding: '40px 48px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 24,
              boxShadow: `0 0 40px rgba(157,80,187,0.08)`,
            }}
          >
            <div style={{ textAlign: 'left' }}>
              <h3 style={{
                fontFamily: T.fontHead, fontSize: 24, fontWeight: 700,
                color: '#fff', margin: '0 0 8px',
              }}>
                Ready to try it yourself?
              </h3>
              <p style={{ fontFamily: T.fontBody, fontSize: 14, color: T.onSurfVar, margin: 0, lineHeight: 1.6 }}>
                Deploy VolunteerIQ for your NGO — free to get started.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <a
                href="https://github.com/volunteeriq"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '11px 22px', borderRadius: 8,
                  background: 'transparent', border: `1px solid ${T.border}`,
                  color: T.onSurfVar, fontFamily: T.fontBody, fontSize: 14, fontWeight: 500,
                  textDecoration: 'none', transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = T.borderHov; (e.currentTarget as HTMLElement).style.color = '#fff'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = T.border; (e.currentTarget as HTMLElement).style.color = T.onSurfVar; }}
              >
                <Github size={16} />
                View on GitHub
              </a>
              <Link
                href="/signup"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '11px 24px', borderRadius: 8,
                  background: T.gradient, color: '#fff',
                  fontFamily: T.fontBody, fontSize: 14, fontWeight: 600,
                  textDecoration: 'none', transition: 'all 0.2s ease',
                  boxShadow: '0 4px 20px rgba(157,80,187,0.35)',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 6px 28px rgba(157,80,187,0.55)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 20px rgba(157,80,187,0.35)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
              >
                <ExternalLink size={15} />
                Get Started Free
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer style={{
        position: 'relative', zIndex: 1,
        borderTop: `1px solid ${T.border}`,
        padding: '28px 40px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12,
        background: 'rgba(14,14,14,0.6)', backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 5, background: T.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 10, fontWeight: 800, color: '#fff',
          }}>V</div>
          <span style={{ fontFamily: T.fontHead, fontSize: 13, fontWeight: 600, color: '#fff' }}>VolunteerIQ</span>
        </div>
        <span style={{ fontFamily: T.fontBody, fontSize: 12, color: `${T.onSurfVar}70` }}>
          © 2025 VolunteerIQ. AI-powered volunteer coordination.
        </span>
        <Link href="/" style={{
          fontFamily: T.fontBody, fontSize: 12, color: T.secondary,
          textDecoration: 'none',
        }}>
          ← Back to homepage
        </Link>
      </footer>

      {/* ── Inline styles ─────────────────────────────────────────────────────── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@600;700;800&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { background: #0e0e0e; color: #fff; overflow-x: hidden; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: #0e0e0e; }
        ::-webkit-scrollbar-thumb { background: #484847; border-radius: 3px; }

        @media (max-width: 700px) {
          nav { padding: 0 20px !important; }
          section > div { padding: 0 20px !important; }
          footer { padding: 20px !important; flex-direction: column; align-items: flex-start !important; }
        }
      `}</style>
    </div>
  );
}
