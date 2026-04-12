'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Clock, PlayCircle } from 'lucide-react';

// ─── Diamond decorative elements ─────────────────────────────────────────────
type Diamond = { top: string; size: number; opacity: number; left?: string; right?: string };

const DIAMONDS: Diamond[] = [
  { top: '15%', left: '8%',   size: 10, opacity: 0.20 },
  { top: '22%', left: '18%',  size: 7,  opacity: 0.12 },
  { top: '12%', right: '10%', size: 12, opacity: 0.18 },
  { top: '35%', right: '7%',  size: 8,  opacity: 0.25 },
  { top: '60%', left: '5%',   size: 9,  opacity: 0.15 },
  { top: '70%', right: '12%', size: 7,  opacity: 0.10 },
  { top: '45%', left: '22%',  size: 6,  opacity: 0.20 },
  { top: '30%', right: '22%', size: 8,  opacity: 0.15 },
  { top: '80%', left: '40%',  size: 5,  opacity: 0.10 },
  { top: '55%', right: '35%', size: 7,  opacity: 0.13 },
];

// ─── Image capsule sources ────────────────────────────────────────────────────
const CAPSULE_URLS = [
  'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=200&h=120&fit=crop&crop=face',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=120&fit=crop',
  'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=200&h=120&fit=crop',
];

// Fallback gradients if Unsplash doesn't load
const CAPSULE_FALLBACKS = [
  'linear-gradient(135deg, #1a1a2e, #9333ea)',
  'linear-gradient(135deg, #0f2027, #203a43)',
  'linear-gradient(135deg, #1a0533, #c026d3)',
];

// ─── Inline image capsule ─────────────────────────────────────────────────────
function ImageCapsule({ src, fallback, alt }: { src: string; fallback: string; alt: string }) {
  const [errored, setErrored] = useState(false);
  return (
    <motion.span
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.4, delay: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
      style={{
        display: 'inline-block',
        width: 88,
        height: 52,
        borderRadius: 999,
        overflow: 'hidden',
        verticalAlign: 'middle',
        position: 'relative',
        top: -4,
        margin: '0 8px',
        border: '1.5px solid rgba(255,255,255,0.15)',
        flexShrink: 0,
        background: errored ? fallback : undefined,
        cursor: 'default',
      }}
    >
      {!errored && (
        <img
          src={src}
          alt={alt}
          onError={() => setErrored(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      )}
    </motion.span>
  );
}

// ─── Sticky Navbar (fixed on scroll) ─────────────────────────────────────────
function StickyNavbar() {
  const [visible, setVisible] = useState(false);
  const navLinks = ['Home', 'Features', 'Impact', 'For NGOs'];

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 999,
        pointerEvents: visible ? 'all' : 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      <nav
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0,
          background: 'rgba(8,8,8,0.75)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 999,
          padding: '10px 20px',
          whiteSpace: 'nowrap',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}
      >
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginRight: 32 }}>
          <span style={{ color: 'white', fontSize: 14, lineHeight: 1 }}>✦</span>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 15, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>
            VolunteerIQ
          </span>
        </Link>
        <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
          {navLinks.map(link => (
            <NavLink key={link} href="#" label={link} />
          ))}
        </div>
      </nav>
    </div>
  );
}

// ─── Pill Navbar (inside hero, absolute) ─────────────────────────────────────
function PillNavbar() {
  const navLinks = ['Home', 'Features', 'Impact', 'For NGOs'];

  return (
    /* Centering wrapper — separate from Framer Motion so transform: translateX(-50%)
       is never clobbered by the y-animation matrix */
    <div style={{
      position: 'absolute',
      top: 24,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 50,
    }}>
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0,
        background: 'rgba(255,255,255,0.04)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 999,
        padding: '10px 20px',
        whiteSpace: 'nowrap',
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
      }}
    >
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', marginRight: 32 }}>
        <span style={{ color: 'white', fontSize: 14, lineHeight: 1 }}>✦</span>
        <span style={{
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 15,
          fontWeight: 700,
          color: '#fff',
          letterSpacing: '-0.01em',
        }}>
          VolunteerIQ
        </span>
      </Link>

      {/* Nav links */}
      <div style={{ display: 'flex', gap: 28, alignItems: 'center' }}>
        {navLinks.map((link) => (
          <NavLink key={link} href="#" label={link} />
        ))}
      </div>
    </motion.nav>
    </div>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        fontFamily: "'DM Sans', sans-serif",
        fontSize: 14,
        color: hovered ? '#fff' : 'rgba(255,255,255,0.55)',
        textDecoration: 'none',
        transition: 'color 0.15s ease',
        cursor: 'pointer',
      }}
    >
      {label}
    </a>
  );
}

// ─── CTA Button ───────────────────────────────────────────────────────────────
function PillButton({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      href={href}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '13px 26px',
        borderRadius: 999,
        border: hovered ? '1px solid rgba(255,255,255,0.35)' : '1px solid rgba(255,255,255,0.18)',
        background: hovered ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        color: hovered ? '#fff' : 'rgba(255,255,255,0.85)',
        fontSize: 14,
        fontWeight: 500,
        fontFamily: "'DM Sans', sans-serif",
        textDecoration: 'none',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {icon}
      {label}
    </Link>
  );
}

// ─── Main Hero Section ────────────────────────────────────────────────────────
export default function HeroSection() {
  return (
    <>
      {/* Sticky navbar — fades in after scrolling past hero */}
      <StickyNavbar />

      <section
        style={{
          minHeight: '100vh',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#080808',
        }}
    >
      {/* ── Dot grid overlay ────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── Center radial glow ───────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          bottom: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70%',
          height: '60%',
          background: 'radial-gradient(ellipse, rgba(55,55,55,0.75) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── Diamond decorators ───────────────────────────────────────────── */}
      {DIAMONDS.map((d, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: d.top,
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

      {/* ── Floating pill navbar ─────────────────────────────────────────── */}
      <PillNavbar />

      {/* ── Hero content ─────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0 24px',
          maxWidth: 960,
          width: '100%',
        }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 999,
            padding: '6px 16px',
            fontSize: 13,
            color: 'rgba(255,255,255,0.65)',
            marginBottom: 36,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          <span style={{ color: 'white', fontSize: 11 }}>✦</span>
          Real-time · AI-Powered · Free for NGOs
        </motion.div>

        {/* ── Headline with inline capsules ─────────────────────────── */}
        <h1
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: 'clamp(48px, 6vw, 76px)',
            fontWeight: 800,
            lineHeight: 1.12,
            color: '#fff',
            margin: 0,
            letterSpacing: '-0.02em',
          }}
        >
          {/* Line 1 */}
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            style={{ display: 'block' }}
          >
            Mobilize the{' '}
            <ImageCapsule
              src={CAPSULE_URLS[0]}
              fallback={CAPSULE_FALLBACKS[0]}
              alt="volunteers"
            />
            {' '}right people,
          </motion.span>

          {/* Line 2 */}
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            style={{ display: 'block' }}
          >
            <ImageCapsule
              src={CAPSULE_URLS[1]}
              fallback={CAPSULE_FALLBACKS[1]}
              alt="community location"
            />
            {' '}right place,
          </motion.span>

          {/* Line 3 */}
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55 }}
            style={{ display: 'block' }}
          >
            right{' '}
            <ImageCapsule
              src={CAPSULE_URLS[2]}
              fallback={CAPSULE_FALLBACKS[2]}
              alt="speed and action"
            />
            {' '}now.
          </motion.span>
        </h1>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          style={{
            display: 'flex',
            gap: 12,
            justifyContent: 'center',
            marginTop: 52,
            flexWrap: 'wrap',
          }}
        >
          <PillButton
            href="/signup"
            icon={<Clock size={15} />}
            label="Launch Command Center"
          />
          <PillButton
            href="#demo"
            icon={<PlayCircle size={15} />}
            label="Watch Demo"
          />
        </motion.div>
      </div>

    </section>
    </>
  );
}
